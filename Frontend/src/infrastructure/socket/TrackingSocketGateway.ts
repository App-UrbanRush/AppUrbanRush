import { io, type Socket } from "socket.io-client";
import type { ITrackingGateway } from "../../domain/interfaces/ITrackingGateway";
import type { CourierLocation, LocationUpdateInput } from "../../domain/types/tracking.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * INFRASTRUCTURE - Adaptador de socket.io-client al contrato ITrackingGateway.
 * Se conecta al namespace /tracking del backend.
 */
export class TrackingSocketGateway implements ITrackingGateway {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(`${API_URL}/tracking`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  subscribeToOrder(orderId: string): void {
    this.socket?.emit("order:tracking", { order_id: orderId });
  }

  sendLocation(input: LocationUpdateInput): void {
    this.socket?.emit("courier:location:update", input);
  }

  onLocation(cb: (location: CourierLocation) => void): void {
    this.socket?.on("courier:location", cb);
  }

  onTrackingClosed(cb: (data: { order_id: string; message: string }) => void): void {
    this.socket?.on("tracking:closed", cb);
  }

  onVendorStatsUpdate(cb: (stats: { domiciliariosActivos: number }) => void): void {
    this.socket?.on("vendor:stats:update", cb);
  }

  onError(cb: (data: { message: string }) => void): void {
    this.socket?.on("error", cb);
  }

  onConnectionChange(cb: (connected: boolean) => void): void {
    this.socket?.on("connect", () => cb(true));
    this.socket?.on("disconnect", () => cb(false));
  }
}
