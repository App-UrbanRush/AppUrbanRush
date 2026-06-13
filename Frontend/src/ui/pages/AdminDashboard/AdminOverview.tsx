import { useEffect, useState } from "react";
import { Users, Package, CreditCard, Store, Bike, DollarSign, Wallet } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import { AdminRepositoryImpl } from "../../../infrastructure/repositories/AdminRepositoryImpl";
import type { SystemStats } from "../../../domain/types/admin.types";
import "./AdminCommon.css";

const repo = new AdminRepositoryImpl();
const money = (n: number) => `$${(n ?? 0).toLocaleString("es-CO")}`;

const StatusBars = ({ data }: { data: Record<string, number> }) => {
  const entries = Object.entries(data ?? {});
  const max = Math.max(...entries.map(([, v]) => v), 1);
  if (entries.length === 0) return <p className="admin-empty">Sin datos</p>;
  return (
    <>
      {entries.map(([k, v]) => (
        <div className="admin-bar-row" key={k}>
          <span className="admin-bar-label">{k}</span>
          <div className="admin-bar-track">
            <div className="admin-bar-fill" style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <span className="admin-bar-count">{v}</span>
        </div>
      ))}
    </>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    repo.getStats()
      .then(setStats)
      .catch((e) => console.error("Error cargando stats:", e))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Usuarios", value: stats.total_users, icon: Users, color: "#3b82f6" },
    { label: "Pedidos", value: stats.total_orders, icon: Package, color: "#8b5cf6" },
    { label: "Pagos", value: stats.total_payments, icon: CreditCard, color: "#06b6d4" },
    { label: "Negocios", value: stats.total_vendors, icon: Store, color: "#22c55e" },
    { label: "Domiciliarios", value: stats.total_couriers, icon: Bike, color: "#f97316" },
    { label: "Ingresos", value: money(stats.total_revenue), icon: DollarSign, color: "#16a34a" },
  ] : [];

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <h1>Resumen del sistema</h1>
        <p>Métricas globales de UrbanRush</p>
      </div>

      {loading ? (
        <div className="admin-loading">Cargando estadísticas…</div>
      ) : !stats ? (
        <div className="admin-empty">No se pudieron cargar las estadísticas.</div>
      ) : (
        <>
          <div className="admin-cards">
            {cards.map((c) => (
              <div className="admin-card" key={c.label}>
                <div className="admin-card-icon" style={{ background: c.color }}>
                  <c.icon size={22} />
                </div>
                <div>
                  <div className="admin-card-value">{c.value}</div>
                  <div className="admin-card-label">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-panel">
            <h2><Wallet size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} /> Liquidaciones pendientes</h2>
            <div className="admin-bar-row">
              <span className="admin-bar-label">Negocios</span>
              <span className="admin-bar-count" style={{ width: "auto" }}>
                {stats.liquidations.vendor_pending_count} · {money(stats.liquidations.vendor_pending_total)}
              </span>
            </div>
            <div className="admin-bar-row">
              <span className="admin-bar-label">Comisión</span>
              <span className="admin-bar-count" style={{ width: "auto" }}>
                {money(stats.liquidations.vendor_pending_commission)}
              </span>
            </div>
            <div className="admin-bar-row">
              <span className="admin-bar-label">Domiciliarios</span>
              <span className="admin-bar-count" style={{ width: "auto" }}>
                {stats.liquidations.courier_pending_count} · {money(stats.liquidations.courier_pending_total)}
              </span>
            </div>
            <div className="admin-bar-row">
              <span className="admin-bar-label"><strong>Total plataforma</strong></span>
              <span className="admin-bar-count" style={{ width: "auto" }}>
                <strong>{money(stats.liquidations.platform_total_pending)}</strong>
              </span>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Pedidos por estado</h2>
            <StatusBars data={stats.orders_by_status} />
          </div>

          <div className="admin-panel">
            <h2>Pagos por estado</h2>
            <StatusBars data={stats.payments_by_status} />
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminOverview;
