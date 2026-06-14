import { useEffect, useState, useCallback } from "react";
import { MapPin, Package, Clock, RefreshCw, Store, User } from "lucide-react";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { useAuth } from "../../context/useAuth";
import { GetCourierOrdersUseCase } from "../../../application/use-cases/GetCourierOrdersUseCase";
import { CourierOrdersRepositoryImpl } from "../../../infrastructure/repositories/CourierOrdersRepositoryImpl";
import type { CourierOrder } from "../../../domain/types/courier-orders.types";
import "./CourierDeliveries.css";

const repo = new CourierOrdersRepositoryImpl();
const getCourierOrders = new GetCourierOrdersUseCase(repo);

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  READY: { label: "Listo para recoger", color: "blue" },
  IN_DELIVERY: { label: "En entrega", color: "purple" },
  DELIVERED: { label: "Entregado", color: "gray" },
};

const CourierDeliveries = () => {
  const { courierProfile, fetchCourierProfile } = useAuth();
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [loading, setLoading] = useState(true);

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

  const sorted = [...orders].sort((a, b) => {
    const rank: Record<string, number> = { IN_DELIVERY: 0, READY: 1, DELIVERED: 2 };
    return (rank[a.status] ?? 3) - (rank[b.status] ?? 3);
  });

  const formatPrice = (n: number) => `$${n.toLocaleString()}`;

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

              return (
                <div key={order.order_id} className="delivery-card">
                  <div className="delivery-card-top">
                    <span className="delivery-id">#{order.order_id.slice(-6).toUpperCase()}</span>
                    <span className={`delivery-status status-${st.color}`}>{st.label}</span>
                  </div>

                  <div className="delivery-info">
                    <Store size={15} />
                    <span>Restaurante: {order.vendor_name || "Restaurante"}</span>
                  </div>
                  <div className="delivery-info">
                    <User size={15} />
                    <span>Cliente: {order.customer_name || "Cliente"}</span>
                  </div>
                  <div className="delivery-info">
                    <MapPin size={15} />
                    <span>Dirección: {order.delivery_address}</span>
                  </div>
                  <div className="delivery-info">
                    <Clock size={15} />
                    <span>Domicilio: {formatPrice(order.delivery_fee)}</span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="delivery-items">
                      <div className="delivery-items-title">
                        <Package size={14} /> Productos:
                      </div>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="delivery-item-row">
                          <span className="delivery-item-name">{item.product_name} x{item.quantity}</span>
                        </div>
                      ))}
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
