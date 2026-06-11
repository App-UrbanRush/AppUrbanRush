import type { ITrackingRepository } from "../../domain/interfaces/ITrackingRepository";
import type { OrderTracking } from "../../domain/types/tracking.types";

/**
 * Fallback REST: obtiene la última ubicación conocida del pedido.
 * Se usa al cargar la pantalla y como respaldo si el WebSocket falla.
 */
export class GetLastLocationUseCase {
  constructor(private readonly trackingRepository: ITrackingRepository) {}

  async execute(orderId: string): Promise<OrderTracking> {
    return this.trackingRepository.getOrderTracking(orderId);
  }
}
