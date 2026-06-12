import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private compileTemplate(templateName: string, context: Record<string, any>): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const compiled = handlebars.compile(templateSource);
    return compiled(context);
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
    attachments?: nodemailer.Attachment[];
  }): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'UrbanRush <noreply@urbanrush.com>');

    try {
      const html = this.compileTemplate(options.template, options.context);
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
      });
      this.logger.log(`Email [${options.template}] enviado a ${options.to}`);
    } catch (error) {
      this.logger.error(`Error enviando email [${options.template}] a ${options.to}`, error.message);
      // No relanzamos — el email no debe bloquear el flujo principal
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const logoPath = path.join(__dirname, 'templates', 'assets', 'logo-urbanrush.png');
    await this.sendMail({
      to,
      subject: '¡Bienvenido a UrbanRush! 🚀',
      template: 'welcome',
      context: { name },
      attachments: [
        { filename: 'logo-urbanrush.png', path: logoPath, cid: 'logo-urbanrush' },
      ],
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetCode: string): Promise<void> {
    const logoPath = path.join(__dirname, 'templates', 'assets', 'logo-urbanrush.png');

    await this.sendMail({
      to,
      subject: 'Código de recuperación — UrbanRush',
      template: 'reset-password',
      context: {
        name,      // El nombre real que le enviaremos desde el Caso de Uso
        resetCode  // El código de 6 números
      },
      attachments: [
        { filename: 'logo-urbanrush.png', path: logoPath, cid: 'logo-urbanrush' },
      ],
    });
  }

  async sendPayoutSuccessEmail(to: string, ctx: {
    name: string;
    amount: string;
    reference: string;
    bank_name: string;
    account_masked: string;
    concept: string;
    date: string;
  }): Promise<void> {
    const logoPath = path.join(__dirname, 'templates', 'assets', 'logo-urbanrush.png');
    await this.sendMail({
      to,
      subject: '¡Transferencia recibida! — UrbanRush',
      template: 'payout-success',
      context: ctx,
      attachments: [
        { filename: 'logo-urbanrush.png', path: logoPath, cid: 'logo-urbanrush' },
      ],
    });
  }

  async sendPayoutFailedEmail(to: string, ctx: {
    name: string;
    amount: string;
    reference: string;
    bank_name: string;
    account_masked: string;
    reason: string;
  }): Promise<void> {
    const logoPath = path.join(__dirname, 'templates', 'assets', 'logo-urbanrush.png');
    await this.sendMail({
      to,
      subject: 'Tu transferencia no pudo completarse — UrbanRush',
      template: 'payout-failed',
      context: ctx,
      attachments: [
        { filename: 'logo-urbanrush.png', path: logoPath, cid: 'logo-urbanrush' },
      ],
    });
  }

  async sendWeeklyLiquidationSummary(to: string, ctx: {
    name: string;
    week_start: string;
    week_end: string;
    total_amount: string;
    operations_label: string;
    operations_count: number;
    commission_total?: string;
  }): Promise<void> {
    const logoPath = path.join(__dirname, 'templates', 'assets', 'logo-urbanrush.png');
    await this.sendMail({
      to,
      subject: 'Resumen semanal de liquidación — UrbanRush',
      template: 'weekly-liquidation-summary',
      context: ctx,
      attachments: [
        { filename: 'logo-urbanrush.png', path: logoPath, cid: 'logo-urbanrush' },
      ],
    });
  }

  async sendDeliveryFailureAlert(to: string, ctx: {
    order_id: string;
    courier_id: number | null;
    attempts: number;
  }): Promise<void> {
    const logoPath = path.join(__dirname, 'templates', 'assets', 'logo-urbanrush.png');
    await this.sendMail({
      to,
      subject: 'Entrega bloqueada por código fallido — UrbanRush',
      template: 'delivery-failure-alert',
      context: ctx,
      attachments: [
        { filename: 'logo-urbanrush.png', path: logoPath, cid: 'logo-urbanrush' },
      ],
    });
  }
}