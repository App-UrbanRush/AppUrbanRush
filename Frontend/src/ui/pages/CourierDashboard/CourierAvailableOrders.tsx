import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, Bike, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { useAuth } from "../../context/useAuth";
import { GetAvailableOrdersUseCase } from "../../../application/use-cases/GetAvailableOrdersUseCase";
import { TakeOrderUseCase } from "../../../application/use-cases/TakeOrderUseCase";
import { CourierOrdersRepositoryImpl } from "../../../infrastructure/repositories/CourierOrdersRepositoryImpl";
import type { CourierOrder } from "../../../domain/types/courier-orders.types";
import "./CourierDeliveries.css";

const repo = new CourierOrdersRepositoryImpl();
const getAvailableOrders = new GetAvailableOrdersUseCase(repo);
const takeOrder = new TakeOrderUseCase(repo);

const CourierAvailableOrders = () => {
  const navigate = useNavigate();
  const { courierProfile, fetchCourierProfile } = useAuth();
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState<string | null>(null);

  useEffect(() => {
    if (!courierProfile) fetchCourierProfile();
  }, [courierProfile, fetchCourierProfile]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAvailableOrders.execute();
      setOrders(data);
    } catch (error) {
      console.error("Error cargando pedidos disponibles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTake = async (orderId: string) => {
    if (!courierProfile?.couriers_id) {
      toast.error("No se pudo identificar tu perfil de domiciliario");
      return;
    }
    setTaking(orderId);
    try {
      await takeOrder.execute(orderId, courierProfile.couriers_id);
      toast.success("¡Pedido tomado! Ya puedes iniciar la entrega.");
      navigate("/courier/deliveries");
    } catch (error: any) {
      const msg = error.response?.data?.message || "No se pudo tomar el pedido";
      toast.error(msg);
      load();
    } finally {
      setTaking(null);
    }
  };

  return (
    <CourierLayout>
      <div className="courier-deliveries">
        <div className="courier-deliveries-head">
          <div>
            <h1>Pedidos disponibles</h1>
            <p className="courier-deliveries-subtitle">Pedidos listos para recoger</p>
          </div>
          <button className="courier-refresh-btn" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Actualizar
          </button>
        </div>

        {loading ? (
          <div className="courier-deliveries-loading">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="courier-deliveries-empty">
            <Package size={40} />
            <p>No hay pedidos disponibles en este momento</p>
          </div>
        ) : (
          <div className="courier-deliveries-list">
            {orders.map((order) => (
              <div key={order.order_id} className="delivery-card">
                <div className="delivery-card-top">
                  <span className="delivery-id">#{order.order_id.slice(-6).toUpperCase()}</span>
                  <span className="delivery-status status-blue">Listo para recoger</span>
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
                  <Bike size={15} />
                  <span>Ganas: ${order.delivery_fee.toLocaleString()}</span>
                </div>

                <button
                  className="delivery-share-btn"
                  onClick={() => handleTake(order.order_id)}
                  disabled={taking === order.order_id}
                >
                  <Bike size={16} />
                  {taking === order.order_id ? "Tomando..." : "Tomar pedido"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </CourierLayout>
  );
};

export default CourierAvailableOrders;
