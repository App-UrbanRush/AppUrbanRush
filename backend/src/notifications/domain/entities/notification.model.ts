/**
 * Modelo de notificación que implementa el patrón Prototype.
 *
 * Permite tener "templates" base ya configurados (ej. "pedido aceptado",
 * "archivo cifrado eliminado") y clonarlos sobre la marcha modificando
 * solo los campos que cambian, sin recrear toda la estructura.
 */

export type NotificationLevel = 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
export type NotificationChannel = 'SOCKET' | 'EMAIL' | 'PUSH';

export interface NotificationPayload {
  title: string;
  body: string;
  level: NotificationLevel;
  channel: NotificationChannel;
  targetUserIds: number[];
  data?: Record<string, unknown>;
  createdAt?: Date;
}

export class Notification implements NotificationPayload {
  title: string;
  body: string;
  level: NotificationLevel;
  channel: NotificationChannel;
  targetUserIds: number[];
  data?: Record<string, unknown>;
  createdAt: Date;

  constructor(payload: NotificationPayload) {
    this.title = payload.title;
    this.body = payload.body;
    this.level = payload.level;
    this.channel = payload.channel;
    this.targetUserIds = [...payload.targetUserIds];
    this.data = payload.data ? { ...payload.data } : undefined;
    this.createdAt = payload.createdAt ?? new Date();
  }

  /**
   * Patrón Prototype: clona la notificación con overrides opcionales.
   * Útil para reutilizar un template y solo cambiar el destinatario o el body.
   */
  clone(overrides: Partial<NotificationPayload> = {}): Notification {
    return new Notification({
      title: overrides.title ?? this.title,
      body: overrides.body ?? this.body,
      level: overrides.level ?? this.level,
      channel: overrides.channel ?? this.channel,
      targetUserIds: overrides.targetUserIds ?? this.targetUserIds,
      data: overrides.data ?? (this.data ? { ...this.data } : undefined),
      createdAt: new Date(),
    });
  }
}

/** Registro central de templates pre-armados (Prototype registry). */
export const NotificationTemplates = {
  orderAccepted: new Notification({
    title: 'Tu pedido fue aceptado',
    body: 'Un domiciliario está en camino al restaurante.',
    level: 'SUCCESS',
    channel: 'SOCKET',
    targetUserIds: [],
  }),

  orderDelivered: new Notification({
    title: 'Pedido entregado',
    body: 'Esperamos que disfrutes tu pedido.',
    level: 'SUCCESS',
    channel: 'SOCKET',
    targetUserIds: [],
  }),

  fileDeleted: new Notification({
    title: 'Archivo cifrado eliminado',
    body: 'Se eliminó un archivo del repositorio cifrado.',
    level: 'INFO',
    channel: 'SOCKET',
    targetUserIds: [],
  }),

  adminAlert: new Notification({
    title: 'Alerta administrativa',
    body: 'Se detectó un evento que requiere tu atención.',
    level: 'WARN',
    channel: 'SOCKET',
    targetUserIds: [],
  }),

  vendorOrderUpdate: new Notification({
    title: 'Estado del pedido actualizado',
    body: 'El pedido cambió de estado.',
    level: 'INFO',
    channel: 'SOCKET',
    targetUserIds: [],
  }),

  customerOrderUpdate: new Notification({
    title: 'Tu pedido fue actualizado',
    body: 'El estado de tu pedido ha cambiado.',
    level: 'INFO',
    channel: 'SOCKET',
    targetUserIds: [],
  }),
};
