import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { trackingApi } from "../../../infrastructure/api/trackingApi";
import type { VendorCourierLocation } from "../../../domain/types/tracking.types";
import { Bike } from "lucide-react";
import "./VendorCourierMap.css";

const courierIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#7c3aed" stroke="#fff" stroke-width="2"/>
    <path d="M7 15a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" fill="#fff"/>
    <path d="M5 13h3l2-3h4l1 3h3" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
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

const VendorCourierMap = () => {
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

  const center: [number, number] = couriers.length > 0
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
          {couriers.map((c) => (
            <Marker key={c.courier_id} position={[c.lat, c.lng]} icon={courierIcon}>
              <Popup>{c.name}</Popup>
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
