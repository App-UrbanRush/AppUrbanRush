import { ICommand } from './command.interface';
import { NotificationBridge } from '../../infrastructure/services/notification-bridge';
import { Notification } from '../../domain/entities/notification.model';

export interface BroadcastAlertInput {
  userIds: number[];
  title: string;
  body: string;
  issuedBy: string;
}

/**
 * Comando concreto: broadcast de alerta administrativa.
 *
 * - execute(): emite por SOCKET + EMAIL en paralelo (Composite/Bridge).
 * - undo(): emite una contra-notificación marcando la alerta como retractada.
 *
 * El estado interno (`alertId`) se setea en execute() para que el undo
 * pueda referenciar la alerta original.
 */
export class BroadcastAlertCommand implements ICommand<{ alertId: string; sentTo: number }> {
  readonly name: string;
  private alertId: string | null = null;

  constructor(
    private readonly bridge: NotificationBridge,
    private readonly input: BroadcastAlertInput,
  ) {
    this.name = `BroadcastAlert(${input.issuedBy})`;
  }

  async execute(): Promise<{ alertId: string; sentTo: number }> {
    this.alertId = `alert-${Date.now()}`;
    const notification = new Notification({
      title: this.input.title,
      body: this.input.body,
      level: 'WARN',
      channel: 'SOCKET',
      targetUserIds: this.input.userIds,
      data: { alertId: this.alertId, issuedBy: this.input.issuedBy },
    });

    await this.bridge.broadcast(notification, ['SOCKET', 'EMAIL']);
    return { alertId: this.alertId, sentTo: this.input.userIds.length };
  }

  async undo(): Promise<void> {
    if (!this.alertId) throw new Error('No se puede deshacer: comando no ejecutado');
    const retraction = new Notification({
      title: 'Alerta retractada',
      body: `Se ha cancelado una alerta previa.`,
      level: 'INFO',
      channel: 'SOCKET',
      targetUserIds: this.input.userIds,
      data: { retractedAlertId: this.alertId },
    });
    await this.bridge.broadcast(retraction, ['SOCKET']);
  }
}
