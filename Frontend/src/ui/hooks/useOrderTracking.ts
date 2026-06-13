import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { authLocalStorage } from "../../infrastructure/persistence/authLocalStorage";
import { TrackingSocketGateway } from "../../infrastructure/socket/TrackingSocketGateway";
import { TrackingRepositoryImpl } from "../../infrastructure/repositories/TrackingRepositoryImpl";
import { SubscribeToOrderTrackingUseCase } from "../../application/use-cases/SubscribeToOrderTrackingUseCase";
import { GetLastLocationUseCase } from "../../application/use-cases/GetLastLocationUseCase";
import type { CourierLocation, TrackingConnectionState } from "../../domain/types/tracking.types";

const REST_FALLBACK_INTERVAL = 8000; // ms — solo se usa si el WebSocket no está conectado

/**
 * Hook del VISOR (usuario/negocio/admin).
 * Conecta al WebSocket, se suscribe al pedido y expone la ubicación en vivo.
 * Si el WebSocket cae, hace polling al fallback REST.
 */
export function useOrderTracking(orderId: string | undefined) {
  const gateway = useMemo(() => new TrackingSocketGateway(), []);
  const subscribeUseCase = useMemo(() => new SubscribeToOrderTrackingUseCase(gateway), [gateway]);
  const getLastLocationUseCase = useMemo(
    () => new GetLastLocationUseCase(new TrackingRepositoryImpl()),
    [],
  );

  const [location, setLocation] = useState<CourierLocation | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<TrackingConnectionState>("idle");
  const [closed, setClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRest = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await getLastLocationUseCase.execute(orderId);
      setStatus(data.status);
      if (data.location) setLocation(data.location);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "No se pudo obtener la ubicación");
    }
  }, [orderId, getLastLocationUseCase]);

  useEffect(() => {
    if (!orderId) return;
    const token = authLocalStorage.getToken();
    if (!token) {
      setError("Sesión no encontrada");
      return;
    }

    setConnectionState("connecting");

    // Carga inicial vía REST (muestra última ubicación conocida al instante)
    fetchRest();

    // Conectar y registrar handlers ANTES de suscribir
    gateway.connect(token);

    gateway.onConnectionChange((connected) => {
      connectedRef.current = connected;
      setConnectionState(connected ? "connected" : "disconnected");
      if (connected && orderId) {
        gateway.subscribeToOrder(orderId);
      }
    });
    gateway.onLocation((loc) => {
      setLocation(loc);
      setStatus((prev) => prev ?? "IN_DELIVERY");
    });
    gateway.onTrackingClosed(() => {
      setClosed(true);
      setStatus("DELIVERED");
    });
    gateway.onError((data) => setError(data.message));

    subscribeUseCase.execute(token, orderId);

    // Fallback: si no hay conexión WS, refrescar por REST periódicamente
    pollRef.current = setInterval(() => {
      if (!connectedRef.current && !closed) fetchRest();
    }, REST_FALLBACK_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      gateway.disconnect();
      connectedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return { location, status, connectionState, closed, error, refetch: fetchRest };
}
