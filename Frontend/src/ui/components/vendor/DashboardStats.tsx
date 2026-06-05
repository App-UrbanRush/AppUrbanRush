import { DollarSign, Package, Star, Bike } from "lucide-react";
import StatsCard from "./StatsCard";
import "./DashboardStats.css";

const DashboardStats = () => {
  // Temporarily show placeholder stats since the API functions were removed
  const stats = {
    ventasHoy: 0,
    pedidosTotales: 0,
    calificacionPromedio: 0,
    domiciliariosActivos: 0,
  };

  return (
    <div className="dashboard-stats">
      <StatsCard
        title="Ventas Hoy"
        value={`$${stats.ventasHoy.toLocaleString()}`}
        icon={DollarSign}
        color="blue"
      />
      <StatsCard
        title="Pedidos Totales"
        value={stats.pedidosTotales}
        icon={Package}
        color="green"
      />
      <StatsCard
        title="Calificación Promedio"
        value={`${stats.calificacionPromedio.toFixed(1)} ⭐`}
        icon={Star}
        color="orange"
      />
      <StatsCard
        title="Domiciliarios Activos"
        value={stats.domiciliariosActivos}
        icon={Bike}
        color="purple"
      />
    </div>
  );
};

export default DashboardStats;