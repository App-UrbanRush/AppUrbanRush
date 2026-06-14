import { useParams } from "react-router-dom";
import { Navigation, MapPin, Clock, Wifi, Play, Square, Info, KeyRound, CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCourierBroadcast } from "../../hooks/useCourierBroadcast";
import LiveTrackingMap from "../../components/DeliveryMap/LiveTrackingMap";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../context/useAuth";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { ordersApi } from "../../../infrastructure/api/ordersApi";
import { ConfirmDeliveryUseCase } from "../../../application/use-cases/ConfirmDeliveryUseCase";
import { CourierOrdersRepositoryImpl } from "../../../infrastructure/repositories/CourierOrdersRepositoryImpl";
import "./Tracking.css";

const confirmDelivery = new ConfirmDeliveryUseCase(new CourierOrdersRepositoryImpl());

interface OrderLocation {
  customer_lat: number | null;
  customer_lng: number | null;
  delivery_address: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_avatar?: string | null;
  vendor_lat?: number | null;
  vendor_lng?: number | null;
  vendor_name?: string | null;
  vendor_address?: string | null;
  vendor_logo?: string | null;
  vendor_id?: number;
}

const CourierBroadcast = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, myProfile, courierProfile } = useAuth();
  const { broadcasting, connectionState, lastSent, error, start, stop } = useCourierBroadcast(orderId);
  const [orderLocation, setOrderLocation] = useState<OrderLocation | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    ordersApi.getById(orderId)
      .then((order) => {
        setOrderLocation({
          customer_lat: order.customer_lat ?? null,
          customer_lng: order.customer_lng ?? null,
          delivery_address: order.delivery_address,
          customer_name: order.customer_name ?? null,
          customer_phone: order.customer_phone ?? null,
          customer_avatar: order.customer_avatar ?? null,
          vendor_lat: order.vendor_lat ?? null,
          vendor_lng: order.vendor_lng ?? null,
          vendor_name: order.vendor_name ?? null,
          vendor_address: order.vendor_address ?? null,
          vendor_logo: order.vendor_logo ?? null,
          vendor_id: order.vendor_id,
        });
        setOrderStatus(order.status);
      })
      .catch((err) => {
        console.error("Error al obtener ubicación del cliente:", err);
      });
  }, [orderId]);

  const handleConfirmDelivery = async () => {
    if (!user?.id || !orderId) return;
    if (code.length !== 4) {
      toast.error("El código debe tener 4 dígitos");
      return;
    }
    setConfirming(true);
    try {
      await confirmDelivery.execute(orderId, code, Number(user.id));
      toast.success("¡Entrega confirmada! 🎉");
      setCode("");
      setCodeModalOpen(false);
      setOrderStatus("DELIVERED");
    } catch (error: any) {
      const msg = error.response?.data?.message || "No se pudo confirmar la entrega";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  const openCodeModal = () => {
    setCode("");
    setCodeModalOpen(true);
  };

  const closeCodeModal = () => {
    if (confirming) return;
    setCodeModalOpen(false);
    setCode("");
  };

  const lastTime = lastSent ? new Date(lastSent.timestamp).toLocaleTimeString() : null;
  const connected = connectionState === "connected";
  const isInDelivery = orderStatus === "IN_DELIVERY";
  const isDelivered = orderStatus === "DELIVERED";

  return (
    <CourierLayout>
      <div className="tracking-page">
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

        {isDelivered && (
          <div className="tracking-banner success">
            <CheckCircle size={16} /> ¡Entrega confirmada!
          </div>
        )}

        <div className="tracking-status-bar">
          <div className={`tracking-status-dot ${broadcasting ? "live" : "off"}`} />
          <span className="tracking-status-text">{broadcasting ? "Compartiendo tu ubicación en vivo" : "Transmisión detenida"}</span>
          <span className="tracking-status-divider" />
          <Wifi size={14} className={`tracking-wifi ${connected ? "on" : "off"}`} />
          <span className="tracking-status-conn">{connected ? "Conectado" : "Sin conexión"}</span>
        </div>

        <div className="tracking-map-wrap">
          <LiveTrackingMap
            lat={lastSent?.lat ?? null}
            lng={lastSent?.lng ?? null}
            popupText="Tu posición actual"
            customerLat={orderLocation?.customer_lat ?? null}
            customerLng={orderLocation?.customer_lng ?? null}
            customerAddress={orderLocation?.delivery_address ?? null}
            customerName={orderLocation?.customer_name}
            customerPhone={orderLocation?.customer_phone}
            customerAvatar={orderLocation?.customer_avatar}
            showRoute={true}
            courierName={myProfile ? `${myProfile.firstName} ${myProfile.firstLastName}` : undefined}
            courierPhone={myProfile?.cellphone}
            courierAvatar={courierProfile?.photo_url}
            courierVehicle={courierProfile?.vehicle_type}
            vendorLat={orderLocation?.vendor_lat ?? null}
            vendorLng={orderLocation?.vendor_lng ?? null}
            vendorName={orderLocation?.vendor_name}
            vendorAddress={orderLocation?.vendor_address}
            vendorLogo={orderLocation?.vendor_logo}
            vendorId={orderLocation?.vendor_id}
          />
        </div>

        <div className="tracking-actions-row">
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

          {isInDelivery && !isDelivered && (
            <button className="tracking-code-btn" onClick={openCodeModal}>
              <KeyRound size={16} /> Obtener código
            </button>
          )}
        </div>

        {codeModalOpen && (
          <div className="tracking-code-overlay" onClick={closeCodeModal}>
            <div className="tracking-code-modal" onClick={(e) => e.stopPropagation()}>
              <button className="tracking-code-modal-close" onClick={closeCodeModal} disabled={confirming}>
                <X size={18} />
              </button>
              <div className="tracking-code-modal-icon">
                <KeyRound size={28} />
              </div>
              <h2>Confirmar entrega</h2>
              <p className="tracking-code-modal-hint">
                Pídele al cliente su <strong>código de 4 dígitos</strong> e ingrésalo aquí.
              </p>
              <input
                className="tracking-code-modal-input"
                inputMode="numeric"
                autoFocus
                maxLength={4}
                placeholder="0000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmDelivery()}
              />
              <button
                className="tracking-code-modal-submit"
                onClick={handleConfirmDelivery}
                disabled={confirming || code.length !== 4}
              >
                {confirming ? "Confirmando..." : "Confirmar entrega"}
              </button>
            </div>
          </div>
        )}

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
    </CourierLayout>
  );
};

export default CourierBroadcast;
