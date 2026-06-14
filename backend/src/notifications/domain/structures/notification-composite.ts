/**
 * Patrón Composite — un INotificationNode trata uniformemente a una
 * notificación individual y a un grupo (broadcast a varios usuarios).
 *
 * Esto permite que el orquestador (NotificationOrchestrator) llame a
 * `.dispatch(notifier)` sin saber si es una hoja o un nodo compuesto.
 */
import { Notification } from '../entities/notification.model';

export interface INotifierAdapter {
  send(notification: Notification): Promise<void>;
}

export interface INotificationNode {
  dispatch(notifier: INotifierAdapter): Promise<void>;
}

/** Hoja: una sola notificación. */
export class NotificationLeaf implements INotificationNode {
  constructor(private readonly notification: Notification) {}

  async dispatch(notifier: INotifierAdapter): Promise<void> {
    await notifier.send(this.notification);
  }
}

/** Composite: una colección de nodos que se despachan en paralelo. */
export class NotificationGroup implements INotificationNode {
  private readonly children: INotificationNode[] = [];

  add(node: INotificationNode): this {
    this.children.push(node);
    return this;
  }

  async dispatch(notifier: INotifierAdapter): Promise<void> {
    // Despacho en paralelo — Promise.all aprovecha la I/O concurrente.
    await Promise.all(this.children.map((c) => c.dispatch(notifier)));
  }

  get size(): number {
    return this.children.length;
  }
}
