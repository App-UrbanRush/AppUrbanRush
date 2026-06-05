import type { ReactNode } from "react";
import VendorSidebar from "./VendorSidebar";
import VendorHeader from "./VendorHeader";
import { DarkModeProvider } from "../../../context/useDarkMode";
import "./VendorLayout.css";

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout = ({ children }: VendorLayoutProps) => {
  return (
    <DarkModeProvider>
      <div className="vendor-layout">
        <VendorSidebar />
        <div className="vendor-layout-content">
          <VendorHeader />
          <main className="vendor-layout-main">{children}</main>
        </div>
      </div>
    </DarkModeProvider>
  );
};

export default VendorLayout;