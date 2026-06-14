import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../../context/useAuth";
import { DarkModeProvider } from "../../../context/useDarkMode";
import "./AdminLayout.css";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();

  return (
    <DarkModeProvider>
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-layout-content">
          <header className="admin-topbar">
            <span className="admin-topbar-role">
              {user?.role === "SuperAdmin" ? "Super Administrador" : "Administrador"}
            </span>
            <div className="admin-topbar-right">
              <span className="admin-topbar-email">{user?.email}</span>
              <button className="admin-topbar-logout" onClick={() => logout()}>
                <LogOut size={16} /> Salir
              </button>
            </div>
          </header>
          <main className="admin-layout-main">{children}</main>
        </div>
      </div>
    </DarkModeProvider>
  );
};

export default AdminLayout;
