import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, Navigation, Clock } from "lucide-react";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { useAuth } from "../../context/useAuth";
import { GetCourierOrdersUseCase } from "../../../application/use-cases/GetCourierOrdersUseCase";
import { CourierOrdersRepositoryImpl } from "../../../infrastructure/repositories/CourierOrdersRepositoryImpl";
import type { CourierOrder } from "../../../domain/types/courier-orders.types";
import "./CourierDeliveries.css";

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

  const getCourierOrders = new GetCourierOrdersUseCase(new CourierOrdersRepositoryImpl());

  useEffect(() => {
    if (!courierProfile) fetchCourierProfile();
  }, [courierProfile, fetchCourierProfile]);

  const load = useCallback(async () => {
    if (!courierProfile?.couriers_id) return;
    try {
      const data = await getCourierOrders.execute(courierProfile.couriers_id);
      setOrders(data);
    } catch (error) {
      console.error("Error cargando entregas:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courierProfile]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CourierLayout>
      <div className="courier-deliveries">
        <h1>Mis Entregas</h1>
        <p className="courier-deliveries-subtitle">Pedidos asignados a ti</p>

        {loading ? (
          <div className="courier-deliveries-loading">Cargando entregas...</div>
        ) : orders.length === 0 ? (
          <div className="courier-deliveries-empty">
            <Package size={40} />
            <p>Aún no tienes entregas asignadas</p>
          </div>
        ) : (
          <div className="courier-deliveries-list">
            {orders.map((order) => {
              const st = STATUS_LABEL[order.status] || { label: order.status, color: "gray" };
              const isInDelivery = order.status === "IN_DELIVERY";

              return (
                <div key={order.order_id} className="delivery-card">
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
                    <button
                      className="delivery-share-btn"
                      onClick={() => navigate(`/courier/tracking/${order.order_id}`)}
                    >
                      <Navigation size={16} /> Compartir ubicación
                    </button>
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
