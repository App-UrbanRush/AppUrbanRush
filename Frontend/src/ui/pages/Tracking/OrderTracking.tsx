import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Gauge, PackageCheck, Bike } from "lucide-react";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import LiveTrackingMap from "../../components/DeliveryMap/LiveTrackingMap";
import "./Tracking.css";

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { location, status, connectionState, closed, error } = useOrderTracking(orderId);

  const connLabel: Record<string, string> = {
    idle: "Inactivo",
    connecting: "Conectando…",
    connected: "En vivo",
    disconnected: "Reconectando…",
    error: "Error",
  };

  const lastUpdate = location ? new Date(location.timestamp).toLocaleTimeString() : null;
  const isLive = connectionState === "connected";

  return (
    <div className="tracking-page">
      <button className="tracking-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="tracking-hero">
        <div className="tracking-hero-icon">
          <Bike size={26} />
        </div>
        <div className="tracking-hero-text">
          <h1>Seguimiento del pedido</h1>
          <p className="tracking-order-id">#{orderId}</p>
        </div>
        <span className={`tracking-badge ${isLive ? "live" : "off"}`}>
          <span className="tracking-dot" /> {connLabel[connectionState] ?? connectionState}
        </span>
      </div>

      {closed && (
        <div className="tracking-banner success">
          <PackageCheck size={16} /> ¡Pedido entregado! Seguimiento finalizado.
        </div>
      )}
      {error && !closed && <div className="tracking-banner error">⚠ {error}</div>}

      <div className="tracking-map-wrap">
        <LiveTrackingMap
          lat={location?.lat ?? null}
          lng={location?.lng ?? null}
          popupText="Tu domiciliario está aquí"
        />
      </div>

      <div className="tracking-info">
        <div className="tracking-info-item">
          <span className="tracking-info-label"><PackageCheck size={12} /> Estado</span>
          <span className="tracking-info-value">{status ?? "—"}</span>
        </div>
        <div className="tracking-info-item">
          <span className="tracking-info-label"><Clock size={12} /> Actualización</span>
          <span className="tracking-info-value">{lastUpdate ?? "Esperando…"}</span>
        </div>
        {location?.speed != null && (
          <div className="tracking-info-item">
            <span className="tracking-info-label"><Gauge size={12} /> Velocidad</span>
            <span className="tracking-info-value">{location.speed} km/h</span>
          </div>
        )}
      </div>

      {!location && !closed && (
        <div className="tracking-tip">
          <MapPin size={16} />
          <span>Aún no recibimos la ubicación del domiciliario. Aparecerá aquí en cuanto inicie la entrega.</span>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
