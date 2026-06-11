import { useEffect, useMemo, useRef, useState } from "react";
import { authLocalStorage } from "../../infrastructure/persistence/authLocalStorage";
import { TrackingSocketGateway } from "../../infrastructure/socket/TrackingSocketGateway";
import { SendCourierLocationUseCase } from "../../application/use-cases/SendCourierLocationUseCase";
import type { LocationUpdateInput, TrackingConnectionState } from "../../domain/types/tracking.types";

// El GPS de escritorio no "se mueve", así que reenviamos la última posición
// periódicamente para mantener viva la clave en Redis (TTL 30s) y notificar al visor.
const HEARTBEAT_MS = 10000;

interface SentPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

/**
 * Hook del EMISOR (domiciliario).
 * Usa navigator.geolocation.watchPosition y manda cada lectura al backend por WebSocket.
 */
export function useCourierBroadcast(orderId: string | undefined) {
  const gateway = useMemo(() => new TrackingSocketGateway(), []);
  const sendLocationUseCase = useMemo(() => new SendCourierLocationUseCase(gateway), [gateway]);

  const [broadcasting, setBroadcasting] = useState(false);
  const [connectionState, setConnectionState] = useState<TrackingConnectionState>("idle");
  const [lastSent, setLastSent] = useState<SentPoint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastInputRef = useRef<LocationUpdateInput | null>(null);

  const start = () => {
    if (!orderId) {
      setError("Falta el ID del pedido");
      return;
    }
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }

    const token = authLocalStorage.getToken();
    if (!token) {
      setError("Sesión no encontrada");
      return;
    }

    setError(null);
    setConnectionState("connecting");

    gateway.connect(token);
    gateway.onConnectionChange((connected) =>
      setConnectionState(connected ? "connected" : "disconnected"),
    );
    gateway.onError((data) => setError(data.message));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        const input: LocationUpdateInput = {
          order_id: orderId,
          lat: +latitude.toFixed(6),
          lng: +longitude.toFixed(6),
          accuracy: accuracy ?? undefined,
          speed: speed != null ? Math.round(speed * 3.6) : undefined, // m/s → km/h
          heading: heading ?? undefined,
        };
        lastInputRef.current = input;
        sendLocationUseCase.execute(input);
        setLastSent({ lat: input.lat, lng: input.lng, timestamp: new Date().toISOString() });
      },
      (err) => setError(`Error de GPS: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    // Heartbeat: reenvía la última posición conocida para que Redis no expire
    heartbeatRef.current = setInterval(() => {
      if (lastInputRef.current) {
        sendLocationUseCase.execute(lastInputRef.current);
        setLastSent({
          lat: lastInputRef.current.lat,
          lng: lastInputRef.current.lng,
          timestamp: new Date().toISOString(),
        });
      }
    }, HEARTBEAT_MS);

    setBroadcasting(true);
  };

  const stop = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    gateway.disconnect();
    setBroadcasting(false);
    setConnectionState("idle");
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      gateway.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { broadcasting, connectionState, lastSent, error, start, stop };
}
