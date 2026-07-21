import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoticesService {
  constructor(private prisma: PrismaService) {}

  list() { return this.prisma.client.notice.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); }

  create(data: { title: string; message: string }) {
    return this.prisma.client.notice.create({ data });
  }

  update(id: string, data: { title?: string; message?: string }) {
    return this.prisma.client.notice.update({ where: { id }, data });
  }

  delete(id: string) { return this.prisma.client.notice.delete({ where: { id } }); }
}