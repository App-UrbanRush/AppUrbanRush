import { useState, useEffect } from "react";
import { DollarSign, Package, Star, Bike } from "lucide-react";
import StatsCard from "./StatsCard";
import { authLocalStorage } from "../../../infrastructure/persistence/authLocalStorage";
import type { VendorDashboardStats } from "../../../domain/types/vendor-dashboard.types";
import "./DashboardStats.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DashboardStats = () => {
  const [stats, setStats] = useState<VendorDashboardStats>({
    ventasHoy: 0,
    pedidosTotales: 0,
    calificacionPromedio: 0,
    domiciliariosActivos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = authLocalStorage.getToken();
        if (!token) {
          throw new Error('No hay sesión iniciada. Por favor inicia sesión.');
        }
        
        const response = await fetch(`${API_URL}/vendor/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error ${response.status}: ${errorData || response.statusText}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar las métricas';
        setError(errorMsg);
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-stats-loading">
        <div className="spinner"></div>
        <p>Cargando métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-stats-error-visible">
        <p>⚠️ No se pudieron cargar las métricas</p>
        <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.8 }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: '12px', 
            padding: '8px 16px', 
            cursor: 'pointer',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600'
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

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