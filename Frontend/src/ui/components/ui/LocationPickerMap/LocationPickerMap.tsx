import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Loader2, Check, X, MapPin } from "lucide-react";
import "./LocationPickerMap.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MOCOA: [number, number] = [1.1481, -76.6475];

const draggableIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="40" viewBox="0 0 32 40" fill="none"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0zm0 22c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="#e8500a" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="#fff"/></svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface LocationPickerMapProps {
  initialPosition?: [number, number];
  onConfirm: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
}

const LocationPickerMap = ({ initialPosition, onConfirm, onClose }: LocationPickerMapProps) => {
  const [position, setPosition] = useState<[number, number]>(initialPosition ?? MOCOA);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
  }, []);

  const handleMarkerDrag = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
  }, []);

  const handleConfirm = async () => {
    setIsResolving(true);
    const [lat, lng] = position;
    let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'AppUrbanRush/1.0' } },
      );
      const data = await res.json();
      if (data.display_name) {
        address = data.display_name;
      }
    } catch {
      // fallback
    }
    setIsResolving(false);
    onConfirm(address, lat, lng);
  };

  return (
    <div className="lpm-overlay" onClick={onClose}>
      <div className="lpm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lpm-header">
          <MapPin size={20} />
          <h3>Seleccionar ubicación</h3>
          <button className="lpm-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="lpm-map-container">
          <MapContainer
            center={position}
            zoom={16}
            style={{ width: "100%", height: "100%" }}
            preferCanvas
          >
            <ChangeView center={position} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onMapClick={handleMapClick} />
            <DraggableMarker position={position} onDrag={handleMarkerDrag} />
          </MapContainer>
        </div>

        <div className="lpm-coords">
          {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </div>

        <div className="lpm-actions">
          <button className="lpm-btn lpm-btn--cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="lpm-btn lpm-btn--confirm"
            onClick={handleConfirm}
            disabled={isResolving}
          >
            {isResolving ? (
              <><Loader2 size={18} className="lpm-spinner" /> Obteniendo dirección...</>
            ) : (
              <><Check size={18} /> Confirmar ubicación</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggableMarker({ position, onDrag }: { position: [number, number]; onDrag: (lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker | null>(null);

  const handleDragEnd = useCallback(() => {
    const marker = markerRef.current;
    if (marker) {
      const latlng = marker.getLatLng();
      onDrag(latlng.lat, latlng.lng);
    }
  }, [onDrag]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={draggableIcon}
      draggable
      eventHandlers={{ dragend: handleDragEnd }}
    />
  );
}

export default LocationPickerMap;
