import type { CourierLocation, LocationUpdateInput } from "../types/tracking.types";

/**
 * Contrato del transporte en tiempo real.
 * Abstrae socket.io: la capa de aplicación/ui no sabe qué tecnología hay debajo.
 * Implementado por TrackingSocketGateway sobre socket.io-client.
 */
export interface ITrackingGateway {
  connect(token: string): void;
  disconnect(): void;
  isConnected(): boolean;

  /** Visor: se suscribe al tracking de un pedido */
  subscribeToOrder(orderId: string): void;

  /** Domiciliario: emite su ubicación actual */
  sendLocation(input: LocationUpdateInput): void;

  /** Callbacks de eventos entrantes */
  onLocation(cb: (location: CourierLocation) => void): void;
  onTrackingClosed(cb: (data: { order_id: string; message: string }) => void): void;
  onVendorStatsUpdate(cb: (stats: { domiciliariosActivos: number }) => void): void;
  onError(cb: (data: { message: string }) => void): void;
  onConnectionChange(cb: (connected: boolean) => void): void;
}
