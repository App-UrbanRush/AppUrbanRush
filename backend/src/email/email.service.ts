import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

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

  async sendMail(dto: SendEmailDto): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'UrbanRush <noreply@urbanrush.com>');

    try {
      await this.transporter.sendMail({
        from,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
      });
      this.logger.log(`Email sent to ${dto.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendMail({
      to,
      subject: 'Bienvenido a UrbanRush',
      html: `
        <h1>Bienvenido ${name}!</h1>
        <p>Tu cuenta ha sido creada exitosamente en UrbanRush.</p>
        <p>Ahora puedes comenzar a disfrutar de nuestros servicios.</p>
      `,
    });
  }

  async sendVerificationEmail(to: string, name: string): Promise<void> {
    await this.sendMail({
      to,
      subject: 'Verificación de identidad - UrbanRush',
      html: `
        <h1>Hola ${name}</h1>
        <p>Tu identidad ha sido verificada exitosamente.</p>
        <p>Ya puedes comenzar a realizar entregas en nuestra plataforma.</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token=${resetToken}`;

    await this.sendMail({
      to,
      subject: 'Recuperar contraseña - UrbanRush',
      html: `
        <h1>Hola ${name}</h1>
        <p>Has solicitado recuperar tu contraseña.</p>
        <p><a href="${resetUrl}">Haz clic aquí para restablecer tu contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    });
  }
}
