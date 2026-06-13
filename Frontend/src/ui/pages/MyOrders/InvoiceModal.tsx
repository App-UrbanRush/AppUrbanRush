import { useEffect, useRef } from "react";
import { X, Printer, Package, MapPin, FileText } from "lucide-react";
import type { OrderDetail } from "../../../infrastructure/api/ordersApi";
import "./InvoiceModal.css";

interface InvoiceModalProps {
  order: OrderDetail | null;
  onClose: () => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InvoiceModal = ({ order, onClose }: InvoiceModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!order) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [order]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-overlay" onClick={onClose}>
      <div
        className="invoice-modal"
        onClick={(e) => e.stopPropagation()}
        ref={contentRef}
      >
        <div className="invoice-modal-header">
          <div className="invoice-modal-header-left">
            <FileText size={18} />
            <h2>Factura</h2>
          </div>
          <div className="invoice-modal-header-right">
            <button className="invoice-btn invoice-btn--print" onClick={handlePrint}>
              <Printer size={16} />
              Imprimir
            </button>
            <button className="invoice-btn invoice-btn--close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="invoice-content">
          <div className="invoice-head">
            <div>
              <h2>Factura</h2>
              <div className="invoice-id">#{order.order_id.slice(0, 12)}</div>
            </div>
            <div className="invoice-meta">
              <div className="invoice-date">{formatDate(order.created_at)}</div>
            </div>
          </div>

          <div className="invoice-items">
            {order.items.map((item) => (
              <div key={item.product_id} className="invoice-item">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="invoice-item-img" />
                ) : (
                  <div className="invoice-item-img-placeholder">
                    <Package size={20} />
                  </div>
                )}
                <div className="invoice-item-info">
                  <p className="invoice-item-name">{item.product_name}</p>
                  <p className="invoice-item-meta">{item.quantity} × ${item.unit_price.toLocaleString()}</p>
                </div>
                <span className="invoice-item-total">${(item.quantity * item.unit_price).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="invoice-totals">
            <div className="invoice-total-row">
              <span>Subtotal</span>
              <span>${order.subtotal.toLocaleString()}</span>
            </div>
            <div className="invoice-total-row delivery">
              <span>Domicilio</span>
              <span>+ ${order.delivery_fee.toLocaleString()}</span>
            </div>
            <div className="invoice-total-row">
              <span>Comisión de plataforma</span>
              <span>+ ${order.platform_commission.toLocaleString()}</span>
            </div>
            <div className="invoice-total-row grand">
              <span>Total</span>
              <span>${order.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="invoice-info-line">
            <MapPin size={16} className="invoice-info-line-icon" />
            <div>
              <div className="invoice-info-line-label">Dirección de entrega</div>
              <div className="invoice-info-line-value">{order.delivery_address}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
