import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Navigation, MapPin, Clock, Radio, Wifi, Play, Square, Info } from "lucide-react";
import { useCourierBroadcast } from "../../hooks/useCourierBroadcast";
import LiveTrackingMap from "../../components/DeliveryMap/LiveTrackingMap";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../context/useAuth";
import "./Tracking.css";

const CourierBroadcast = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { broadcasting, connectionState, lastSent, error, start, stop } = useCourierBroadcast(orderId);

  const lastTime = lastSent ? new Date(lastSent.timestamp).toLocaleTimeString() : null;
  const connected = connectionState === "connected";

  return (
    <div className="tracking-page">
      <button className="tracking-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="tracking-hero">
        <div className="tracking-hero-icon">
          <Navigation size={26} />
        </div>
        <div className="tracking-hero-text">
          <h1>Compartir mi ubicación</h1>
          <p className="tracking-order-id">Pedido #{orderId}</p>
        </div>
        <span className={`tracking-badge ${broadcasting ? "live" : "off"}`}>
          <span className="tracking-dot" /> {broadcasting ? "Transmitiendo" : "Detenido"}
        </span>
      </div>

      {error && <div className="tracking-banner error">⚠ {error}</div>}

      {/* Estado de transmisión */}
      <div className="tracking-pulse-card">
        <div className={`tracking-pulse-ring ${broadcasting ? "on" : ""}`}>
          <Radio size={28} />
        </div>
        <div className="tracking-pulse-info">
          <span className="tracking-pulse-title">
            {broadcasting ? "Compartiendo tu ubicación en vivo" : "Transmisión detenida"}
          </span>
          <span className="tracking-pulse-sub">
            <Wifi size={13} /> {connected ? "Conectado al servidor" : "Sin conexión"}
          </span>
        </div>
      </div>

      <div className="tracking-map-wrap">
        <LiveTrackingMap
          lat={lastSent?.lat ?? null}
          lng={lastSent?.lng ?? null}
          popupText="Tu posición actual"
        />
      </div>

      <div className="tracking-actions">
        {!broadcasting ? (
          <button className="tracking-btn start" onClick={start}>
            <Play size={18} /> Iniciar transmisión GPS
          </button>
        ) : (
          <button className="tracking-btn stop" onClick={stop}>
            <Square size={16} /> Detener
          </button>
        )}
      </div>

      <div className="tracking-info">
        <div className="tracking-info-item">
          <span className="tracking-info-label"><MapPin size={12} /> Última posición</span>
          <span className="tracking-info-value">
            {lastSent ? `${lastSent.lat}, ${lastSent.lng}` : "—"}
          </span>
        </div>
        <div className="tracking-info-item">
          <span className="tracking-info-label"><Clock size={12} /> Hora</span>
          <span className="tracking-info-value">{lastTime ?? "—"}</span>
        </div>
      </div>

      <div className="tracking-tip">
        <Info size={16} />
        <span>Mantén esta pantalla abierta mientras realizas la entrega. Tu ubicación se comparte con el cliente en tiempo real.</span>
      </div>

      {orderId && user?.id && (
        <ChatWindow orderId={orderId} enabled currentUserId={Number(user.id)} />
      )}
    </div>
  );
};

export default CourierBroadcast;
