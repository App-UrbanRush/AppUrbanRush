import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
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
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

interface DeliveryMapProps {
  center?: [number, number];
  zoom?: number;
  locations?: DeliveryLocation[];
  height?: string;
}

const defaultCenter: [number, number] = [4.6097, -74.0817];

const DeliveryMap = ({
  center = defaultCenter,
  zoom = 13,
  locations = [],
  height = "400px",
}: DeliveryMapProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ height, background: "#f0f0f0", borderRadius: "12px" }} />;
  }

  return (
    <div className="delivery-map-container" style={{ height, borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <ChangeView center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <strong>{loc.address}</strong>
              <br />
              Estado: {loc.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
