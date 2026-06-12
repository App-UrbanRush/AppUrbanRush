import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";

const courierIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#ff6b35" stroke="#fff" stroke-width="2"/>
      <path d="M7 15a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" fill="#fff"/>
      <path d="M5 13h3l2-3h4l1 3h3" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 50);
    const obs = new ResizeObserver(() => map.invalidateSize());
    obs.observe(map.getContainer());
    return () => {
      clearTimeout(t);
      obs.disconnect();
    };
  }, [map]);
  return null;
}

interface LiveTrackingMapProps {
  lat: number | null;
  lng: number | null;
  height?: string;
  popupText?: string;
}

const defaultCenter: [number, number] = [4.6097, -74.0817];
const MAX_TRAIL = 400;
const MATCH_LIMIT = 100; // máx. de puntos que enviamos a OSRM por petición

const LiveTrackingMap = ({ lat, lng, height = "420px", popupText = "Domiciliario" }: LiveTrackingMapProps) => {
  const [mounted, setMounted] = useState(false);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const [roadTrail, setRoadTrail] = useState<[number, number][] | null>(null);
  const lastRef = useRef<string>("");

  useEffect(() => setMounted(true), []);

  // Acumula el recorrido: cada nueva posición se añade al "caminito"
  useEffect(() => {
    if (lat === null || lng === null) return;
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (key === lastRef.current) return; // evita duplicados consecutivos
    lastRef.current = key;
    setTrail((prev) => {
      const next: [number, number][] = [...prev, [lat, lng]];
      return next.length > MAX_TRAIL ? next.slice(next.length - MAX_TRAIL) : next;
    });
  }, [lat, lng]);

  // Ajusta el recorrido a las calles reales con OSRM (map matching), con debounce.
  // Si falla, se mantiene la línea recta como respaldo.
  useEffect(() => {
    if (trail.length < 2) {
      setRoadTrail(null);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const pts = trail.slice(-MATCH_LIMIT);
        const coords = pts.map(([la, ln]) => `${ln},${la}`).join(";");
        const url = `https://router.project-osrm.org/match/v1/driving/${coords}?geometries=geojson&overview=full&tidy=true`;
        const res = await fetch(url, { signal: ctrl.signal });
        const data = await res.json();
        const geom = data?.matchings?.[0]?.geometry?.coordinates as [number, number][] | undefined;
        if (Array.isArray(geom) && geom.length > 1) {
          setRoadTrail(geom.map(([ln, la]) => [la, ln] as [number, number]));
        }
      } catch {
        /* respaldo: línea recta (trail) */
      }
    }, 1500);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [trail]);

  const routeLine = roadTrail ?? trail;
  const hasPosition = lat !== null && lng !== null;
  const center: [number, number] = hasPosition ? [lat as number, lng as number] : defaultCenter;

  if (!mounted) {
    return <div style={{ height, background: "#f0f0f0", borderRadius: "12px" }} />;
  }

  return (
    <div style={{ height, borderRadius: "12px", overflow: "hidden", position: "relative" }}>
      <MapContainer center={center} zoom={15} preferCanvas style={{ height: "100%", width: "100%" }}>
        <InvalidateSize />
        {hasPosition && <Recenter center={center} />}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Caminito recorrido (ajustado a calles reales): borde blanco + línea naranja */}
        {routeLine.length > 1 && (
          <>
            <Polyline positions={routeLine} pathOptions={{ color: "#ffffff", weight: 8, opacity: 0.9, lineJoin: "round", lineCap: "round" }} />
            <Polyline positions={routeLine} pathOptions={{ color: "#ff6b35", weight: 4.5, opacity: 0.95, lineJoin: "round", lineCap: "round" }} />
          </>
        )}

        {/* Punto de inicio del recorrido */}
        {trail.length > 1 && (
          <CircleMarker
            center={trail[0]}
            radius={6}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "#22c55e", fillOpacity: 1 }}
          >
            <Popup>Inicio del recorrido</Popup>
          </CircleMarker>
        )}

        {/* Posición actual del domiciliario */}
        {hasPosition && (
          <Marker position={center} icon={courierIcon}>
            <Popup>{popupText}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;
