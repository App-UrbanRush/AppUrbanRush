import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, CheckCircle, XCircle, Clock, AlertTriangle, FileText, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { paymentApi } from "../../../infrastructure/api/paymentApi";
import { ordersApi, type OrderDetail } from "../../../infrastructure/api/ordersApi";
import type { PaymentResponse } from "../../../domain/types/payment.types";
import Loading from "../../components/Loading/Loading";
import InvoiceModal from "../MyOrders/InvoiceModal";
import "./PaymentHistory.css";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  APPROVED: { label: "Pagado", color: "#16a34a", bg: "#dcfce7" },
  DECLINED: { label: "Rechazado", color: "#dc2626", bg: "#fee2e2" },
  PENDING: { label: "Pendiente", color: "#ca8a04", bg: "#fef9c3" },
  ERROR: { label: "Error", color: "#dc2626", bg: "#fee2e2" },
  VOIDED: { label: "Anulado", color: "#6b7280", bg: "#f3f4f6" },
};

const STATUS_DOT_COLORS: Record<string, string> = {
  APPROVED: "#16a34a",
  DECLINED: "#dc2626",
  PENDING: "#ca8a04",
  ERROR: "#dc2626",
  VOIDED: "#9ca3af",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMonth = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
};

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const handleViewInvoice = async (orderId: string) => {
    setLoadingOrder(true);
    try {
      const order = await ordersApi.getById(orderId);
      setSelectedOrder(order);
    } catch {
      // silent
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const data = await paymentApi.getByUser(Number(user.id));
        setPayments(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const totalPaid = useMemo(
    () => payments.filter((p) => p.status === "APPROVED").reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  const approvedCount = useMemo(
    () => payments.filter((p) => p.status === "APPROVED").length,
    [payments],
  );

  const lastPaymentDate = useMemo(() => {
    const approved = payments.filter((p) => p.status === "APPROVED");
    return approved.length > 0
      ? formatDate(approved.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at)
      : null;
  }, [payments]);

  const grouped = useMemo(() => {
    const groups: Record<string, PaymentResponse[]> = {};
    for (const p of payments) {
      const key = formatMonth(p.created_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    return groups;
  }, [payments]);

  if (loading) {
    return (
      <div className="ph-wrapper">
        <Loading text="Cargando historial…" />
      </div>
    );
  }

  return (
    <div className="ph">
      <div className="ph-head">
        <CreditCard size={22} />
        <h1>Historial de pagos</h1>
        <span className="ph-head-count">{payments.length}</span>
      </div>

      {payments.length > 0 && (
        <div className="ph-stats">
          <div className="ph-stat">
            <span className="ph-stat-icon" style={{ background: "#fff0e6", color: "#e8500a" }}>
              <DollarSign size={16} />
            </span>
            <div className="ph-stat-body">
              <span className="ph-stat-label">Total pagado</span>
              <span className="ph-stat-value">${(totalPaid / 100).toLocaleString()}</span>
            </div>
          </div>
          <div className="ph-stat">
            <span className="ph-stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
              <TrendingUp size={16} />
            </span>
            <div className="ph-stat-body">
              <span className="ph-stat-label">Aprobados</span>
              <span className="ph-stat-value">{approvedCount}</span>
            </div>
          </div>
          <div className="ph-stat">
            <span className="ph-stat-icon" style={{ background: "#e6f0ff", color: "#3b82f6" }}>
              <Calendar size={16} />
            </span>
            <div className="ph-stat-body">
              <span className="ph-stat-label">Último pago</span>
              <span className="ph-stat-value">{lastPaymentDate || "—"}</span>
            </div>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="ph-empty">
          <div className="ph-empty-icon">
            <CreditCard size={56} strokeWidth={1.2} />
          </div>
          <h2>Aún no tienes pagos</h2>
          <p>Los pagos de tus pedidos aparecerán aquí automáticamente</p>
          <Link to="/" className="ph-empty-link">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="ph-list">
          {Object.entries(grouped).map(([month, monthPayments]) => (
            <div key={month}>
              <div className="ph-month-divider">
                <span>{month.charAt(0).toUpperCase() + month.slice(1)}</span>
              </div>
              {monthPayments.map((payment, idx) => {
                const statusInfo = STATUS_MAP[payment.status] || { label: payment.status, color: "#6b7280", bg: "#f3f4f6" };
                const dotColor = STATUS_DOT_COLORS[payment.status] || "#9ca3af";

                return (
                  <div
                    key={payment.id}
                    className="ph-card"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <div className="ph-card-row">
                      <span className="ph-card-dot" style={{ background: dotColor }} />
                      <span className="ph-card-ref">{payment.reference?.slice(0, 10) || payment.id.slice(0, 10)}</span>
                      <span
                        className="ph-card-status"
                        style={{ background: statusInfo.bg, color: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="ph-card-row ph-card-row--bottom">
                      <div className="ph-card-meta">
                        <span className="ph-card-date">{formatDate(payment.created_at)}</span>
                        <span className="ph-card-sep">·</span>
                        <span className="ph-card-method">{payment.payment_method || "Wompi"}</span>
                      </div>
                      <span className="ph-card-amount" style={{ color: payment.status === "APPROVED" ? "#e8500a" : "#9ca3af" }}>
                        ${(payment.amount / 100).toLocaleString()}
                      </span>
                    </div>
                    <button
                      className="ph-card-link"
                      onClick={() => handleViewInvoice(payment.order_id)}
                      disabled={loadingOrder}
                    >
                      <FileText size={13} />
                      Ver factura
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {loadingOrder && (
        <div className="ph-loading-overlay">
          <Loading size="sm" text="Cargando factura…" />
        </div>
      )}

      <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default PaymentHistory;
