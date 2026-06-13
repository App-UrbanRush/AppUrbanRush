import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { vendorsApi, type VendorListItem, type VendorPhotoItem } from "../../../infrastructure/api/vendorsApi";
import { courierVendorRequestsApi, type CourierVendorRequest } from "../../../infrastructure/api/courierVendorRequestsApi";
import { courierOrdersApi, type CourierOrder } from "../../../infrastructure/api/courierOrdersApi";
import { useAuth } from "../../context/useAuth";
import { AcceptOrderUseCase } from "../../../application/use-cases/AcceptOrderUseCase";
import { CourierOrdersRepositoryImpl } from "../../../infrastructure/repositories/CourierOrdersRepositoryImpl";
import toast from "react-hot-toast";
import {
  Store,
  Navigation,
  Smartphone,
  Clock,
  X,
  Eye,
  Image,
  CheckCircle,
  Clock as ClockIcon,
  Truck,
  Package,
  ChevronRight,
  Play,
  MapPin,
  RefreshCw,
} from "lucide-react";
import "./CourierDashboard.css";

const CourierDashboard = () => {
  const navigate = useNavigate();
  const { courierProfile } = useAuth();
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorListItem | null>(null);
  const [vendorPhotos, setVendorPhotos] = useState<VendorPhotoItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [myRequests, setMyRequests] = useState<CourierVendorRequest[]>([]);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeVendorName, setWelcomeVendorName] = useState("");
  const [activeView, setActiveView] = useState<"browse" | "active">("browse");
  
  // Pedidos
  const [availableOrders, setAvailableOrders] = useState<CourierOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<CourierOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CourierOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const acceptOrderUseCase = new AcceptOrderUseCase(new CourierOrdersRepositoryImpl());

  // Polling para pedidos disponibles (cada 5 segundos)
  useEffect(() => {
    if (activeView === "active") {
      loadOrders();
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [activeView]);

  useEffect(() => {
    loadVendors();
    loadMyRequests();
  }, []);

  useEffect(() => {
    if (activeView === "active" && courierProfile?.couriers_id) {
      loadOrders();
    }
  }, [activeView, courierProfile]);

  useEffect(() => {
    if (selectedVendor) {
      loadPhotos(selectedVendor.vendor_id);
    } else {
      setVendorPhotos([]);
    }
  }, [selectedVendor]);

  const loadVendors = async () => {
    try {
      const data = await vendorsApi.getAll();
      setVendors(data);
    } catch (error) {
      console.error("Error loading vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const data = await courierVendorRequestsApi.getMyRequests();
      setMyRequests(data);
      const hasAccepted = data.some((r) => r.status === "accepted");
      if (hasAccepted) {
        setActiveView("active");
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const loadOrders = async () => {
    if (!courierProfile?.user_id) {
      console.warn("Courier profile or user_id not available");
      return;
    }
    
    setLoadingOrders(true);
    try {
      // Cargar pedidos disponibles (READY sin courier_id)
      const available = await courierOrdersApi.getAvailable();
      
      // Cargar pedidos del courier (activos y completados)
      const allCourierOrders = await courierOrdersApi.getByCourier(courierProfile.user_id);
      const active = allCourierOrders.filter(o => o.status === 'IN_DELIVERY');
      const completed = allCourierOrders.filter(o => o.status === 'DELIVERED');
      
      setAvailableOrders(available);
      setActiveOrders(active);
      setCompletedOrders(completed);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!courierProfile?.user_id) return;
    
    try {
      await acceptOrderUseCase.execute(orderId, courierProfile.user_id);
      toast.success("¡Pedido aceptado! Iniciando ruta...");
      await loadOrders(); // Recargar para que desaparezca de disponibles
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Error al aceptar el pedido";
      toast.error(msg);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!courierProfile?.user_id) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cancelar');
      }
      
      toast.success("Pedido cancelado, vuelto a disponibles");
      await loadOrders();
    } catch (error: any) {
      toast.error(error.message || "Error al cancelar el pedido");
    }
  };

  const handleViewRoute = (order: CourierOrder) => {
    if (!order.customer_lat || !order.customer_lng) {
      toast.error('El cliente no tiene ubicación registrada');
      return;
    }
    
    navigate(`/courier/tracking/${order.order_id}`);
  };

  const loadPhotos = async (vendorId: number) => {
    setLoadingPhotos(true);
    try {
      const data = await vendorsApi.getPhotos(vendorId);
      setVendorPhotos(data);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const getRequestStatus = (vendorId: number): string | null => {
    const request = myRequests.find((r) => r.vendor_id === vendorId);
    if (!request) return null;
    if (request.status === "rejected") return null;
    return request.status;
  };

  const handleSendRequest = async (vendorId: number) => {
    setSendingRequest(vendorId);
    try {
      await courierVendorRequestsApi.sendRequest(vendorId);
      toast.success("Solicitud enviada correctamente");
      await loadMyRequests();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al enviar solicitud";
      toast.error(msg);
    } finally {
      setSendingRequest(null);
    }
  };

  const handleStartWorking = () => {
    setWelcomeOpen(false);
    setActiveView("active");
  };

  const getPlaceholderClass = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("comida") || t.includes("restaurante") || t.includes("hamburguesa") || t.includes("pizza") || t.includes("sushi") || t.includes("tacos") || t.includes("pollo")) return "food";
    if (t.includes("cafe") || t.includes("café") || t.includes("bebida") || t.includes("bar")) return "drinks";
    if (t.includes("mercado") || t.includes("fruter") || t.includes("verduler") || t.includes("supermercado")) return "grocery";
    if (t.includes("farmacia") || t.includes("drogueria") || t.includes("droguería")) return "pharmacy";
    return "default";
  };

  const getEmoji = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("comida") || t.includes("restaurante") || t.includes("hamburguesa")) return "🍔";
    if (t.includes("pizza")) return "🍕";
    if (t.includes("sushi")) return "🍣";
    if (t.includes("tacos") || t.includes("mexicana")) return "🌮";
    if (t.includes("cafe") || t.includes("café")) return "☕";
    if (t.includes("pollo")) return "🍗";
    if (t.includes("pescado") || t.includes("mariscos")) return "🐟";
    if (t.includes("helado") || t.includes("dulce")) return "🍦";
    if (t.includes("pan") || t.includes("reposteria") || t.includes("repostería")) return "🥐";
    if (t.includes("saludable") || t.includes("ensalada")) return "🥗";
    if (t.includes("mercado") || t.includes("fruter")) return "🛒";
    if (t.includes("farmacia")) return "💊";
    return "🏪";
  };

  const renderRequestTag = (vendorId: number) => {
    const status = getRequestStatus(vendorId);
    if (!status) return null;
    const map: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
      pending: { cls: "tag-pending", label: "Pendiente", icon: <ClockIcon size={11} /> },
    };
    const cfg = map[status];
    if (!cfg) return null;
    return (
      <span className={`courier-dashboard-card-request-tag ${cfg.cls}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const renderAction = (vendorId: number) => {
    const status = getRequestStatus(vendorId);
    if (status === "pending") {
      return (
        <button className="courier-dashboard-card-btn-pending" disabled>
          <ClockIcon size={14} /> Pendiente
        </button>
      );
    }
    if (status === "accepted") {
      const vendorName = vendors.find((v) => v.vendor_id === vendorId)?.business_name || "el negocio";
      return (
        <button
          className="courier-dashboard-card-btn-accepted"
          onClick={() => {
            setWelcomeVendorName(vendorName);
            setWelcomeOpen(true);
          }}
        >
          <CheckCircle size={14} /> Aceptado
        </button>
      );
    }
    return (
      <button
        className="courier-dashboard-card-btn"
        onClick={() => handleSendRequest(vendorId)}
        disabled={sendingRequest === vendorId}
      >
        {sendingRequest === vendorId ? "Enviando..." : "Registrarme"}
      </button>
    );
  };

  return (
    <CourierLayout>
      <div className="courier-dashboard">
        {/* ========== VISTA: ACTIVO (En ruta + Historial) ========== */}
        {activeView === "active" ? (
          <div className="courier-dashboard-active-layout">
            <div className="courier-dashboard-left">
              <div className="courier-active-header">
                <div>
                </div>
                <button className="courier-browse-btn" onClick={() => setActiveView("browse")}>
                  <Store size={16} /> Ver Negocios
                </button>
              </div>

              {/* Sección: Pedidos Disponibles */}
              <div className="courier-active-section">
                <div className="courier-section-header">
                  <div className="courier-section-icon assigned">
                    <Package size={18} />
                  </div>
                  <h2>Pedidos Disponibles</h2>
                  <button className="courier-refresh-small" onClick={loadOrders} disabled={loadingOrders}>
                    <RefreshCw size={14} className={loadingOrders ? "spinning" : ""} />
                  </button>
                </div>
                
                {loadingOrders && availableOrders.length === 0 ? (
                  <div className="courier-orders-loading">Cargando pedidos...</div>
                ) : availableOrders.length === 0 ? (
                  <div className="courier-active-empty">
                    <Package size={40} />
                    <p>No hay pedidos disponibles</p>
                    <span>Cuando un negocio publique un pedido, aparecerá aquí</span>
                  </div>
                ) : (
                  <div className="courier-orders-list">
                    {availableOrders.map((order) => (
                      <div key={order.order_id} className="courier-order-card available">
                        <div className="courier-order-header">
                          <span className="courier-order-id">#{order.order_id.slice(-6).toUpperCase()}</span>
                          <span className="courier-order-status status-available">Disponible</span>
                        </div>
                        <div className="courier-order-info">
                          <MapPin size={14} />
                          <span>{order.delivery_address}</span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="courier-order-info">
                            <Package size={14} />
                            <span>{order.items.length} producto(s)</span>
                          </div>
                        )}
                        {order.delivery_fee && (
                          <div className="courier-order-info">
                            <ClockIcon size={14} />
                            <span>Domicilio: ${order.delivery_fee.toLocaleString()}</span>
                          </div>
                        )}
                        <button
                          className="courier-accept-order-btn"
                          onClick={() => handleAcceptOrder(order.order_id)}
                        >
                          <Play size={16} /> Aceptar Pedido
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección: En Ruta */}
              <div className="courier-active-section">
                <div className="courier-section-header">
                  <div className="courier-section-icon active-pulse">
                    <Truck size={18} />
                  </div>
                  <h2>En Ruta</h2>
                </div>
                
                {loadingOrders && activeOrders.length === 0 ? (
                  <div className="courier-orders-loading">Cargando pedidos...</div>
                ) : activeOrders.length === 0 ? (
                  <div className="courier-active-empty">
                    <Package size={40} />
                    <p>No tienes entregas activas en este momento</p>
                    <span>Los pedidos que aceptes aparecerán aquí</span>
                  </div>
                ) : (
                  <div className="courier-orders-list">
                    {activeOrders.map((order) => (
                      <div key={order.order_id} className="courier-order-card active">
                        <div className="courier-order-header">
                          <span className="courier-order-id">#{order.order_id.slice(-6).toUpperCase()}</span>
                          <span className="courier-order-status status-in-delivery">En entrega</span>
                        </div>
                        <div className="courier-order-info">
                          <MapPin size={14} />
                          <span>{order.delivery_address}</span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="courier-order-info">
                            <Package size={14} />
                            <span>{order.items.length} producto(s)</span>
                          </div>
                        )}
                        <div className="courier-order-actions">
                          <button
                            className="courier-view-route-btn"
                            onClick={() => handleViewRoute(order)}
                          >
                            <Navigation size={14} /> Ver Ruta en Mapa
                          </button>
                          <button
                            className="courier-cancel-order-btn"
                            onClick={() => handleCancelOrder(order.order_id)}
                          >
                            <X size={14} /> Cancelar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ========== VISTA: NEGOCIOS ========== */}
            <div className="courier-active-header">
              <div>
                <h1>Negocios</h1>
                <p className="courier-dashboard-subtitle">Encuentra negocios para asociarte</p>
              </div>
            </div>

            {loading ? (
              <div className="courier-dashboard-loading">Cargando negocios...</div>
            ) : vendors.length === 0 ? (
              <div className="courier-dashboard-empty">No hay negocios registrados</div>
            ) : (
              <div className="courier-dashboard-grid">
                {vendors.map((vendor) => (
                  <div key={vendor.vendor_id} className="courier-dashboard-card">
                    <div className="courier-dashboard-card-image">
                      {vendor.logo_url ? (
                        <img src={vendor.logo_url} alt={vendor.business_name} />
                      ) : (
                        <div className={`courier-dashboard-card-image-placeholder ${getPlaceholderClass(vendor.business_type)}`}>
                          {getEmoji(vendor.business_type)}
                        </div>
                      )}
                      <span className="courier-dashboard-card-type-overlay">{vendor.business_type}</span>
                      <div className={`courier-dashboard-card-status-dot ${vendor.status}`} title={vendor.status} />
                    </div>

                    <div className="courier-dashboard-card-content">
                      <div className="courier-dashboard-card-top-row">
                        <div className="courier-dashboard-card-title" style={{ minWidth: 0, flex: 1 }}>
                          <h3>{vendor.business_name}</h3>
                        </div>
                        {renderRequestTag(vendor.vendor_id)}
                      </div>

                      <div className="courier-dashboard-card-info-row">
                        <span className="courier-dashboard-card-info-chip">
                          <Navigation size={12} /> {vendor.address}
                        </span>
                        <span className="courier-dashboard-card-info-chip">
                          <Smartphone size={12} /> {vendor.phone}
                        </span>
                        {vendor.business_hours && (
                          <span className="courier-dashboard-card-info-chip">
                            <Clock size={12} /> {vendor.business_hours}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="courier-dashboard-card-actions">
                      {renderAction(vendor.vendor_id)}
                      <button className="courier-dashboard-card-btn-outline" onClick={() => setSelectedVendor(vendor)}>
                        <Eye size={14} /> Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ========== MODAL: BIENVENIDA ========== */}
      {welcomeOpen && (
        <div className="courier-welcome-overlay" onClick={() => setWelcomeOpen(false)}>
          <div className="courier-welcome-modal" onClick={(e) => e.stopPropagation()}>
            <div className="courier-welcome-icon-wrap">
              <CheckCircle size={48} />
            </div>
            <h2>¡Bienvenido!</h2>
            <p>Ahora eres parte del equipo de <strong>{welcomeVendorName}</strong></p>

            <div className="courier-welcome-steps">
              <div className="courier-welcome-step">
                <div className="courier-welcome-step-icon"><Truck size={18} /></div>
                <div>
                  <h4>Entrega pedidos</h4>
                  <p>Los pedidos del negocio aparecerán en tu panel.</p>
                </div>
              </div>
              <div className="courier-welcome-step">
                <div className="courier-welcome-step-icon"><Navigation size={18} /></div>
                <div>
                  <h4>Sigue la ruta</h4>
                  <p>Usa el mapa para encontrar al cliente rápido.</p>
                </div>
              </div>
            </div>

            <button className="courier-welcome-start-btn" onClick={handleStartWorking}>
              Iniciar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ========== MODAL: DETALLES NEGOCIO ========== */}
      {selectedVendor && (
        <div className="courier-modal-overlay" onClick={() => setSelectedVendor(null)}>
          <div className="courier-modal" onClick={(e) => e.stopPropagation()}>
            <button className="courier-modal-close" onClick={() => setSelectedVendor(null)}>
              <X size={18} />
            </button>

            {selectedVendor.logo_url ? (
              <div className="courier-modal-banner">
                <img src={selectedVendor.logo_url} alt="Local" className="courier-modal-banner-img" />
              </div>
            ) : (
              <div className={`courier-modal-banner-placeholder ${getPlaceholderClass(selectedVendor.business_type)}`}>
                {getEmoji(selectedVendor.business_type)}
              </div>
            )}

            <div className="courier-modal-content">
              <div className="courier-modal-header">
                {selectedVendor.logo_url ? (
                  <img src={selectedVendor.logo_url} alt="Logo" className="courier-modal-logo" />
                ) : (
                  <div className="courier-modal-logo-placeholder">
                    <Store size={22} />
                  </div>
                )}
                <div className="courier-modal-header-text">
                  <h2>{selectedVendor.business_name}</h2>
                  <span className="courier-modal-type">{selectedVendor.business_type}</span>
                </div>
              </div>

              <div className="courier-modal-section">
                <h3>Información</h3>
                <div className="courier-modal-fields">
                  <div className="courier-modal-field">
                    <div className="courier-modal-field-icon blue"><Navigation size={16} /></div>
                    <div>
                      <span className="courier-modal-label">Dirección</span>
                      <span className="courier-modal-value">{selectedVendor.address}</span>
                    </div>
                  </div>
                  <div className="courier-modal-field">
                    <div className="courier-modal-field-icon green"><Smartphone size={16} /></div>
                    <div>
                      <span className="courier-modal-label">Teléfono</span>
                      <span className="courier-modal-value">{selectedVendor.phone}</span>
                    </div>
                  </div>
                  {selectedVendor.business_hours && (
                    <div className="courier-modal-field">
                      <div className="courier-modal-field-icon purple"><Clock size={16} /></div>
                      <div>
                        <span className="courier-modal-label">Horario</span>
                        <span className="courier-modal-value">{selectedVendor.business_hours}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedVendor.description && (
                <div className="courier-modal-section">
                  <h3>Descripción</h3>
                  <p className="courier-modal-desc">{selectedVendor.description}</p>
                </div>
              )}

              <div className="courier-modal-section">
                <h3><Image size={14} /> Fotos</h3>
                {loadingPhotos ? (
                  <p className="courier-modal-photos-loading">Cargando fotos...</p>
                ) : vendorPhotos.length === 0 ? (
                  <p className="courier-modal-photos-empty">No hay fotos disponibles</p>
                ) : (
                  <div className="courier-modal-photos-grid">
                    {vendorPhotos.map((photo) => (
                      <div key={photo.photo_id} className="courier-modal-photo-item">
                        <img src={photo.image_url} alt="Foto del local" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="courier-modal-register">
                {renderAction(selectedVendor.vendor_id)}
              </div>
            </div>
          </div>
        </div>
      )}
    </CourierLayout>
  );
};

export default CourierDashboard;
