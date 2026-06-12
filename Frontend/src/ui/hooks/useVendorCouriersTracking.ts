import { useEffect, useState, useMemo } from "react";
import { authLocalStorage } from "../../infrastructure/persistence/authLocalStorage";
import { TrackingSocketGateway } from "../../infrastructure/socket/TrackingSocketGateway";
import type { CourierLocation } from "../../domain/types/tracking.types";

interface CourierWithLocation {
  order_id: string;
  courier_id: number;
  courier_name: string;
  customer_name: string;
  delivery_address: string;
  location: CourierLocation | null;
}

/**
 * Hook para tracking de múltiples domiciliarios del vendor
 * Se conecta al WebSocket y se suscribe a múltiples pedidos activos
 */
export function useVendorCouriersTracking(activeOrders: Array<{
  order_id: string;
  courier_id: number;
  courier_name: string | null;
  customer_name: string;
  delivery_address: string;
}>) {
  const gateway = useMemo(() => new TrackingSocketGateway(), []);
  const [couriersWithLocation, setCouriersWithLocation] = useState<CourierWithLocation[]>([]);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "disconnected">("idle");

  // Inicializar couriers sin ubicación
  useEffect(() => {
    const initialCouriers: CourierWithLocation[] = activeOrders.map((order) => ({
      order_id: order.order_id,
      courier_id: order.courier_id,
      courier_name: order.courier_name || "Domiciliario",
      customer_name: order.customer_name,
      delivery_address: order.delivery_address,
      location: null,
    }));
    setCouriersWithLocation(initialCouriers);
  }, [activeOrders]);

  // Conectar al WebSocket
  useEffect(() => {
    if (activeOrders.length === 0) return;

    const token = authLocalStorage.getToken();
    if (!token) return;

    setConnectionState("connecting");
    gateway.connect(token);

    gateway.onConnectionChange((connected) => {
      setConnectionState(connected ? "connected" : "disconnected");
    });

    // Suscribirse a cada pedido activo
    activeOrders.forEach((order) => {
      gateway.subscribeToOrder(order.order_id);
    });

    // Escuchar actualizaciones de ubicación
    gateway.onLocation((location: CourierLocation) => {
      setCouriersWithLocation((prev) =>
        prev.map((courier) =>
          courier.order_id === location.order_id
            ? { ...courier, location }
            : courier
        )
      );
    });

    return () => {
      gateway.disconnect();
    };
  }, [gateway, activeOrders]);

  return { couriersWithLocation, connectionState };
}
