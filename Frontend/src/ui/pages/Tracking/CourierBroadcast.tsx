import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Navigation, MapPin, Clock, Radio, Wifi, Play, Square, Info, User } from "lucide-react";
import { useCourierBroadcast } from "../../hooks/useCourierBroadcast";
import LiveTrackingMap from "../../components/DeliveryMap/LiveTrackingMap";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../context/useAuth";
import { ordersApi } from "../../../infrastructure/api/ordersApi";
import { useEffect, useState } from "react";
import "./Tracking.css";

interface OrderLocation {
  customer_lat: number | null;
  customer_lng: number | null;
  delivery_address: string;
}

const CourierBroadcast = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { broadcasting, connectionState, lastSent, error, start, stop } = useCourierBroadcast(orderId);
  const [orderLocation, setOrderLocation] = useState<OrderLocation | null>(null);

  useEffect(() => {
    if (!orderId) return;
    // Obtener las coordenadas del cliente
    ordersApi.getById(orderId)
      .then((order) => {
        setOrderLocation({
          customer_lat: (order as any).customer_lat || null,
          customer_lng: (order as any).customer_lng || null,
          delivery_address: order.delivery_address,
        });
      })
      .catch((err) => {
        console.error("Error al obtener ubicación del cliente:", err);
      });
  }, [orderId]);

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
          customerLat={orderLocation?.customer_lat ?? null}
          customerLng={orderLocation?.customer_lng ?? null}
          customerAddress={orderLocation?.delivery_address ?? null}
          showRoute={broadcasting}
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
