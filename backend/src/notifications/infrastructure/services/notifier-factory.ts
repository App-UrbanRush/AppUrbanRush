import { Injectable } from '@nestjs/common';
import { INotifierAdapter } from '../../domain/structures/notification-composite';
import { NotificationChannel } from '../../domain/entities/notification.model';
import { SocketNotifier } from './socket-notifier';
import { EmailNotifier } from './email-notifier';
import { PushNotifier } from './push-notifier';

/**
 * Abstract Factory: dado un canal, devuelve el notificador concreto.
 *
 * - SOCKET → SocketNotifier (Socket.IO)
 * - EMAIL  → EmailNotifier  (SMTP stub)
 * - PUSH   → PushNotifier   (FCM/OneSignal stub)
 *
 * Permite que el orquestador no conozca las implementaciones — solo el
 * canal, y la factoría resuelve qué adapter crear.
 */
@Injectable()
export class NotifierFactory {
  constructor(
    private readonly socket: SocketNotifier,
    private readonly email: EmailNotifier,
    private readonly push: PushNotifier,
  ) {}

  create(channel: NotificationChannel): INotifierAdapter {
    switch (channel) {
      case 'SOCKET': return this.socket;
      case 'EMAIL':  return this.email;
      case 'PUSH':   return this.push;
      default:
        throw new Error(`Canal de notificación no soportado: ${channel}`);
    }
  }
}
