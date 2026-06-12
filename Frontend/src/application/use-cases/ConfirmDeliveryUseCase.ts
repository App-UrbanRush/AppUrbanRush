import type { ICourierOrdersRepository } from "../../domain/interfaces/ICourierOrdersRepository";
import type { CourierOrder } from "../../domain/types/courier-orders.types";

/**
 * El domiciliario confirma la entrega de un pedido IN_DELIVERY ingresando
 * el código de 4 dígitos que le da el cliente.
 */
export class ConfirmDeliveryUseCase {
  constructor(private readonly repo: ICourierOrdersRepository) {}

  async execute(
    orderId: string,
    deliveryCode: string,
    courierId: number,
  ): Promise<CourierOrder> {
    return this.repo.confirmDelivery(orderId, deliveryCode, courierId);
  }
}
