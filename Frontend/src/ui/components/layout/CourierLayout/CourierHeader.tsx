import { useState } from "react";
import { Bell, User, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import { useDarkMode } from "../../../context/useDarkMode";
import "./CourierHeader.css";

const CourierHeader = () => {
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const displayName = user?.name || "Domiciliario";

  return (
    <header className="courier-header">
      <div className="courier-header-left"></div>

      <div className="courier-header-center"></div>

      <div className="courier-header-right">
        <button
          className="courier-header-dark-mode-btn"
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="courier-header-notification-btn">
          <Bell size={20} />
        </button>

        <div className="courier-header-profile">
          <button
            className="courier-header-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-icon">
              <User size={20} />
            </div>
            <div className="profile-info">
              <span className="profile-name">{displayName}</span>
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

export default CourierHeader;
