import { useState, useEffect, useRef } from "react";
import { Bell, Search, User, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useDarkMode } from "../../../context/useDarkMode";
import { vendorNotificationsApi, type PendingOrderNotification } from "../../../../infrastructure/api/vendorNotificationsApi";
import "./VendorHeader.css";

const VendorHeader = () => {
  const { logout, vendorProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrderNotification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPendingOrders();
    const interval = setInterval(loadPendingOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadPendingOrders = async () => {
    try {
      const data = await vendorNotificationsApi.getPendingOrders();
      setPendingOrders(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleOrderClick = (orderId: string) => {
    setShowNotifications(false);
    navigate("/vendor/dashboard/pedidos");
  };

  const timeAgo = (date: Date | null): string => {
    if (!date) return "";
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${Math.floor(diffHours / 24)}d`;
  };

  const displayName = vendorProfile?.business_name || "Mi Restaurante";
  const displayAddress = vendorProfile?.address || "";

  return (
    <header className="vendor-header">
      <div className="vendor-header-left"></div>

      <div className="vendor-header-center">
        <div className="vendor-header-search">
          <Search size={18} className="vendor-header-search-icon" />
          <input
            type="text"
            placeholder="Buscar..."
            className="vendor-header-search-input"
          />
        </div>
      </div>

      <div className="vendor-header-right">
        <button
          className="vendor-header-dark-mode-btn"
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="vendor-header-notification" ref={notificationRef}>
          <button
            className="vendor-header-notification-btn"
            onClick={handleNotificationClick}
          >
            <Bell size={20} />
            {pendingOrders.length > 0 && (
              <span className="notification-badge">{pendingOrders.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span>Pedidos nuevos ({pendingOrders.length})</span>
              </div>
              {pendingOrders.length === 0 ? (
                <div className="notification-empty">
                  No hay pedidos pendientes
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <button
                    key={order.order_id}
                    className="notification-item"
                    onClick={() => handleOrderClick(order.order_id)}
                  >
                    <div className="notification-item-icon">
                      <span>📦</span>
                    </div>
                    <div className="notification-item-content">
                      <span className="notification-item-title">
                        {order.customer_name} — ${order.total.toLocaleString("es-CO")}
                      </span>
                      <span className="notification-item-address">
                        {order.delivery_address}
                      </span>
                      <span className="notification-item-time">
                        {timeAgo(order.created_at)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="vendor-header-profile">
          <button
            className="vendor-header-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-icon">
              {vendorProfile?.logo_url ? (
                <img
                  src={vendorProfile.logo_url}
                  alt="Logo"
                  className="profile-logo"
                />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="profile-info">
              <span className="profile-name">{displayName}</span>
              {displayAddress && (
                <span className="profile-address">{displayAddress}</span>
              )}
            </div>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <button onClick={handleLogout} className="dropdown-item">
                <LogOut size={16} />
                <span>Cerrar Sesion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;