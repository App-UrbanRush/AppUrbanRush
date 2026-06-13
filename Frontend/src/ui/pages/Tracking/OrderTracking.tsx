import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, Gauge, PackageCheck, Bike, KeyRound,
  CheckCircle, UtensilsCrossed, ShoppingBag, XCircle,
} from "lucide-react";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import LiveTrackingMap from "../../components/DeliveryMap/LiveTrackingMap";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../context/useAuth";
import { ordersApi } from "../../../infrastructure/api/ordersApi";
import "./Tracking.css";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  ACCEPTED: "#3b82f6",
  PREPARING: "#8b5cf6",
  READY: "#06b6d4",
  IN_DELIVERY: "#10b981",
  DELIVERED: "#6b7280",
  CANCELLED: "#ef4444",
};

const ORDER_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  PREPARING: "Preparando",
  READY: "Listo",
  IN_DELIVERY: "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STAGES = [
  { key: "ACCEPTED", label: "Aceptado", icon: CheckCircle },
  { key: "PREPARING", label: "Preparando", icon: UtensilsCrossed },
  { key: "READY", label: "Listo", icon: PackageCheck },
  { key: "IN_DELIVERY", label: "En camino", icon: Bike },
  { key: "DELIVERED", label: "Entregado", icon: PackageCheck },
];

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, status, connectionState, closed, error } = useOrderTracking(orderId);
  const [deliveryCode, setDeliveryCode] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    ordersApi
      .getById(orderId)
      .then((order) => setDeliveryCode(order.delivery_code ?? null))
      .catch(() => setDeliveryCode(null));
  }, [orderId]);

  const connLabel: Record<string, string> = {
    idle: "Inactivo",
    connecting: "Conectando…",
    connected: "En vivo",
    disconnected: "Reconectando…",
    error: "Error",
  };

  const lastUpdate = location ? new Date(location.timestamp).toLocaleTimeString() : null;
  const isLive = connectionState === "connected";

  const currentStageIdx = status ? STAGES.findIndex((s) => s.key === status) : -1;
  const isCancelled = status === "CANCELLED";

  return (
    <div className="tracking-page">
      <button className="tracking-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="tracking-hero">
        <div className="tracking-hero-icon">
          <Bike size={24} />
        </div>
        <div className="tracking-hero-text">
          <h1>Seguimiento</h1>
          <p className="tracking-order-id">#{orderId?.slice(0, 12)}</p>
        </div>
        <div className="tracking-hero-right">
          <span className={`tracking-badge ${isLive ? "live" : "off"}`}>
            <span className="tracking-dot" />
            {connLabel[connectionState] ?? connectionState}
          </span>
          {status && (
            <span className="tracking-status-label" style={{ background: STATUS_COLORS[status] || "#9ca3af" }}>
              {ORDER_LABELS[status] || status}
            </span>
          )}
        </div>
      </div>

      {closed && (
        <div className="tracking-banner success">
          <PackageCheck size={16} /> ¡Pedido entregado! Seguimiento finalizado.
        </div>
      )}

      {isCancelled && (
        <div className="tracking-banner cancelled">
          <XCircle size={16} /> Pedido cancelado.
        </div>
      )}

      {!isCancelled && !closed && status && currentStageIdx >= 0 && (
        <div className="tracking-stepper">
          {STAGES.map((stage, idx) => {
            const StageIcon = stage.icon;
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const isPending = idx > currentStageIdx;

            return (
              <div key={stage.key} className="tracking-step">
                {idx > 0 && (
                  <div
                    className={`tracking-step-line ${isCompleted ? "completed" : ""}`}
                  />
                )}
                <div
                  className={`tracking-step-icon ${
                    isCompleted ? "completed" : ""
                  } ${isCurrent ? "current" : ""} ${isPending ? "pending" : ""}`}
                >
                  <StageIcon size={14} />
                </div>
                <span
                  className={`tracking-step-label ${
                    isCurrent ? "current" : isCompleted ? "completed" : ""
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="tracking-map-wrap">
        <LiveTrackingMap
          lat={location?.lat ?? null}
          lng={location?.lng ?? null}
          height="320px"
          popupText="Tu domiciliario está aquí"
        />
      </div>

      {deliveryCode && !closed && !isCancelled && (
        <div className="tracking-code-card">
          <div className="tracking-code-head">
            <KeyRound size={15} /> Código de entrega
          </div>
          <div className="tracking-code-value">{deliveryCode}</div>
          <p className="tracking-code-hint">
            Dale este código al domiciliario para confirmar la entrega.
          </p>
        </div>
      )}

      {error && !closed && !isCancelled && (
        <div className="tracking-banner error">⚠ {error}</div>
      )}

      <div className="tracking-info">
        <div className="tracking-info-item">
          <span className="tracking-info-icon-wrap" style={{ background: "#fff0e6" }}>
            <ShoppingBag size={14} style={{ color: "#e8500a" }} />
          </span>
          <div>
            <span className="tracking-info-label">Estado</span>
            <span className="tracking-info-value">
              {status ? ORDER_LABELS[status] || status : "—"}
            </span>
          </div>
        </div>
        <div className="tracking-info-item">
          <span className="tracking-info-icon-wrap" style={{ background: "#e6f0ff" }}>
            <Clock size={14} style={{ color: "#3b82f6" }} />
          </span>
          <div>
            <span className="tracking-info-label">Actualización</span>
            <span className="tracking-info-value">{lastUpdate ?? "Esperando…"}</span>
          </div>
        </div>
        {location?.speed != null && (
          <div className="tracking-info-item">
            <span className="tracking-info-icon-wrap" style={{ background: "#e6ffe6" }}>
              <Gauge size={14} style={{ color: "#10b981" }} />
            </span>
            <div>
              <span className="tracking-info-label">Velocidad</span>
              <span className="tracking-info-value">{location.speed} km/h</span>
            </div>
          </div>
        )}
      </div>

      {!location && !closed && !isCancelled && (
        <div className="tracking-tip">
          <MapPin size={16} />
          <span>Aún no recibimos la ubicación del domiciliario. Aparecerá aquí en cuanto inicie la entrega.</span>
        </div>
      )}

      {orderId && user?.id && (
        <ChatWindow
          orderId={orderId}
          enabled={status === "IN_DELIVERY" && !closed}
          currentUserId={Number(user.id)}
        />
      )}
    </div>
  );
};

export default OrderTracking;
