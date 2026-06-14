import { BadRequestException, Injectable } from '@nestjs/common';
import { Actor, OrderStateFactory, OrderStatus } from './order-state';

/**
 * Orquestador del patrón State. Valida transiciones y expone las
 * acciones disponibles para un estado dado.
 *
 * Es Singleton (por @Injectable) — se inyecta donde haga falta validar.
 */
@Injectable()
export class OrderStateMachine {
  /** Lanza BadRequest si la transición no es válida para el actor. */
  assertCanTransition(from: OrderStatus, to: OrderStatus, actor: Actor): void {
    const state = OrderStateFactory.from(from);
    if (!state.canTransitionTo(to, actor)) {
      throw new BadRequestException(
        `Transición inválida: ${from} → ${to} no permitida para ${actor}`,
      );
    }
  }

  /** Acciones que el actor actual puede ejecutar sobre el estado dado. */
  availableActions(status: OrderStatus, actor?: Actor) {
    const state = OrderStateFactory.from(status);
    const all = state.nextActions();
    return actor ? all.filter((a) => a.actor === actor) : all;
  }

  isFinal(status: OrderStatus): boolean {
    return OrderStateFactory.from(status).isFinal();
  }
}
