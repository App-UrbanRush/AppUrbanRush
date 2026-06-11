import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, Navigation, Clock, CheckCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { useAuth } from "../../context/useAuth";
import { GetCourierOrdersUseCase } from "../../../application/use-cases/GetCourierOrdersUseCase";
import { MarkOrderDeliveredUseCase } from "../../../application/use-cases/MarkOrderDeliveredUseCase";
import { CourierOrdersRepositoryImpl } from "../../../infrastructure/repositories/CourierOrdersRepositoryImpl";
import type { CourierOrder } from "../../../domain/types/courier-orders.types";
import "./CourierDeliveries.css";

const repo = new CourierOrdersRepositoryImpl();
const getCourierOrders = new GetCourierOrdersUseCase(repo);
const markDelivered = new MarkOrderDeliveredUseCase(repo);

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
  const [delivering, setDelivering] = useState<string | null>(null);

  useEffect(() => {
    if (!courierProfile) fetchCourierProfile();
  }, [courierProfile, fetchCourierProfile]);

  const load = useCallback(async () => {
    if (!courierProfile?.couriers_id) return;
    setLoading(true);
    try {
      const data = await getCourierOrders.execute(courierProfile.couriers_id);
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

  const handleDelivered = async (orderId: string) => {
    if (!courierProfile?.couriers_id) return;
    setDelivering(orderId);
    try {
      await markDelivered.execute(orderId, courierProfile.couriers_id);
      toast.success("Pedido marcado como entregado 🎉");
      await load();
    } catch (error: any) {
      const msg = error.response?.data?.message || "No se pudo marcar como entregado";
      toast.error(msg);
    } finally {
      setDelivering(null);
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

                  {isInDelivery && (
                    <div className="delivery-actions">
                      <button
                        className="delivery-share-btn"
                        onClick={() => navigate(`/courier/tracking/${order.order_id}`)}
                      >
                        <Navigation size={16} /> Compartir ubicación
                      </button>
                      <button
                        className="delivery-done-btn"
                        onClick={() => handleDelivered(order.order_id)}
                        disabled={delivering === order.order_id}
                      >
                        <CheckCircle size={16} />
                        {delivering === order.order_id ? "Confirmando..." : "Marcar entregado"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CourierLayout>
  );
};

export default CourierDeliveries;
