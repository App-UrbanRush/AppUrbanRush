import type { ReactNode } from "react";
import CourierSidebar from "./CourierSidebar";
import CourierHeader from "./CourierHeader";
import { DarkModeProvider } from "../../../context/useDarkMode";
import "./CourierLayout.css";

interface CourierLayoutProps {
  children: ReactNode;
}

const CourierLayout = ({ children }: CourierLayoutProps) => {
  return (
    <DarkModeProvider>
      <div className="courier-layout">
        <CourierSidebar />
        <div className="courier-layout-content">
          <CourierHeader />
          <main className="courier-layout-main">{children}</main>
        </div>
      </div>
    </DarkModeProvider>
  );
};

export default CourierLayout;
