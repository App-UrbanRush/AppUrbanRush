import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

const storeIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
      <rect x="7" y="9" width="10" height="10" rx="1" fill="#fff"/>
      <path d="M7 9l5-4 5 4" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function RecenterOnce({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

function FitBoundsOnce({ points }: { points: RoutePoints[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || points.length < 2) return;
    done.current = true;
    const bounds = L.latLngBounds(
      points.map((p) => [p.lat, p.lng] as [number, number])
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);
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
  customerName?: string | null;
  customerPhone?: string | null;
  customerAvatar?: string | null;
  showRoute?: boolean;
  vendorLat?: number | null;
  vendorLng?: number | null;
  vendorName?: string | null;
  vendorAddress?: string | null;
  vendorLogo?: string | null;
  vendorRating?: number | null;
  vendorId?: number | null;
  courierName?: string | null;
  courierPhone?: string | null;
  courierAvatar?: string | null;
  courierVehicle?: string | null;
  baseRoutePoints?: RoutePoints[];
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
  customerName,
  customerPhone,
  customerAvatar,
  showRoute = false,
  vendorLat,
  vendorLng,
  vendorName,
  vendorAddress,
  vendorLogo,
  vendorRating,
  vendorId,
  courierName,
  courierPhone,
  courierAvatar,
  courierVehicle,
  baseRoutePoints = [],
}: LiveTrackingMapProps) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoints[]>([]);
  const fetching = useRef(false);

  useEffect(() => setMounted(true), []);

  const hasPosition = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
  const hasCustomerPosition = customerLat != null && customerLng != null && !isNaN(customerLat) && !isNaN(customerLng);
  const hasVendorPosition = vendorLat != null && vendorLng != null && !isNaN(vendorLat) && !isNaN(vendorLng);
  const center: [number, number] = hasPosition ? [lat as number, lng as number] : defaultCenter;

  // Obtener ruta cada vez que cambien las coordenadas (nunca limpiar routePoints)
  useEffect(() => {
    if (!showRoute || !hasPosition || !hasCustomerPosition) return;
    if (fetching.current) return;
    fetching.current = true;

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${customerLng},${customerLat}?overview=full&geometries=geojson`
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
      } catch {
        if (routePoints.length === 0) {
          setRoutePoints([
            { lat: lat as number, lng: lng as number },
            { lat: customerLat as number, lng: customerLng as number },
          ]);
        }
      } finally {
        fetching.current = false;
      }
    };

    fetchRoute();
  }, [showRoute, hasPosition, hasCustomerPosition, customerLat, customerLng, lat, lng]);

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
        {hasCustomerPosition && <RecenterOnce lat={customerLat as number} lng={customerLng as number} />}
        {showRoute && routePoints.length > 0 && <FitBoundsOnce points={routePoints} />}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {baseRoutePoints.length > 0 && (
          <Polyline
            positions={baseRoutePoints.map((p) => [p.lat, p.lng])}
            color="#3b82f6"
            weight={3}
            opacity={0.5}
            dashArray="10 10"
          />
        )}

        {showRoute && routePoints.length > 0 && (
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lng])}
            color="#ff6b35"
            weight={5}
            opacity={0.9}
          />
        )}
        
        {hasVendorPosition && (
          <Marker 
            position={[vendorLat as number, vendorLng as number]} 
            icon={storeIcon}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  {vendorLogo && (
                    <img src={vendorLogo} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                  <div>
                    <strong style={{ fontSize: '14px' }}>{vendorName || "Tienda"}</strong>
                    {vendorAddress && <div style={{ fontSize: '12px', color: '#666' }}>{vendorAddress}</div>}
                  </div>
                </div>
                {vendorRating != null && (
                  <div style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '4px' }}>
                    {"★".repeat(Math.round(vendorRating))}{"☆".repeat(5 - Math.round(vendorRating))}
                    {" "}{vendorRating.toFixed(1)}
                  </div>
                )}
                {vendorId && (
                  <button
                    onClick={() => navigate(`/store/${vendorId}`)}
                    style={{
                      width: '100%', padding: '7px 0',
                      background: '#e8500a', color: '#fff', border: 'none',
                      borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Ver tienda
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {hasPosition && (
          <Marker position={center} icon={courierIcon}>
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  {courierAvatar ? (
                    <img src={courierAvatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff6b35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                      {(courierName || "D")[0]}
                    </div>
                  )}
                  <div>
                    <strong style={{ fontSize: '14px' }}>{courierName || "Domiciliario"}</strong>
                    {courierPhone && <div style={{ fontSize: '12px' }}>📞 {courierPhone}</div>}
                  </div>
                </div>
                {courierVehicle && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    🚲 {courierVehicle === 'motorcycle' ? 'Motocicleta' : courierVehicle === 'bicycle' ? 'Bicicleta' : courierVehicle === 'car' ? 'Auto' : courierVehicle}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        
        {hasCustomerPosition && (
          <Marker 
            position={[customerLat as number, customerLng as number]} 
            icon={customerIcon}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  {customerAvatar ? (
                    <img src={customerAvatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                      {(customerName || "C")[0]}
                    </div>
                  )}
                  <div>
                    <strong style={{ fontSize: '14px' }}>{customerName || "Cliente"}</strong>
                    {customerPhone && <div style={{ fontSize: '12px' }}>📞 {customerPhone}</div>}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  📍 {customerAddress || "Dirección de entrega"}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;
