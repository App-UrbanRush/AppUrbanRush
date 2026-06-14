import { useState } from "react";
import { MapPin, Loader, CheckCircle, AlertCircle } from "lucide-react";
import "./LocationInput.css";

interface LocationInputProps {
  onAddressFound: (address: string, lat: number, lng: number) => void;
  disabled?: boolean;
}

const LocationInput = ({ onAddressFound, disabled = false }: LocationInputProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada por tu navegador");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'AppUrbanRush/1.0' } },
          );
          const data = await res.json();
          if (data.display_name) {
            address = data.display_name;
          }
        } catch {
          // fallback: coordenadas como dirección
        }

        onAddressFound(address, latitude, longitude);
        setSuccess(true);
        setLoading(false);

        setTimeout(() => setSuccess(false), 3000);
      },
      (err) => {
        let errorMessage = "No se pudo obtener tu ubicación";
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Permiso denegado. Activa la ubicación en tu navegador";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible";
            break;
          case err.TIMEOUT:
            errorMessage = "Tiempo de espera agotado";
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="location-input-inline">
      <button
        type="button"
        className={`location-input-icon ${success ? 'success' : ''} ${loading ? 'loading' : ''}`}
        onClick={handleGetLocation}
        disabled={disabled || loading}
        title="Obtener dirección automáticamente"
      >
        {loading ? (
          <Loader className="icon-spin" size={18} />
        ) : success ? (
          <CheckCircle size={18} />
        ) : (
          <MapPin size={18} />
        )}
      </button>
      
      {error && (
        <div className="location-input-error-inline">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default LocationInput;