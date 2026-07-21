import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PLANS = [
  { value: 'monthly', label: 'Mensual - $40.000', amount: 40000 },
  { value: 'quarterly', label: 'Trimestral - $105.000', amount: 105000 },
  { value: 'single_class', label: 'Clase Suelta - $8.000', amount: 8000 },
  { value: 'ocr_2_days', label: 'Pase 2 dÃ­as OCR - $30.000', amount: 30000 },
  { value: 'hybrid_month', label: 'HÃ­brido Mes - $48.000', amount: 48000 },
] as const;

export type PlanValue = typeof PLANS[number]['value'];

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  list() { return this.prisma.client.payment.findMany({ include: { member: true }, orderBy: { paymentDate: 'desc' } }); }

  async create(memberId: string, plan: string, amount?: number) {
    const m = await this.prisma.client.member.findUnique({ where: { id: memberId } });
    if (!m) throw new NotFoundException('Miembro no encontrado');
    const p = (PLANS as readonly any[]).find((x) => x.value === plan);
    const amt = amount ?? p?.amount ?? 0;
    const fmtDate = (d: Date) => {
      const date = new Date(d);
      date.setMonth(date.getMonth() + (plan === 'quarterly' ? 3 : plan === 'single_class' ? 0 : 1));
      if (plan === 'single_class') {
        date.setDate(date.getDate() + 1);
      }
      return date;
    };
    const expiryDate = fmtDate(new Date());
    const status = plan === 'single_class' ? 'single_class' : 'paid';

    const payment = await this.prisma.client.payment.create({
      data: {
        member: { connect: { id: memberId } },
        plan,
        amount: Number(amt),
      },
    });
    await this.prisma.client.member.update({
      where: { id: memberId },
      data: { expiryDate, status, lastPaymentDate: payment.paymentDate },
    });
    return payment;
  }

  async delete(id: string) { return this.prisma.client.payment.delete({ where: { id } }); }

  monthly(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return this.prisma.client.payment.findMany({
      where: { paymentDate: { gte: start, lte: end } },
      include: { member: { include: { profile: true } } },
      orderBy: { paymentDate: 'desc' },
    });
  }
}