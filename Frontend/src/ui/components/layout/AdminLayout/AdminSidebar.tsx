import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, ShieldCheck, ScrollText, Wallet, BarChart3, DatabaseBackup, Lock,
} from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import "./AdminSidebar.css";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { label: "Resumen", path: "/admin/dashboard", icon: <LayoutDashboard size={24} /> },
  { label: "Usuarios", path: "/admin/dashboard/usuarios", icon: <Users size={24} /> },
  { label: "Admins", path: "/admin/dashboard/admins", icon: <ShieldCheck size={24} />, superAdminOnly: true },
  { label: "Auditoría", path: "/admin/dashboard/auditoria", icon: <ScrollText size={24} />, superAdminOnly: true },
  { label: "Liquidaciones", path: "/admin/dashboard/liquidaciones", icon: <Wallet size={24} /> },
  { label: "Reportes", path: "/admin/dashboard/reportes", icon: <BarChart3 size={24} /> },
  { label: "Backups", path: "/admin/dashboard/backups", icon: <DatabaseBackup size={24} /> },
  { label: "Archivos cifrados", path: "/admin/dashboard/archivos", icon: <Lock size={24} /> },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SuperAdmin";

  const items = menuItems.filter((i) => !i.superAdminOnly || isSuperAdmin);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src="/Logo-png.png" alt="UrbanRush" className="admin-sidebar-logo-img" />
        <h1>UrbanRush</h1>
        <span className="admin-sidebar-badge">Panel Admin</span>
      </div>

      <nav className="admin-sidebar-nav">
        {items.map((item) => {
          const active =
            item.path === "/admin/dashboard"
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-link ${active ? "active" : ""}`}
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
