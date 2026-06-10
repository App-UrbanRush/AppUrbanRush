import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  BookOpen,
  Star,
  Bike,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import "./VendorSidebar.css";

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  submenu?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    path: "/vendor/dashboard",
    icon: <Home size={28} />,
  },
  {
    label: "Pedidos",
    path: "/vendor/dashboard/pedidos",
    icon: <Package size={28} />,
  },
  {
    label: "Menú",
    icon: <BookOpen size={28} />,
    submenu: [
      { label: "Ver Catálogo", path: "/vendor/dashboard/menu/catalogo" },
      { label: "Gestionar Categorías", path: "/vendor/dashboard/menu/categorias" },
    ],
  },
  {
    label: "Reseñas",
    path: "/vendor/dashboard/resenas",
    icon: <Star size={28} />,
  },
  {
    label: "Domiciliarios",
    path: "/vendor/dashboard/domiciliarios",
    icon: <Bike size={28} />,
  },
  {
    label: "Solicitudes",
    path: "/vendor/dashboard/solicitudes",
    icon: <Send size={28} />,
  },
  {
    label: "Reportes",
    path: "/vendor/dashboard/reportes",
    icon: <BarChart3 size={28} />,
  },
  {
    label: "Configuración",
    path: "/vendor/dashboard/configuracion",
    icon: <Settings size={28} />,
  },
];

const VendorSidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const toggleMenu = (index: number) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  return (
    <aside className="vendor-sidebar">
      <div className="vendor-sidebar-logo">
        <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="17" fill="#e8500a"/>
          <path d="M9 21 Q17 11 25 21" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="17" cy="21" r="3.5" fill="white"/>
        </svg>
        <h1>UrbanRush</h1>
      </div>

      <nav className="vendor-sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={item.label} className="sidebar-menu-item">
            {item.submenu ? (
              <>
                <button
                  className={`sidebar-menu-button ${openMenu === index ? "active" : ""}`}
                  onClick={() => toggleMenu(index)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {openMenu === index ? (
                    <ChevronUp size={16} className="sidebar-chevron" />
                  ) : (
                    <ChevronDown size={16} className="sidebar-chevron" />
                  )}
                </button>
                {openMenu === index && (
                  <ul className="sidebar-submenu">
                    {item.submenu.map((subitem) => (
                      <li key={subitem.label}>
                        <Link
                          to={subitem.path}
                          className={`sidebar-submenu-link ${
                            location.pathname === subitem.path ? "active" : ""
                          }`}
                        >
                          {subitem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path!}
                className={`sidebar-menu-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default VendorSidebar;