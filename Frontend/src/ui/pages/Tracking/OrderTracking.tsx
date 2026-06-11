import { useParams } from "react-router-dom";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import LiveTrackingMap from "../../components/DeliveryMap/LiveTrackingMap";
import "./Tracking.css";

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { location, status, connectionState, closed, error } = useOrderTracking(orderId);

  const connLabel: Record<string, string> = {
    idle: "Inactivo",
    connecting: "Conectando…",
    connected: "En vivo",
    disconnected: "Reconectando…",
    error: "Error",
  };

  const lastUpdate = location ? new Date(location.timestamp).toLocaleTimeString() : null;

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <div>
          <h1>Seguimiento del pedido</h1>
          <p className="tracking-order-id">#{orderId}</p>
        </div>
        <span className={`tracking-badge ${connectionState === "connected" ? "live" : "off"}`}>
          <span className="tracking-dot" /> {connLabel[connectionState] ?? connectionState}
        </span>
      </div>

      {closed && (
        <div className="tracking-banner success">
          🏁 El pedido fue entregado. Seguimiento finalizado.
        </div>
      )}
      {error && !closed && <div className="tracking-banner error">⚠ {error}</div>}

      <LiveTrackingMap
        lat={location?.lat ?? null}
        lng={location?.lng ?? null}
        popupText="Tu domiciliario está aquí"
      />

      <div className="tracking-info">
        <div className="tracking-info-item">
          <span className="tracking-info-label">Estado del pedido</span>
          <span className="tracking-info-value">{status ?? "—"}</span>
        </div>
        <div className="tracking-info-item">
          <span className="tracking-info-label">Última actualización</span>
          <span className="tracking-info-value">{lastUpdate ?? "Esperando ubicación…"}</span>
        </div>
        {location?.speed != null && (
          <div className="tracking-info-item">
            <span className="tracking-info-label">Velocidad</span>
            <span className="tracking-info-value">{location.speed} km/h</span>
          </div>
        )}
      </div>

      {!location && !closed && (
        <p className="tracking-waiting">
          Aún no recibimos la ubicación del domiciliario. Aparecerá aquí en cuanto inicie la entrega.
        </p>
      )}
    </div>
  );
};

export default OrderTracking;
