import type { ITrackingGateway } from "../../domain/interfaces/ITrackingGateway";
import type { LocationUpdateInput } from "../../domain/types/tracking.types";

/**
 * Domiciliario: emite su ubicación actual al backend vía WebSocket.
 */
export class SendCourierLocationUseCase {
  constructor(private readonly gateway: ITrackingGateway) {}

  execute(input: LocationUpdateInput): void {
    this.gateway.sendLocation(input);
  }
}
