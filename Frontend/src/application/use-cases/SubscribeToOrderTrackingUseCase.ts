import type { ITrackingGateway } from "../../domain/interfaces/ITrackingGateway";

/**
 * Visor (usuario/negocio/admin): se conecta y suscribe al tracking de un pedido.
 */
export class SubscribeToOrderTrackingUseCase {
  constructor(private readonly gateway: ITrackingGateway) {}

  execute(token: string, orderId: string): void {
    if (!this.gateway.isConnected()) {
      this.gateway.connect(token);
    }
    this.gateway.subscribeToOrder(orderId);
  }
}
