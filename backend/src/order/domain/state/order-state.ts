/**
 * Patrón State — cada estado del pedido es una clase con sus reglas de
 * transición y sus acciones disponibles. Reemplaza la sopa de `if/switch`
 * que vive regada en los controllers.
 *
 * Una OrderStateMachine consulta `canTransitionTo` antes de cambiar el
 * estado, y `nextActions` para que el UI sepa qué botones mostrar.
 */

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type Actor = 'CUSTOMER' | 'VENDOR' | 'COURIER' | 'SYSTEM';

export interface OrderAction {
  name: string;
  actor: Actor;
  to: OrderStatus;
}

export abstract class OrderState {
  abstract readonly status: OrderStatus;
  abstract canTransitionTo(next: OrderStatus, actor: Actor): boolean;
  abstract nextActions(): OrderAction[];

  isFinal(): boolean {
    return this.status === 'DELIVERED' || this.status === 'CANCELLED';
  }
}

export class PendingState extends OrderState {
  readonly status = 'PENDING';
  canTransitionTo(next: OrderStatus, actor: Actor): boolean {
    if (next === 'ACCEPTED' && actor === 'VENDOR') return true;
    if (next === 'CANCELLED' && (actor === 'CUSTOMER' || actor === 'SYSTEM')) return true;
    return false;
  }
  nextActions(): OrderAction[] {
    return [
      { name: 'Aceptar pedido', actor: 'VENDOR', to: 'ACCEPTED' },
      { name: 'Cancelar', actor: 'CUSTOMER', to: 'CANCELLED' },
    ];
  }
}

export class AcceptedState extends OrderState {
  readonly status = 'ACCEPTED';
  canTransitionTo(next: OrderStatus, actor: Actor): boolean {
    return next === 'PREPARING' && actor === 'VENDOR';
  }
  nextActions(): OrderAction[] {
    return [{ name: 'Iniciar preparación', actor: 'VENDOR', to: 'PREPARING' }];
  }
}

export class PreparingState extends OrderState {
  readonly status = 'PREPARING';
  canTransitionTo(next: OrderStatus, actor: Actor): boolean {
    return next === 'READY' && actor === 'VENDOR';
  }
  nextActions(): OrderAction[] {
    return [{ name: 'Marcar como listo', actor: 'VENDOR', to: 'READY' }];
  }
}

export class ReadyState extends OrderState {
  readonly status = 'READY';
  canTransitionTo(next: OrderStatus, actor: Actor): boolean {
    return next === 'IN_DELIVERY' && actor === 'COURIER';
  }
  nextActions(): OrderAction[] {
    return [{ name: 'Aceptar entrega', actor: 'COURIER', to: 'IN_DELIVERY' }];
  }
}

export class InDeliveryState extends OrderState {
  readonly status = 'IN_DELIVERY';
  canTransitionTo(next: OrderStatus, actor: Actor): boolean {
    if (next === 'DELIVERED' && actor === 'COURIER') return true;
    if (next === 'READY' && actor === 'COURIER') return true; // cancelar
    return false;
  }
  nextActions(): OrderAction[] {
    return [
      { name: 'Confirmar entrega', actor: 'COURIER', to: 'DELIVERED' },
      { name: 'Devolver a disponibles', actor: 'COURIER', to: 'READY' },
    ];
  }
}

export class DeliveredState extends OrderState {
  readonly status = 'DELIVERED';
  canTransitionTo(): boolean { return false; }
  nextActions(): OrderAction[] { return []; }
}

export class CancelledState extends OrderState {
  readonly status = 'CANCELLED';
  canTransitionTo(): boolean { return false; }
  nextActions(): OrderAction[] { return []; }
}

/** Factory del State (también encaja como Factory Method). */
export class OrderStateFactory {
  private static readonly registry: Record<OrderStatus, () => OrderState> = {
    PENDING:     () => new PendingState(),
    ACCEPTED:    () => new AcceptedState(),
    PREPARING:   () => new PreparingState(),
    READY:       () => new ReadyState(),
    IN_DELIVERY: () => new InDeliveryState(),
    DELIVERED:   () => new DeliveredState(),
    CANCELLED:   () => new CancelledState(),
  };

  static from(status: OrderStatus): OrderState {
    const factory = OrderStateFactory.registry[status];
    if (!factory) throw new Error(`Estado de pedido desconocido: ${status}`);
    return factory();
  }
}
