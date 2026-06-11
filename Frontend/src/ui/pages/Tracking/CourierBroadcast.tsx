import { useParams } from "react-router-dom";
import { useCourierBroadcast } from "../../hooks/useCourierBroadcast";
import LiveTrackingMap from "../../components/DeliveryMap/LiveTrackingMap";
import "./Tracking.css";

const CourierBroadcast = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { broadcasting, connectionState, lastSent, error, start, stop } = useCourierBroadcast(orderId);

  const lastTime = lastSent ? new Date(lastSent.timestamp).toLocaleTimeString() : null;

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <div>
          <h1>Compartir mi ubicación</h1>
          <p className="tracking-order-id">Pedido #{orderId}</p>
        </div>
        <span className={`tracking-badge ${connectionState === "connected" ? "live" : "off"}`}>
          <span className="tracking-dot" /> {broadcasting ? "Transmitiendo" : "Detenido"}
        </span>
      </div>

      {error && <div className="tracking-banner error">⚠ {error}</div>}

      <LiveTrackingMap
        lat={lastSent?.lat ?? null}
        lng={lastSent?.lng ?? null}
        popupText="Tu posición actual"
      />

      <div className="tracking-actions">
        {!broadcasting ? (
          <button className="tracking-btn start" onClick={start}>
            ▶ Iniciar transmisión GPS
          </button>
        ) : (
          <button className="tracking-btn stop" onClick={stop}>
            ⏸ Detener
          </button>
        )}
      </div>

      <div className="tracking-info">
        <div className="tracking-info-item">
          <span className="tracking-info-label">Última posición enviada</span>
          <span className="tracking-info-value">
            {lastSent ? `${lastSent.lat}, ${lastSent.lng}` : "—"}
          </span>
        </div>
        <div className="tracking-info-item">
          <span className="tracking-info-label">Hora</span>
          <span className="tracking-info-value">{lastTime ?? "—"}</span>
        </div>
      </div>

      <p className="tracking-waiting">
        Mantén esta pantalla abierta mientras realizas la entrega. Tu ubicación se comparte con el cliente en tiempo real.
      </p>
    </div>
  );
};

export default CourierBroadcast;
