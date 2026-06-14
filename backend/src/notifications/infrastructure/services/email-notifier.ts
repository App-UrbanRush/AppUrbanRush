import { Injectable, Logger } from '@nestjs/common';
import { INotifierAdapter } from '../../domain/structures/notification-composite';
import { Notification } from '../../domain/entities/notification.model';

/**
 * Notificador por correo (concreto del Abstract Factory).
 * En esta entrega solo loguea — la lógica real de SMTP vive en EmailModule.
 * La separación canal/transporte (Bridge) está en NotificationBridge.
 */
@Injectable()
export class EmailNotifier implements INotifierAdapter {
  private readonly logger = new Logger(EmailNotifier.name);

  async send(notification: Notification): Promise<void> {
    // Stub — emularía el envío SMTP. En producción se delegaría al EmailModule.
    this.logger.log(
      `[EMAIL ${notification.level}] "${notification.title}" → users=${notification.targetUserIds.join(',')}`,
    );
  }
}
