import { X } from "lucide-react";
import type { RecentOrder } from "../../../domain/types/recent-orders.types";
import "./OrderDetailModal.css";

interface OrderDetailModalProps {
  order: RecentOrder;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  PENDING: { color: 'yellow', label: 'Pendiente', icon: '⏳' },
  ACCEPTED: { color: 'orange', label: 'Aceptado', icon: '✅' },
  PREPARING: { color: 'blue', label: 'En preparación', icon: '👨‍🍳' },
  READY: { color: 'green', label: 'Listo', icon: '✅' },
};

const OrderDetailModal = ({ order, onClose }: OrderDetailModalProps) => {
  const statusConfig = STATUS_CONFIG[order.status] || { color: 'gray', label: order.status, icon: '' };

  const subtotal = order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const deliveryFee = order.total - subtotal;

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <h2>Detalles del Pedido #{order.order_id.slice(-6).toUpperCase()}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="order-modal-body">
          <div className="order-info-grid">
            <div className="order-info-item">
              <span className="info-label">Cliente:</span>
              <span className="info-value">{order.customer_name}</span>
            </div>

            <div className="order-info-item">
              <span className="info-label">Estado:</span>
              <span className={`order-status-badge status-${statusConfig.color}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>

            <div className="order-info-item">
              <span className="info-label">Domiciliario:</span>
              <span className="info-value">{order.courier_name}</span>
            </div>

            <div className="order-info-item full-width">
              <span className="info-label">Dirección de entrega:</span>
              <span className="info-value">{order.delivery_address}</span>
            </div>
          </div>

          <div className="order-products-section">
            <h3>Productos</h3>
            <div className="products-list">
              {order.items.map((item, index) => (
                <div key={index} className="product-item">
                  <div className="product-quantity">
                    <span className="qty-badge">{item.quantity}x</span>
                  </div>
                  <div className="product-details">
                    <span className="product-name">{item.product_name}</span>
                    <span className="product-unit-price">
                      ${item.unit_price.toLocaleString()} c/u
                    </span>
                  </div>
                  <div className="product-total">
                    ${(item.unit_price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>Domicilio:</span>
                <span>${deliveryFee.toLocaleString()}</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>${order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-modal-footer">
          <button className="cancel-order-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;