import { Injectable } from '@nestjs/common';
import { INotifierAdapter } from '../../domain/structures/notification-composite';
import { Notification } from '../../domain/entities/notification.model';
import { NotificationsGateway } from '../gateways/notifications.gateway';

/**
 * Adapter (patrón Adapter) que traduce una Notification del dominio al
 * formato que entiende el WebSocket gateway. Concreto del Abstract Factory.
 */
@Injectable()
export class SocketNotifier implements INotifierAdapter {
  constructor(private readonly gateway: NotificationsGateway) {}

  async send(notification: Notification): Promise<void> {
    await this.gateway.emitToUsers(notification.targetUserIds, {
      title: notification.title,
      body: notification.body,
      level: notification.level,
      data: notification.data ?? {},
      createdAt: notification.createdAt.toISOString(),
    });
  }
}
