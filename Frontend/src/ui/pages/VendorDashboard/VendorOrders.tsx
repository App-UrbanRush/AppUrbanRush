import { useEffect, useState, useCallback } from "react";
import { Clock, User, Package } from "lucide-react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { useAuth } from "../../context/useAuth";
import type { RecentOrder } from "../../../domain/types/recent-orders.types";
import OrderDetailModal from "../../components/vendor/OrderDetailModal";
import "./VendorOrders.css";

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  PENDING: { color: 'yellow', label: 'Pendiente', icon: '⏳' },
  ACCEPTED: { color: 'orange', label: 'Aceptado', icon: '✅' },
  PREPARING: { color: 'blue', label: 'En preparación', icon: '👨‍🍳' },
  READY: { color: 'green', label: 'Listo', icon: '✅' },
  IN_DELIVERY: { color: 'purple', label: 'En delivery', icon: '🚴' },
  DELIVERED: { color: 'gray', label: 'Entregado', icon: '📦' },
  CANCELLED: { color: 'red', label: 'Cancelado', icon: '❌' },
};

const VendorOrders = () => {
  const { vendorProfile, getAllVendorOrders } = useAuth();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!vendorProfile) return;
    try {
      const data = await getAllVendorOrders(vendorProfile.vendor_id);
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, [vendorProfile, getAllVendorOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDetailsClick = (order: RecentOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleAcceptClick = (_orderId: string) => {
    // TODO: implementar lógica de aceptar pedido via API
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="vendor-orders-loading">Cargando pedidos...</div>
      </VendorLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <VendorLayout>
        <div className="vendor-orders-empty">
          <Package size={48} />
          <h3>No hay pedidos</h3>
          <p>Aún no tienes pedidos en tu restaurante</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="vendor-orders-container">
        <div className="vendor-orders-header">
          <h1>Todos los Pedidos</h1>
          <p className="orders-count">{orders.length} pedidos en total</p>
        </div>

        <div className="vendor-orders-list">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || { color: 'gray', label: order.status, icon: '' };
            const isPending = order.status === 'PENDING';

            return (
              <div key={order.order_id} className="vendor-order-item">
                <div className="order-main-info">
                  <div className="order-id-status">
                    <span className="order-id">#{order.order_id.slice(-6).toUpperCase()}</span>
                    <span className={`order-status status-${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>

                  <div className="order-customer">
                    <User size={16} />
                    <span>{order.customer_name}</span>
                  </div>

                  <div className="order-courier">
                    <span className="courier-label">Domiciliario:</span>
                    <span className="courier-name">{order.courier_name || 'No asignado'}</span>
                  </div>

                  <div className="order-total">
                    <span className="total-amount">${order.total.toLocaleString()}</span>
                  </div>

                  <button
                    className="details-btn"
                    onClick={() => handleDetailsClick(order)}
                  >
                    Detalles
                  </button>
                </div>

                <div className="order-secondary-info">
                  <div className="order-time">
                    <Clock size={14} />
                    <span>{order.time_elapsed}</span>
                  </div>

                  {isPending && (
                    <button
                      className="accept-btn"
                      onClick={() => handleAcceptClick(order.order_id)}
                    >
                      ACEPTAR
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isModalOpen && selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setIsModalOpen(false)}
            onAccept={() => handleAcceptClick(selectedOrder.order_id)}
          />
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;