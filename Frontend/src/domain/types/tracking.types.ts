/**
 * DOMAIN LAYER - Tipos puros de rastreo GPS
 * No dependen de ninguna tecnología (ni socket.io ni axios)
 */

export interface CourierLocation {
  courier_id: number;
  order_id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: string; // ISO
}

/** Coordenadas que envía el domiciliario desde el navegador */
export interface LocationUpdateInput {
  order_id: string;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

/** Respuesta del fallback REST GET /tracking/order/:orderId */
export interface OrderTracking {
  order_id: string;
  courier_id: number | null;
  status: string;
  location: CourierLocation | null;
}

export type TrackingConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";
