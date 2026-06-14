import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, Truck, ChefHat, XCircle } from "lucide-react";
import { recentOrdersApi } from "../../../infrastructure/api/recentOrdersApi";
import type { RecentOrder } from "../../../domain/types/recent-orders.types";
import "./RecentOrders.css";

const STATUS_CONFIG = {
  PENDING: { color: 'yellow', label: 'Pendiente', icon: Clock },
  ACCEPTED: { color: 'blue', label: 'Aceptado', icon: CheckCircle },
  PREPARING: { color: 'orange', label: 'En preparación', icon: ChefHat },
  READY: { color: 'green', label: 'Listo', icon: CheckCircle },
  IN_DELIVERY: { color: 'purple', label: 'En ruta', icon: Truck },
  DELIVERED: { color: 'gray', label: 'Entregado', icon: CheckCircle },
  CANCELLED: { color: 'red', label: 'Cancelado', icon: XCircle },
};

const RecentOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentOrders();
    const interval = setInterval(loadRecentOrders, 15000); // Polling cada 15 segundos
    return () => clearInterval(interval);
  }, []);

  const loadRecentOrders = async () => {
    try {
      setLoading(true);
      const data = await recentOrdersApi.getRecentOrders();
      setOrders(data.slice(0, 3)); // Mostrar solo los primeros 3
    } catch (error) {
      console.error("Error loading recent orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: '#fef3c7',
      ACCEPTED: '#dbeafe',
      PREPARING: '#ffedd5',
      READY: '#d1fae5',
      IN_DELIVERY: '#f3e8ff',
      DELIVERED: '#f3f4f6',
      CANCELLED: '#fee2e2',
    };
    return colors[status] || '#f3f4f6';
  };

  const getStatusTextColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: '#92400e',
      ACCEPTED: '#1e40af',
      PREPARING: '#9a3412',
      READY: '#065f46',
      IN_DELIVERY: '#6b21a8',
      DELIVERED: '#374151',
      CANCELLED: '#991b1b',
    };
    return colors[status] || '#374151';
  };

  if (loading) {
    return (
      <div className="recent-orders-section">
        <div className="recent-orders-header">
          <h2>Pedidos Recientes</h2>
        </div>
        <div className="recent-orders-loading">Cargando pedidos...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="recent-orders-section">
        <div className="recent-orders-header">
          <h2>Pedidos Recientes</h2>
          <button className="view-all-btn" onClick={() => navigate("/vendor/dashboard/pedidos")}>
            Ver todos →
          </button>
        </div>
        <div className="recent-orders-empty">
          <Package size={48} />
          <h3>No hay pedidos recientes</h3>
          <p>Los pedidos pendientes, aceptados, en preparación o listos aparecerán aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-orders-section">
      <div className="recent-orders-header">
        <h2>Pedidos Recientes</h2>
        <button className="view-all-btn" onClick={() => navigate("/vendor/dashboard/pedidos")}>
          Ver todos →
        </button>
      </div>

      <div className="recent-orders-list">
        {orders.map((order) => {
          const StatusIcon = STATUS_CONFIG[order.status]?.icon || Package;
          return (
            <div key={order.order_id} className="recent-order-item">
              <div className="recent-order-header">
                <div className="recent-order-id">
                  <span className="order-hash">#{order.order_id.slice(-6).toUpperCase()}</span>
                  <span className="customer-name">{order.customer_name} - {STATUS_CONFIG[order.status]?.label || order.status}</span>
                </div>
                <span 
                  className="status-badge"
                  style={{ 
                    background: getStatusColor(order.status),
                    color: getStatusTextColor(order.status)
                  }}
                >
                  <StatusIcon size={14} />
                </span>
              </div>
              
              <div className="recent-order-items">
                {order.items.slice(0, 2).map((item, index) => (
                  <span key={index} className="order-item">
                    {item.quantity}x {item.product_name}
                  </span>
                ))}
                {order.items.length > 2 && (
                  <span className="order-item-more">+{order.items.length - 2} más</span>
                )}
              </div>
              
              <div className="recent-order-footer">
                <span className="order-total">${order.total.toLocaleString()} - {order.time_elapsed}</span>
                {order.courier_name && (
                  <span className="courier-name">🚴 {order.courier_name}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentOrders;