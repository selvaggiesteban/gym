import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT', 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('SMTP configured');
    } else {
      this.logger.warn('SMTP not configured — emails will be logged to console');
    }
  }

  async sendPasswordReset(email: string, resetToken: string, frontendUrl: string): Promise<void> {
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #e8ecf1; border-radius: 16px;">
        <h1 style="color: #2d3436; text-align: center; margin-bottom: 24px;">GYM</h1>
        <h2 style="color: #2d3436; text-align: center; font-weight: 600;">Restablecer contrasena</h2>
        <p style="color: #636e72; text-align: center; line-height: 1.6;">
          Recibimos una solicitud para restablecer tu contrasena.
          Haz clic en el boton de abajo para crear una nueva.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; background: #2d3436; color: #ffffff; text-decoration: none;
                    padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px;">
            Restablecer Contrasena
          </a>
        </div>
        <p style="color: #b2bec3; text-align: center; font-size: 13px;">
          Este link expira en 15 minutos. Si no solicitaste este cambio, ignora este email.
        </p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM', '"GYM" <noreply@gym.com>'),
        to: email,
        subject: 'Restablecer contrasena - GYM',
        html,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } else {
      this.logger.warn(`[DEV] Password reset link for ${email}: ${resetUrl}`);
    }
  }
}
