import { useEffect } from "react";
import DeliveryMap from "./DeliveryMap";
import "./MapModal.css";

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  center: [number, number];
  zoom?: number;
  locations: Array<{ id: string; lat: number; lng: number; address: string; status: "pending" | "in-transit" | "delivered" }>;
  userPosition?: [number, number] | null;
}

const MapModal = ({ open, onClose, center, zoom = 14, locations, userPosition = null }: MapModalProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}>
          ✕
        </button>
        <DeliveryMap
          center={center}
          zoom={zoom}
          height="100%"
          locations={locations}
          userPosition={userPosition}
          showMyLocation
        />
      </div>
    </div>
  );
};

export default MapModal;
