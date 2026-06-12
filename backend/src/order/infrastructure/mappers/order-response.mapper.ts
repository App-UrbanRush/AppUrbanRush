import { OrderModel } from '../../domain/entities/order.model';

/**
 * Serializa un OrderModel para respuesta HTTP controlando la visibilidad
 * del código de entrega. Por defecto el `delivery_code` NUNCA se expone;
 * solo se incluye cuando el llamador lo autoriza explícitamente
 * (usuario dueño, domiciliario asignado en IN_DELIVERY, o admin).
 */
export class OrderResponseMapper {
  static toResponse(order: OrderModel, opts: { includeCode?: boolean } = {}) {
    const { delivery_code, ...rest } = order;
    return opts.includeCode ? { ...rest, delivery_code } : rest;
  }

  /** El domiciliario solo ve el código de SUS pedidos en estado IN_DELIVERY. */
  static toCourierResponse(order: OrderModel, courierId: number) {
    const includeCode =
      order.courier_id === courierId && order.status === 'IN_DELIVERY';
    return this.toResponse(order, { includeCode });
  }
}
