import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Moon, Sun, UserCircle } from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import { useDarkMode } from "../../../context/useDarkMode";
import "./CourierHeader.css";

const CourierHeader = () => {
  const navigate = useNavigate();
  const { logout, user, courierProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const goToProfile = () => {
    setShowProfileMenu(false);
    navigate("/courier/profile");
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
              {courierProfile?.photo_url ? (
                <img src={courierProfile.photo_url} alt="Foto de perfil" className="profile-photo" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="profile-info">
              <span className="profile-name">{displayName}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <button onClick={goToProfile} className="dropdown-item">
                <UserCircle size={16} />
                <span>Mi Perfil</span>
              </button>
              <div className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
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
