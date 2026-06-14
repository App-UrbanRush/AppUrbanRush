import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, Gauge, PackageCheck, Bike, KeyRound,
  CheckCircle, UtensilsCrossed, ShoppingBag, XCircle, PartyPopper,
} from "lucide-react";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import LiveTrackingMap from "../../components/DeliveryMap/LiveTrackingMap";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../context/useAuth";
import { ordersApi, type OrderDetail } from "../../../infrastructure/api/ordersApi";
import { reviewApi } from "../../../infrastructure/api/reviewApi";
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

interface RoutePoint {
  lat: number;
  lng: number;
}

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, status, connectionState, closed, error } = useOrderTracking(orderId);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [baseRoute, setBaseRoute] = useState<RoutePoint[]>([]);
  const [deliveryCode, setDeliveryCode] = useState<string | null>(null);
  const [deliveryStartTime, setDeliveryStartTime] = useState<number | null>(null);
  const [deliveryDuration, setDeliveryDuration] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [vendorRating, setVendorRating] = useState<number | null>(null);

  // Polling cada 5s
  useEffect(() => {
    if (!orderId) return;
    const poll = async () => {
      try {
        const o = await ordersApi.getById(orderId);
        setOrder(o);
        setDeliveryCode(o.delivery_code ?? null);
        if (o.vendor_lat && o.vendor_lng && o.customer_lat && o.customer_lng) {
          fetch(
            `https://router.project-osrm.org/route/v1/driving/${o.vendor_lng},${o.vendor_lat};${o.customer_lng},${o.customer_lat}?overview=full&geometries=geojson`
          )
            .then((r) => r.json())
            .then((data) => {
              if (data.routes?.[0]) {
                const coords = data.routes[0].geometry.coordinates;
                setBaseRoute(coords.map((c: [number, number]) => ({ lat: c[1], lng: c[0] })));
                const mins = Math.round(data.routes[0].duration / 60);
                if (!estimatedTime) setEstimatedTime(`~${mins} min`);
              }
            })
            .catch(() => {});
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Obtener calificación del vendor
  useEffect(() => {
    if (!order?.vendor_id) return;
    reviewApi.getStatsByStore(order.vendor_id).then((stats) => {
      setVendorRating(stats.average_rating);
    }).catch(() => {});
  }, [order?.vendor_id]);

  const effectiveStatus = status || order?.status || null;

  // Tracking de duración del delivery
  useEffect(() => {
    if (effectiveStatus === 'IN_DELIVERY' && !deliveryStartTime) {
      setDeliveryStartTime(Date.now());
    }
    if (effectiveStatus === 'DELIVERED' && deliveryStartTime) {
      const mins = Math.round((Date.now() - deliveryStartTime) / 60000);
      if (mins > 0) {
        setDeliveryDuration(`${mins} min`);
      } else {
        setDeliveryDuration('Menos de 1 min');
      }
    }
  }, [effectiveStatus, deliveryStartTime]);

  const connLabel: Record<string, string> = {
    idle: "Inactivo",
    connecting: "Conectando…",
    connected: "En vivo",
    disconnected: "Reconectando…",
    error: "Error",
  };

  const lastUpdate = location ? new Date(location.timestamp).toLocaleTimeString() : null;
  const isLive = connectionState === "connected";
  const currentStageIdx = effectiveStatus ? STAGES.findIndex((s) => s.key === effectiveStatus) : -1;
  const isCancelled = effectiveStatus === "CANCELLED";
  const isDelivered = closed || order?.status === 'DELIVERED';

  const joinAnimation = isDelivered ? "tracking-celebrate" : "";

  return (
    <div className={`tracking-page ${joinAnimation}`}>
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
            {isDelivered ? "Finalizado" : isCancelled ? "Cancelado" : connLabel[connectionState] ?? connectionState}
          </span>
          {effectiveStatus && (
            <span className="tracking-status-label" style={{ background: STATUS_COLORS[effectiveStatus] || "#9ca3af" }}>
              {ORDER_LABELS[effectiveStatus] || effectiveStatus}
            </span>
          )}
        </div>
      </div>

      {isCancelled && (
        <div className="tracking-cancelled-card">
          <div className="tracking-cancelled-icon">❌</div>
          <strong>Pedido cancelado</strong>
          <p>El pedido fue cancelado.</p>
        </div>
      )}

      {!isCancelled && isDelivered && (
        <div className="tracking-banner success tracking-delivered-banner">
          <PartyPopper size={20} />
          <div>
            <strong>🎉 ¡Felicidades!</strong>
            <p>Has recibido tu producto.</p>
          </div>
        </div>
      )}

      {!isCancelled && !isDelivered && effectiveStatus && currentStageIdx >= 0 && (
        <div className="tracking-stepper">
          {STAGES.map((stage, idx) => {
            const StageIcon = stage.icon;
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const isPending = idx > currentStageIdx;

            return (
              <div key={stage.key} className="tracking-step">
                {idx > 0 && (
                  <div className={`tracking-step-line ${isCompleted ? "completed" : ""}`} />
                )}
                <div className={`tracking-step-icon ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isPending ? "pending" : ""}`}>
                  <StageIcon size={14} />
                </div>
                <span className={`tracking-step-label ${isCurrent ? "current" : isCompleted ? "completed" : ""}`}>
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
          height="340px"
          popupText="Tu domiciliario está aquí"
          customerLat={order?.customer_lat ?? null}
          customerLng={order?.customer_lng ?? null}
          customerAddress={order?.delivery_address}
          customerName={order?.customer_name}
          customerPhone={order?.customer_phone}
          customerAvatar={order?.customer_avatar}
          showRoute={true}
          vendorLat={order?.vendor_lat ?? null}
          vendorLng={order?.vendor_lng ?? null}
          vendorName={order?.vendor_name}
          vendorAddress={order?.vendor_address}
          vendorLogo={order?.vendor_logo}
          vendorRating={vendorRating}
          vendorId={order?.vendor_id}
          courierName={order?.courier_name}
          courierPhone={order?.courier_phone}
          courierAvatar={order?.courier_avatar}
          courierVehicle={order?.courier_vehicle_type}
          baseRoutePoints={baseRoute}
        />
      </div>

      {order?.delivery_address && (
        <div className="tracking-address-card">
          <MapPin size={15} />
          <span>{order.delivery_address}</span>
        </div>
      )}

      {isDelivered && (
        <div className="tracking-delivered-code">
          <div className="tracking-delivered-code-icon">🎉</div>
          <strong>¡Felicidades!</strong>
          <p>Has recibido tu pedido correctamente.</p>
        </div>
      )}

      {deliveryCode && !isDelivered && !isCancelled && (
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

      {error && !isDelivered && !isCancelled && (
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
            <span className="tracking-info-value">
              {isCancelled ? "Cancelado" : isDelivered ? "Finalizado" : (lastUpdate ?? "Esperando…")}
            </span>
          </div>
        </div>
        {estimatedTime && !isDelivered && !isCancelled && (
          <div className="tracking-info-item">
            <span className="tracking-info-icon-wrap" style={{ background: "#e6ffe6" }}>
              <Clock size={14} style={{ color: "#10b981" }} />
            </span>
            <div>
              <span className="tracking-info-label">Tiempo estimado</span>
              <span className="tracking-info-value">{estimatedTime}</span>
            </div>
          </div>
        )}
        {deliveryDuration && !isCancelled && (
          <div className="tracking-info-item">
            <span className="tracking-info-icon-wrap" style={{ background: "#e6ffe6" }}>
              <Clock size={14} style={{ color: "#10b981" }} />
            </span>
            <div>
              <span className="tracking-info-label">Tiempo de entrega</span>
              <span className="tracking-info-value">{deliveryDuration}</span>
            </div>
          </div>
        )}
        {location?.speed != null && !isDelivered && (
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

      {!location && !isDelivered && !isCancelled && (
        <div className="tracking-tip">
          <MapPin size={16} />
          <span>Aún no recibimos la ubicación del domiciliario. Aparecerá aquí en cuanto inicie la entrega.</span>
        </div>
      )}

      {orderId && user?.id && (
        <ChatWindow
          orderId={orderId}
          enabled={effectiveStatus === "IN_DELIVERY" && !isDelivered}
          currentUserId={Number(user.id)}
        />
      )}
    </div>
  );
};

export default OrderTracking;
