import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { trackingApi } from "../../../infrastructure/api/trackingApi";
import type { VendorCourierLocation } from "../../../domain/types/tracking.types";
import { Bike } from "lucide-react";
import "./VendorCourierMap.css";

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

const createCourierIcon = (name: string) => L.divIcon({
  className: "",
  html: `<div style="position:relative;">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:rgba(124,58,237,0.15);animation:vendorPulse 2s infinite;"></div>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#7c3aed" stroke="#fff" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${name.charAt(0).toUpperCase()}</text>
    </svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const defaultCenter: [number, number] = [4.6097, -74.0817];

function FitBounds({ couriers }: { couriers: VendorCourierLocation[] }) {
  const map = useMap();
  useEffect(() => {
    if (couriers.length === 0) return;
    if (couriers.length === 1) {
      map.setView([couriers[0].lat, couriers[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(couriers.map(c => [c.lat, c.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [couriers, map]);
  return null;
}

interface VendorCourierMapProps {
  vendorLat?: number | null;
  vendorLng?: number | null;
  vendorName?: string | null;
  vendorAddress?: string | null;
  vendorLogo?: string | null;
}

const VendorCourierMap = ({ vendorLat, vendorLng, vendorName, vendorAddress, vendorLogo }: VendorCourierMapProps = {}) => {
  const [couriers, setCouriers] = useState<VendorCourierLocation[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await trackingApi.getVendorCourierLocations();
        setCouriers(data);
      } catch {
        // Silently ignore - vendor may not have active deliveries
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  const hasVendorPos = vendorLat != null && vendorLng != null;
  const center: [number, number] = hasVendorPos
    ? [vendorLat as number, vendorLng as number]
    : couriers.length > 0
      ? [couriers[0].lat, couriers[0].lng]
      : defaultCenter;

  if (!mounted) {
    return <div className="vendor-courier-map" style={{ height: 350, background: "#f0f0f0", borderRadius: 12 }} />;
  }

  return (
    <div className="vendor-courier-map">
      <div className="vendor-courier-map-header">
        <div className="vendor-courier-map-title">
          <Bike size={18} />
          <h3>Domiciliarios en Ruta</h3>
        </div>
        <span className="vendor-courier-map-count">
          {couriers.length} activo{couriers.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="vendor-courier-map-container">
        <MapContainer center={center} zoom={13} preferCanvas style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds couriers={couriers} />

          {hasVendorPos && (
            <Marker position={[vendorLat as number, vendorLng as number]} icon={storeIcon}>
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  {vendorLogo && (
                    <img src={vendorLogo} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', display: 'block', marginBottom: '6px' }} />
                  )}
                  <strong>{vendorName || "Tienda"}</strong>
                  {vendorAddress && <div style={{ fontSize: '12px', color: '#666' }}>{vendorAddress}</div>}
                </div>
              </Popup>
            </Marker>
          )}

          {couriers.map((c) => (
            <Marker key={c.courier_id} position={[c.lat, c.lng]} icon={createCourierIcon(c.name)}>
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                    {c.avatar ? (
                      <img src={c.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong style={{ fontSize: '14px' }}>{c.name}</strong>
                      {c.phone && <div style={{ fontSize: '12px' }}>📞 {c.phone}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {c.vehicle_type && (
                      <div>🚲 {c.vehicle_type === 'motorcycle' ? 'Motocicleta' : c.vehicle_type === 'bicycle' ? 'Bicicleta' : c.vehicle_type === 'car' ? 'Auto' : c.vehicle_type}</div>
                    )}
                    <div>🕐 {new Date(c.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {couriers.length === 0 && (
          <div className="vendor-courier-map-empty">
            No hay domiciliarios en ruta actualmente
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorCourierMap;
