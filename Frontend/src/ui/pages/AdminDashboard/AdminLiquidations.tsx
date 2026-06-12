import { useEffect, useState } from "react";
import { Store, Bike, Percent, Wallet, RefreshCw } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import { AdminRepositoryImpl } from "../../../infrastructure/repositories/AdminRepositoryImpl";
import type { LiquidationSummary } from "../../../domain/types/admin.types";
import "./AdminCommon.css";

const repo = new AdminRepositoryImpl();
const money = (n: number) => `$${(n ?? 0).toLocaleString("es-CO")}`;

const AdminLiquidations = () => {
  const [data, setData] = useState<LiquidationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    repo.getLiquidationSummary()
      .then(setData)
      .catch((e) => console.error("Error cargando liquidaciones:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cards = data ? [
    { label: "Negocios pendientes", value: data.vendors.pending_count, sub: money(data.vendors.pending_total), icon: Store, color: "#22c55e" },
    { label: "Comisión pendiente", value: money(data.vendors.pending_commission), sub: "Plataforma", icon: Percent, color: "#8b5cf6" },
    { label: "Domiciliarios pendientes", value: data.couriers.pending_count, sub: money(data.couriers.pending_total), icon: Bike, color: "#f97316" },
    { label: "Total a liquidar", value: money(data.platform_total_pending), sub: "Pendiente total", icon: Wallet, color: "#ff6a00" },
  ] : [];

  return (
    <AdminLayout>
      <div className="admin-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Liquidaciones</h1>
          <p>Resumen de pagos pendientes a negocios y domiciliarios</p>
        </div>
        <button className="admin-btn ghost" onClick={load}><RefreshCw size={15} /> Actualizar</button>
      </div>

      {loading ? (
        <div className="admin-loading">Cargando…</div>
      ) : !data ? (
        <div className="admin-empty">No se pudo cargar el resumen.</div>
      ) : (
        <div className="admin-cards">
          {cards.map((c) => (
            <div className="admin-card" key={c.label}>
              <div className="admin-card-icon" style={{ background: c.color }}><c.icon size={22} /></div>
              <div>
                <div className="admin-card-value">{c.value}</div>
                <div className="admin-card-label">{c.label}</div>
                <div className="admin-card-label" style={{ fontWeight: 600, color: "#6b7280" }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminLiquidations;
