import type { ReactNode } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { CartDrawerProvider } from "../../../context/CartDrawerContext";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <CartDrawerProvider>
      <div className="layout">
        <Navbar />
        <main className="layout-main">{children}</main>
        <Footer />
      </div>
    </CartDrawerProvider>
  );
};

export default Layout;
