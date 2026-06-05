import { useState } from "react";
import { Bell, Search, User, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import { useDarkMode } from "../../../context/useDarkMode";
import "./VendorHeader.css";

const VendorHeader = () => {
  const { logout, vendorProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  // Usar business_name del vendorProfile
  const displayName = vendorProfile?.business_name || "Mi Restaurante";
  const displayAddress = vendorProfile?.address || "";

  return (
    <header className="vendor-header">
      <div className="vendor-header-left">
        {/* Nombre del restaurante eliminado del lado izquierdo */}
      </div>

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
        <button className="vendor-header-notification-btn">
          <Bell size={20} />
          <span className="notification-badge">0</span>
        </button>

        <div className="vendor-header-profile">
          <button
            className="vendor-header-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-icon">
              <User size={20} />
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
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;