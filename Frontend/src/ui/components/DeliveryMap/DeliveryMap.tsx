import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface DeliveryLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
  status: "pending" | "in-transit" | "delivered";
  name?: string;
  image?: string;
  businessType?: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;
    // Initial invalidation after mount
    const timer = setTimeout(() => map.invalidateSize(), 50);
    // Continuous invalidation on resize (orientation, mobile layout shift, etc.)
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

const userIcon = L.divIcon({
  className: "",
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#fff" strokeWidth="3"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function LocateButton({ onLocate }: { onLocate: (pos: [number, number]) => void }) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada por tu navegador");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
        map.flyTo(pos, 15);
        onLocate(pos);
        setIsLocating(false);
      },
      () => {
        alert("No se pudo obtener tu ubicación. Verifica los permisos.");
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      style={{
        position: "absolute",
        bottom: "16px",
        right: "10px",
        zIndex: 1000,
        background: isLocating ? "#f0f0f0" : "#fff",
        border: "2px solid rgba(0,0,0,0.2)",
        borderRadius: "4px",
        padding: "6px 10px",
        cursor: isLocating ? "default" : "pointer",
        fontSize: "13px",
        fontWeight: 600,
        color: "#333",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 1px 5px rgba(0,0,0,0.2)",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8500a">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
      </svg>
      {isLocating ? "Buscando..." : "Mi ubicación"}
    </button>
  );
}

interface DeliveryMapProps {
  center?: [number, number];
  zoom?: number;
  locations?: DeliveryLocation[];
  height?: string;
  showMyLocation?: boolean;
  userPosition?: [number, number] | null;
}

function StorePopupContent({ loc }: { loc: DeliveryLocation }) {
  const navigate = useNavigate();
  return (
    <div style={{ minWidth: '180px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        {loc.image && (
          <img
            src={loc.image}
            alt={loc.name || loc.address}
            style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
            onError={(e) => { (e.currentTarget).style.display = 'none'; }}
          />
        )}
        <div>
          <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }}>{loc.name || loc.address}</strong>
          {loc.businessType && (
            <span style={{ fontSize: '11px', color: '#e8500a', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
              {loc.businessType}
            </span>
          )}
          <span style={{ fontSize: '11px', color: '#888' }}>{loc.address}</span>
        </div>
      </div>
      <button
        onClick={() => navigate(`/store/${loc.id}`)}
        style={{
          width: '100%',
          padding: '7px 0',
          background: '#e8500a',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Ver tienda
      </button>
    </div>
  );
}

const defaultCenter: [number, number] = [4.6097, -74.0817];

const DeliveryMap = ({
  center = defaultCenter,
  zoom = 13,
  locations = [],
  height = "400px",
  showMyLocation = false,
  userPosition = null,
}: DeliveryMapProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const activeUserPos = userPosition ?? userPos;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ height, background: "#f0f0f0", borderRadius: "12px" }} />;
  }

  return (
    <div className="delivery-map-container" style={{ height, borderRadius: "12px", overflow: "hidden", position: "relative" }}>
      <MapContainer center={center} zoom={zoom} preferCanvas={true} style={{ height: "100%", width: "100%" }}>
        <ChangeView center={center} />
        <InvalidateSize />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <StorePopupContent loc={loc} />
            </Popup>
          </Marker>
        ))}
        {activeUserPos && (
          <Marker position={activeUserPos} icon={userIcon}>
            <Popup>Tu ubicación</Popup>
          </Marker>
        )}
        {showMyLocation && <LocateButton onLocate={setUserPos} />}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
