import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag, MapPin, Package, ArrowRight,
  Clock, CheckCircle, XCircle, Truck, PackageCheck, UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { ordersApi, type OrderDetail } from "../../../infrastructure/api/ordersApi";
import InvoiceModal from "./InvoiceModal";
import "./MyOrders.css";

const ORDER_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  PREPARING: "Preparando",
  READY: "Listo",
  IN_DELIVERY: "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  ACCEPTED: "#3b82f6",
  PREPARING: "#8b5cf6",
  READY: "#06b6d4",
  IN_DELIVERY: "#10b981",
  DELIVERED: "#6b7280",
  CANCELLED: "#ef4444",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock size={12} />,
  ACCEPTED: <CheckCircle size={12} />,
  PREPARING: <UtensilsCrossed size={12} />,
  READY: <PackageCheck size={12} />,
  IN_DELIVERY: <Truck size={12} />,
  DELIVERED: <PackageCheck size={12} />,
  CANCELLED: <XCircle size={12} />,
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SkeletonCard = () => (
  <div className="myorders-skeleton">
    <div className="myorders-skeleton-bar" />
    <div className="myorders-skeleton-body">
      <div className="myorders-skeleton-line w-40" />
      <div className="myorders-skeleton-line w-60" />
      <div className="myorders-skeleton-line w-30" />
    </div>
  </div>
);

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "PENDING", label: "Pendientes" },
  { key: "IN_DELIVERY", label: "En camino" },
  { key: "DELIVERED", label: "Entregados" },
  { key: "CANCELLED", label: "Cancelados" },
];

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [activeFilter, setActiveFilter] = useState("todos");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const data = await ordersApi.getByUser(user.id);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar pedidos");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="myorders-container">
        <div className="myorders-header">
          <ShoppingBag size={22} />
          <h1>Mis pedidos</h1>
        </div>
        <div className="myorders-list">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myorders-container">
        <div className="myorders-error">
          <XCircle size={40} strokeWidth={1.5} />
          <p>{error}</p>
          <button className="myorders-retry-btn" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = activeFilter === "todos"
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  return (
    <div className="myorders-container">
      <div className="myorders-header">
        <ShoppingBag size={22} />
        <h1>Mis pedidos</h1>
        <span className="myorders-count">{filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"}</span>
      </div>

      {orders.length > 0 && (
        <div className="myorders-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`myorders-filter-btn ${activeFilter === f.key ? "active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        orders.length === 0 ? (
          <div className="myorders-empty">
            <div className="myorders-empty-icon">
              <Package size={56} strokeWidth={1.2} />
            </div>
            <h2>Aún no has hecho pedidos</h2>
            <p>Explora los productos disponibles y haz tu primer pedido</p>
            <Link to="/" className="myorders-empty-link">Ir a la tienda</Link>
          </div>
        ) : (
          <div className="myorders-empty">
            <p style={{ fontSize: "14px" }}>No hay pedidos {FILTERS.find((f) => f.key === activeFilter)?.label?.toLowerCase()}</p>
          </div>
        )
      ) : (
        <div className="myorders-list">
          {filteredOrders.map((order, idx) => {
            const statusColor = STATUS_COLORS[order.status] || "#9ca3af";
            const thumbnails = order.items
              .filter((i) => i.image_url)
              .slice(0, 3);
            const remaining = order.items.length - thumbnails.length;

            return (
              <div
                key={order.order_id}
                className="myorders-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="myorders-card-accent" style={{ background: statusColor }} />

                <div className="myorders-card-content">
                  <div className="myorders-card-top">
                    <div className="myorders-card-id">#{order.order_id.slice(0, 12)}</div>
                    <div
                      className="myorders-card-status"
                      style={{ background: statusColor }}
                    >
                      {STATUS_ICONS[order.status] || null}
                      {ORDER_LABELS[order.status] || order.status}
                    </div>
                  </div>

                  <div className="myorders-card-body">
                    <div className="myorders-card-info">
                      {thumbnails.length > 0 && (
                        <div className="myorders-card-thumbs">
                          {thumbnails.map((item, i) => (
                            <img
                              key={i}
                              src={item.image_url}
                              alt=""
                              className="myorders-card-thumb"
                            />
                          ))}
                          {remaining > 0 && (
                            <div className="myorders-card-thumb-more">+{remaining}</div>
                          )}
                        </div>
                      )}
                      <div className="myorders-card-date">{formatDate(order.created_at)}</div>
                      <div className="myorders-card-address">
                        <MapPin size={13} />
                        <span>{order.delivery_address}</span>
                      </div>
                      <div className="myorders-card-items">
                        {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                      </div>
                    </div>
                    <div className="myorders-card-total">${order.total.toLocaleString()}</div>
                  </div>

                  <div className="myorders-card-actions">
                    <Link
                      to={`/tracking/${order.order_id}`}
                      className="myorders-card-action-btn myorders-card-action-btn--primary"
                    >
                      Seguimiento
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default MyOrders;
