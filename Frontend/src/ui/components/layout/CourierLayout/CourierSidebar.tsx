import { Link, useLocation } from "react-router-dom";
import { Home, Bike, PackageSearch, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import "./CourierSidebar.css";

const menuItems = [
  {
    label: "Inicio",
    path: "/courier/dashboard",
    icon: <Home size={24} />,
  },
  {
    label: "Disponibles",
    path: "/courier/available",
    icon: <PackageSearch size={24} />,
  },
  {
    label: "Mis Entregas",
    path: "/courier/deliveries",
    icon: <Bike size={24} />,
  },
  {
    label: "Mis Ganancias",
    path: "/courier/earnings",
    icon: <Wallet size={24} />,
  },
];

interface CourierSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const CourierSidebar = ({ collapsed, onToggle }: CourierSidebarProps) => {
  const location = useLocation();

  return (
    <aside className={`courier-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="courier-sidebar-logo">
        <img src="/Logo-png.png" alt="UrbanRush" className="courier-sidebar-logo-img" />
        {!collapsed && <h1>UrbanRush</h1>}
      </div>

      <button
        className="courier-sidebar-toggle"
        onClick={onToggle}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        title={collapsed ? "Expandir" : "Colapsar"}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="courier-sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.label} className="courier-sidebar-menu-item">
            <Link
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`courier-sidebar-menu-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="courier-sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="courier-sidebar-label">{item.label}</span>}
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default CourierSidebar;
