import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import "./RecentOrders.css";

const RecentOrders = () => {
  const navigate = useNavigate();

  return (
    <div className="recent-orders-section">
      <div className="recent-orders-header">
        <h2>Pedidos Recientes</h2>
        <button className="view-all-btn" onClick={() => navigate("/vendor/dashboard/pedidos")}>
          Ver todos →
        </button>
      </div>

      <div className="recent-orders-empty">
        <Package size={48} />
        <h3>No hay pedidos recientes</h3>
        <p>Los pedidos pendientes, aceptados, en preparación o listos aparecerán aquí</p>
      </div>
    </div>
  );
};

export default RecentOrders;