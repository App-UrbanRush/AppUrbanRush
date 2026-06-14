import { Injectable } from '@nestjs/common';
import {
  Notification,
  NotificationChannel,
  NotificationLevel,
  NotificationTemplates,
} from '../../domain/entities/notification.model';
import {
  INotificationNode,
  NotificationGroup,
  NotificationLeaf,
} from '../../domain/structures/notification-composite';
import { NotifierFactory } from './notifier-factory';

/**
 * Patrón Bridge: desacopla la ABSTRACCIÓN (qué notificar — el tipo de
 * evento de negocio) de la IMPLEMENTACIÓN (cómo se entrega — canal).
 *
 * El emisor llama `notify(template, userIds, channel)`. El bridge se
 * encarga de clonar el template (Prototype), envolverlo en un Composite
 * y delegar al notificador concreto que la factoría devuelve.
 */
@Injectable()
export class NotificationBridge {
  constructor(private readonly factory: NotifierFactory) {}

  async notify(
    templateKey: keyof typeof NotificationTemplates,
    targetUserIds: number[],
    channel: NotificationChannel = 'SOCKET',
    overrides?: { body?: string; level?: NotificationLevel; data?: Record<string, unknown> },
  ): Promise<void> {
    const template = NotificationTemplates[templateKey];
    const clone = template.clone({ targetUserIds, channel, ...overrides });

    const node: INotificationNode = new NotificationLeaf(clone);
    const adapter = this.factory.create(channel);
    await node.dispatch(adapter);
  }

  /**
   * Broadcast a varios usuarios por varios canales en paralelo.
   * Demuestra Composite + Async concurrente.
   */
  async broadcast(notification: Notification, channels: NotificationChannel[]): Promise<void> {
    const group = new NotificationGroup();
    for (const ch of channels) {
      group.add(new NotificationLeaf(notification.clone({ channel: ch })));
    }
    // Despacho concurrente — un canal lento no bloquea a los demás.
    await Promise.all(
      channels.map((ch) => group.dispatch(this.factory.create(ch))),
    );
  }
}
