import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, Navigation, Clock, CheckCircle, RefreshCw, X, KeyRound, Play } from "lucide-react";
import toast from "react-hot-toast";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { useAuth } from "../../context/useAuth";
import { GetCourierOrdersUseCase } from "../../../application/use-cases/GetCourierOrdersUseCase";
import { ConfirmDeliveryUseCase } from "../../../application/use-cases/ConfirmDeliveryUseCase";
import { AcceptOrderUseCase } from "../../../application/use-cases/AcceptOrderUseCase";
import { CourierOrdersRepositoryImpl } from "../../../infrastructure/repositories/CourierOrdersRepositoryImpl";
import type { CourierOrder } from "../../../domain/types/courier-orders.types";
import "./CourierDeliveries.css";

const repo = new CourierOrdersRepositoryImpl();
const getCourierOrders = new GetCourierOrdersUseCase(repo);
const confirmDelivery = new ConfirmDeliveryUseCase(repo);
const acceptOrder = new AcceptOrderUseCase(repo);

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  READY: { label: "Listo para recoger", color: "blue" },
  IN_DELIVERY: { label: "En entrega", color: "purple" },
  DELIVERED: { label: "Entregado", color: "gray" },
};

const CourierDeliveries = () => {
  const navigate = useNavigate();
  const { courierProfile, fetchCourierProfile } = useAuth();
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de confirmación con código
  const [codeOrderId, setCodeOrderId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!courierProfile) fetchCourierProfile();
  }, [courierProfile, fetchCourierProfile]);

  const load = useCallback(async () => {
    if (!courierProfile?.user_id) {
      console.warn("Courier profile or user_id not available");
      return;
    }
    setLoading(true);
    try {
      const data = await getCourierOrders.execute(courierProfile.user_id);
      setOrders(data);
    } catch (error) {
      console.error("Error cargando entregas:", error);
    } finally {
      setLoading(false);
    }
  }, [courierProfile]);

  useEffect(() => {
    load();
  }, [load]);

  const openCodeModal = (orderId: string) => {
    setCodeOrderId(orderId);
    setCode("");
  };

  const closeCodeModal = () => {
    if (confirming) return;
    setCodeOrderId(null);
    setCode("");
  };

  const handleConfirm = async () => {
    if (!courierProfile?.user_id || !codeOrderId) return;
    if (code.length !== 4) {
      toast.error("El código debe tener 4 dígitos");
      return;
    }
    setConfirming(true);
    try {
      await confirmDelivery.execute(codeOrderId, code, courierProfile.user_id);
      toast.success("¡Entrega confirmada! 🎉");
      setCodeOrderId(null);
      setCode("");
      await load();
    } catch (error: any) {
      const msg = error.response?.data?.message || "No se pudo confirmar la entrega";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!courierProfile?.user_id) return;
    
    try {
      await acceptOrder.execute(orderId, courierProfile.user_id);
      toast.success("¡Pedido aceptado! Inicia la ruta hacia el cliente");
      await load();
    } catch (error: any) {
      const msg = error.response?.data?.message || "No se pudo aceptar el pedido";
      toast.error(msg);
    }
  };

  // Mostrar primero las entregas activas
  const sorted = [...orders].sort((a, b) => {
    const rank: Record<string, number> = { IN_DELIVERY: 0, READY: 1, DELIVERED: 2 };
    return (rank[a.status] ?? 3) - (rank[b.status] ?? 3);
  });

  return (
    <CourierLayout>
      <div className="courier-deliveries">
        <div className="courier-deliveries-head">
          <div>
            <h1>Mis Entregas</h1>
            <p className="courier-deliveries-subtitle">Pedidos asignados a ti</p>
          </div>
          <button className="courier-refresh-btn" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Actualizar
          </button>
        </div>

        {loading ? (
          <div className="courier-deliveries-loading">Cargando entregas...</div>
        ) : sorted.length === 0 ? (
          <div className="courier-deliveries-empty">
            <Package size={40} />
            <p>Aún no tienes entregas asignadas</p>
          </div>
        ) : (
          <div className="courier-deliveries-list">
            {sorted.map((order) => {
              const st = STATUS_LABEL[order.status] || { label: order.status, color: "gray" };
              const isInDelivery = order.status === "IN_DELIVERY";
              const isReady = order.status === "READY";

              return (
                <div key={order.order_id} className={`delivery-card ${isInDelivery ? "active" : ""}`}>
                  <div className="delivery-card-top">
                    <span className="delivery-id">#{order.order_id.slice(-6).toUpperCase()}</span>
                    <span className={`delivery-status status-${st.color}`}>{st.label}</span>
                  </div>

                  <div className="delivery-info">
                    <MapPin size={15} />
                    <span>{order.delivery_address}</span>
                  </div>
                  <div className="delivery-info">
                    <Package size={15} />
                    <span>{order.items.length} producto(s)</span>
                  </div>
                  <div className="delivery-info">
                    <Clock size={15} />
                    <span>Domicilio: ${order.delivery_fee.toLocaleString()}</span>
                  </div>

                  {isReady && (
                    <div className="delivery-actions">
                      <button
                        className="delivery-accept-btn"
                        onClick={() => handleAcceptOrder(order.order_id)}
                      >
                        <Play size={16} /> Aceptar Pedido e Iniciar Ruta
                      </button>
                    </div>
                  )}

                  {isInDelivery && (
                    <div className="delivery-actions">
                      <button
                        className="delivery-share-btn"
                        onClick={() => navigate(`/courier/tracking/${order.order_id}`)}
                      >
                        <Navigation size={16} /> Ver Ruta en Mapa
                      </button>
                      <button
                        className="delivery-done-btn"
                        onClick={() => openCodeModal(order.order_id)}
                      >
                        <CheckCircle size={16} /> Confirmar entrega
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {codeOrderId && (
        <div className="delivery-code-overlay" onClick={closeCodeModal}>
          <div className="delivery-code-modal" onClick={(e) => e.stopPropagation()}>
            <button className="delivery-code-close" onClick={closeCodeModal} disabled={confirming}>
              <X size={18} />
            </button>
            <div className="delivery-code-icon">
              <KeyRound size={28} />
            </div>
            <h2>Confirmar entrega</h2>
            <p className="delivery-code-hint">
              Pídele al cliente su <strong>código de 4 dígitos</strong> e ingrésalo aquí.
            </p>
            <input
              className="delivery-code-input"
              inputMode="numeric"
              autoFocus
              maxLength={4}
              placeholder="0000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            />
            <button
              className="delivery-code-submit"
              onClick={handleConfirm}
              disabled={confirming || code.length !== 4}
            >
              {confirming ? "Confirmando..." : "Confirmar entrega"}
            </button>
          </div>
        </div>
      )}
    </CourierLayout>
  );
};

export default CourierDeliveries;
