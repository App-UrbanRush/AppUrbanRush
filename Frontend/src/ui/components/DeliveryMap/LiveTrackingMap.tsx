import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
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

const customerIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#10b981" stroke="#fff" stroke-width="2"/>
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#fff"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && 
        typeof center[0] === 'number' && typeof center[1] === 'number' &&
        !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom(), { animate: true });
    }
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

interface RoutePoints {
  lat: number;
  lng: number;
}

interface LiveTrackingMapProps {
  lat: number | null;
  lng: number | null;
  height?: string;
  popupText?: string;
  customerLat?: number | null;
  customerLng?: number | null;
  customerAddress?: string | null;
  showRoute?: boolean;
}

const defaultCenter: [number, number] = [4.6097, -74.0817];

const LiveTrackingMap = ({ 
  lat, 
  lng, 
  height = "420px", 
  popupText = "Domiciliario",
  customerLat,
  customerLng,
  customerAddress,
  showRoute = false
}: LiveTrackingMapProps) => {
  const [mounted, setMounted] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoints[]>([]);
  
  useEffect(() => setMounted(true), []);

  const hasPosition = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
  const hasCustomerPosition = customerLat != null && customerLng != null && !isNaN(customerLat) && !isNaN(customerLng);
  const center: [number, number] = hasPosition ? [lat as number, lng as number] : defaultCenter;

  // Calcular ruta cuando hay ambas posiciones y showRoute es true
  useEffect(() => {
    if (!showRoute || !hasPosition || !hasCustomerPosition) {
      setRoutePoints([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        // Usar OSRM para obtener la ruta
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${lng},${lat}?${customerLng},${customerLat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates;
          const points = coordinates.map((coord: [number, number]) => ({
            lat: coord[1],
            lng: coord[0],
          }));
          setRoutePoints(points);
        }
      } catch (error) {
        console.error("Error al obtener ruta:", error);
        // Fallback: línea recta si falla OSRM
        setRoutePoints([
          { lat: lat as number, lng: lng as number },
          { lat: customerLat as number, lng: customerLng as number },
        ]);
      }
    };

    fetchRoute();
  }, [lat, lng, customerLat, customerLng, showRoute, hasPosition, hasCustomerPosition]);

  // Calcular el centro del mapa para mostrar ambos puntos
  const mapCenter: [number, number] = 
    hasPosition && hasCustomerPosition && lat != null && customerLat != null
      ? [
          (lat + customerLat) / 2,
          (lng! + customerLng!) / 2,
        ] as [number, number]
      : center;

  if (!mounted) {
    return <div style={{ height, background: "#f0f0f0", borderRadius: "12px" }} />;
  }

  return (
    <div style={{ height, borderRadius: "12px", overflow: "hidden", position: "relative" }}>
      <MapContainer 
        center={mapCenter} 
        zoom={hasCustomerPosition && hasPosition ? 13 : 15} 
        preferCanvas 
        style={{ height: "100%", width: "100%" }}
      >
        <InvalidateSize />
        {(hasPosition || hasCustomerPosition) && <Recenter center={mapCenter} />}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Mostrar ruta */}
        {showRoute && routePoints.length > 0 && (
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lng])}
            color="#ff6b35"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}
        
        {/* Marcador del domiciliario */}
        {hasPosition && (
          <Marker position={center} icon={courierIcon}>
            <Popup>{popupText}</Popup>
          </Marker>
        )}
        
        {/* Marcador del cliente */}
        {hasCustomerPosition && (
          <Marker 
            position={[customerLat as number, customerLng as number]} 
            icon={customerIcon}
          >
            <Popup>
              <strong>Cliente</strong>
              <br />
              {customerAddress || "Dirección de entrega"}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;
