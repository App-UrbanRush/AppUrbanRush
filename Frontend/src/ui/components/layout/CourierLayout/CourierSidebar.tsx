import { Link, useLocation } from "react-router-dom";
import { Home, User } from "lucide-react";
import "./CourierSidebar.css";

const menuItems = [
  {
    label: "Inicio",
    path: "/courier/dashboard",
    icon: <Home size={28} />,
  },
  {
    label: "Mi Perfil",
    path: "/courier/profile",
    icon: <User size={28} />,
  },
];

const CourierSidebar = () => {
  const location = useLocation();

  return (
    <aside className="courier-sidebar">
      <div className="courier-sidebar-logo">
        <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="17" fill="#e8500a"/>
          <path d="M9 21 Q17 11 25 21" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="17" cy="21" r="3.5" fill="white"/>
        </svg>
        <h1>UrbanRush</h1>
      </div>

      <nav className="courier-sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.label} className="courier-sidebar-menu-item">
            <Link
              to={item.path}
              className={`courier-sidebar-menu-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="courier-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default CourierSidebar;
