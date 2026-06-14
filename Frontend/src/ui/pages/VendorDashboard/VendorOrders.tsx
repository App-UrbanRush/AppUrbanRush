import { useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, User, Package, ChefHat, CheckCircle, Truck, XCircle, Search } from "lucide-react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { useAuth } from "../../context/useAuth";
import type { RecentOrder } from "../../../domain/types/recent-orders.types";
import { GetAllVendorOrdersUseCase } from "../../../application/use-cases/GetAllVendorOrdersUseCase";
import { RecentOrdersRepositoryImpl } from "../../../infrastructure/repositories/RecentOrdersRepositoryImpl";
import OrderDetailModal from "../../components/vendor/OrderDetailModal";
import { ordersApi } from "../../../infrastructure/api/ordersApi";
import toast from "react-hot-toast";
import "./VendorOrders.css";

const getAllVendorOrders = new GetAllVendorOrdersUseCase(new RecentOrdersRepositoryImpl());

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: ReactNode }> = {
  PENDING: { color: 'yellow', label: 'Pendiente', icon: <Clock size={14} /> },
  ACCEPTED: { color: 'orange', label: 'Aceptado', icon: <CheckCircle size={14} /> },
  PREPARING: { color: 'blue', label: 'En preparación', icon: <ChefHat size={14} /> },
  READY: { color: 'green', label: 'Listo', icon: <CheckCircle size={14} /> },
  IN_DELIVERY: { color: 'purple', label: 'En delivery', icon: <Truck size={14} /> },
  DELIVERED: { color: 'emerald', label: 'Entregado', icon: <Package size={14} /> },
  CANCELLED: { color: 'red', label: 'Cancelado', icon: <XCircle size={14} /> },
};

const VendorOrders = () => {
  const navigate = useNavigate();
  const { vendorProfile } = useAuth();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchId, setSearchId] = useState("");

  const fetchOrders = useCallback(async () => {
    if (!vendorProfile) return;
    try {
      const data = await getAllVendorOrders.execute(vendorProfile.vendor_id);
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, [vendorProfile]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDetailsClick = (order: RecentOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handlePublishOrder = async (order: RecentOrder) => {
    try {
      // Cambiar el estado a READY para que esté disponible para todos los domiciliarios
      await ordersApi.updateStatus(order.order_id, 'READY');
      toast.success('Pedido publicado! Los domiciliarios activos pueden verlo ahora');
      await fetchOrders();
    } catch (error: any) {
      console.error("Error al publicar pedido:", error);
      toast.error('Error al publicar el pedido');
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: orders.length };
    for (const key of Object.keys(STATUS_CONFIG)) {
      counts[key] = orders.filter(o => o.status === key).length;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "todos") {
      result = result.filter(o => o.status === statusFilter);
    }
    if (searchId.trim()) {
      const q = searchId.trim().toLowerCase();
      result = result.filter(o =>
        o.order_id.toLowerCase().includes(q) ||
        o.order_id.slice(-6).toLowerCase().includes(q.replace('#', ''))
      );
    }
    return result;
  }, [orders, statusFilter, searchId]);

  const STATUS_FLOW: Record<string, string> = {
    ACCEPTED: 'PREPARING',
    PREPARING: 'READY',
  };

  const handleStatusChange = async (order: RecentOrder) => {
    const nextStatus = STATUS_FLOW[order.status];
    if (!nextStatus) {
      if (order.status === 'DELIVERED') {
        toast.success('Pedido entregado');
      } else if (order.status === 'CANCELLED') {
        toast.error('Pedido cancelado');
      } else {
        toast.success('No hay más acciones disponibles para este pedido');
      }
      return;
    }
    
    try {
      await ordersApi.updateStatus(order.order_id, nextStatus);
      toast.success('Estado actualizado correctamente');
      await fetchOrders();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error('Error al actualizar el estado del pedido');
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="vendor-orders-loading">Cargando pedidos...</div>
      </VendorLayout>
    );
  }

  if (!loading && orders.length === 0) {
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
          <h1>Gestión de Pedidos</h1>
          <div className="vendor-orders-header-right">
            <div className="vendor-orders-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <p className="orders-count">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total</p>
          </div>
        </div>

        <div className="vendor-orders-tabs">
          {Object.entries({ todos: "Todos", ...Object.fromEntries(
            Object.entries(STATUS_CONFIG).map(([key, val]) => [key, val.label])
          )}).map(([key, label]) => (
            <button
              key={key}
              className={`vendor-orders-tab ${statusFilter === key ? "active" : ""}`}
              onClick={() => setStatusFilter(key)}
            >
              {label}
              <span className="vendor-orders-tab-count">{statusCounts[key] || 0}</span>
            </button>
          ))}
        </div>

        <div className="vendor-orders-table-header">
          <span>ID Pedido</span>
          <span>Cliente</span>
          <span>Estado</span>
          <span>Domiciliario</span>
          <span>Total</span>
          <span>Tiempo</span>
          <span>Acciones</span>
        </div>

        <div className="vendor-orders-list">
          {filteredOrders.length === 0 && statusFilter !== "todos" ? (
            <div className="vendor-orders-empty-filter">
              <p>No hay pedidos con estado "{STATUS_CONFIG[statusFilter]?.label || statusFilter}"</p>
            </div>
          ) : null}
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || { color: 'gray', label: order.status, icon: <Package size={14} /> };
            return (
              <div key={order.order_id} className="vendor-order-item">
                <div className="order-main-info">
                  <div className="order-id-status">
                    <span className="order-id">#{order.order_id.slice(-6).toUpperCase()}</span>
                  </div>

                  <div className="order-customer">
                    <User size={16} />
                    <span>{order.customer_name}</span>
                  </div>

                  <div className={`order-status status-${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </div>

                  <div className="order-courier">
                    <User size={16} />
                    <span className="courier-name">{order.courier_name || 'No asignado'}</span>
                  </div>

                  <div className="order-total">
                    <span className="total-amount">${order.total.toLocaleString()}</span>
                  </div>

                  <div className="order-time">
                    <Clock size={14} />
                    <span>{order.time_elapsed}</span>
                  </div>

                  <div className="order-actions">
                    {order.status !== 'PENDING' && (
                      <button
                        className={`status-btn status-${statusConfig.color}`}
                        onClick={() => handleStatusChange(order)}
                        title={`Estado actual: ${statusConfig.label}. Click para avanzar`}
                      >
                        {statusConfig.icon} {statusConfig.label}
                      </button>
                    )}

                    {order.status === 'READY' && !order.courier_name && (
                      <button
                        className="publish-btn"
                        onClick={() => handlePublishOrder(order)}
                      >
                        Publicar
                      </button>
                    )}

                    
                    <button
                      className="details-btn"
                      onClick={() => handleDetailsClick(order)}
                    >
                      Detalles
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isModalOpen && selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;