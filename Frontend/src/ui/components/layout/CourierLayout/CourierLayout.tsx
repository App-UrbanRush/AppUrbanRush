import { useState, type ReactNode } from "react";
import CourierSidebar from "./CourierSidebar";
import CourierHeader from "./CourierHeader";
import { DarkModeProvider } from "../../../context/useDarkMode";
import "./CourierLayout.css";

interface CourierLayoutProps {
  children: ReactNode;
}

const STORAGE_KEY = "courier_sidebar_collapsed";

const CourierLayout = ({ children }: CourierLayoutProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <DarkModeProvider>
      <div className="courier-layout">
        <CourierSidebar collapsed={collapsed} onToggle={toggle} />
        <div className={`courier-layout-content ${collapsed ? "collapsed" : ""}`}>
          <CourierHeader />
          <main className="courier-layout-main">{children}</main>
        </div>
      </div>
    </DarkModeProvider>
  );
};

export default CourierLayout;
