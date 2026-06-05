import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { Link } from "react-router-dom";
import "./VendorMenu.css";

const VendorMenu = () => {
  return (
    <VendorLayout>
      <div className="vendor-menu">
        <h1>Menú</h1>
        <div className="menu-options">
          <Link to="/vendor/dashboard/menu/catalogo" className="menu-option-card">
            <h2>Ver Catálogo</h2>
            <p>Consulta todos los productos de tu menú</p>
          </Link>
          <Link to="/vendor/dashboard/menu/categorias" className="menu-option-card">
            <h2>Gestionar Categorías</h2>
            <p>Administra las categorías de tus productos</p>
          </Link>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorMenu;