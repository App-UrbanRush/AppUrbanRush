import { useState } from "react";
import toast from "react-hot-toast";
import {
  FileText, FileSpreadsheet, Calendar, Filter,
  Package, CreditCard, Users, Bike, Loader2,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import { reportsApi, type ReportFilters } from "../../../infrastructure/api/reportsApi";
import "./AdminReports.css";

type Tab = "orders" | "payments" | "users" | "couriers";

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: "orders", label: "Pedidos", icon: Package },
  { key: "payments", label: "Pagos", icon: CreditCard },
  { key: "users", label: "Usuarios", icon: Users },
  { key: "couriers", label: "Domiciliarios", icon: Bike },
];

const ORDER_STATUSES = ["PENDING", "ACCEPTED", "PREPARING", "READY", "IN_DELIVERY", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["APPROVED", "PENDING", "DECLINED", "VOIDED", "ERROR"];

const AdminReports = () => {
  const [tab, setTab] = useState<Tab>("orders");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const filters: ReportFilters = { from, to, status };
  const usesFilters = tab === "orders" || tab === "payments";
  const statuses = tab === "orders" ? ORDER_STATUSES : PAYMENT_STATUSES;

  const run = async (key: string, fn: () => Promise<void>) => {
    setDownloading(key);
    try {
      await fn();
      toast.success("Reporte descargado");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo generar el reporte");
    } finally {
      setDownloading(null);
    }
  };

  const Btn = ({
    keyId, label, icon: Icon, onClick, variant,
  }: {
    keyId: string; label: string; icon: typeof FileText; onClick: () => Promise<void>; variant: "pdf" | "excel";
  }) => (
    <button
      className={`admin-report-btn ${variant}`}
      onClick={() => run(keyId, onClick)}
      disabled={downloading !== null}
    >
      {downloading === keyId ? <Loader2 size={18} className="spin" /> : <Icon size={18} />}
      {label}
    </button>
  );

  return (
    <AdminLayout>
    <div className="admin-reports">
      <header className="admin-reports-header">
        <div>
          <h1>Reportes</h1>
          <p>Panel de administración — descarga reportes del sistema</p>
        </div>
      </header>

      <div className="admin-reports-tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`admin-reports-tab ${tab === key ? "active" : ""}`}
            onClick={() => { setTab(key); setStatus(""); }}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </div>

      <div className="admin-reports-card">
        {usesFilters && (
          <div className="admin-reports-filters">
            <div className="admin-reports-field">
              <label><Calendar size={14} /> Desde</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="admin-reports-field">
              <label><Calendar size={14} /> Hasta</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="admin-reports-field">
              <label><Filter size={14} /> Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Todos</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="admin-reports-actions">
          {tab === "orders" && (
            <>
              <Btn keyId="orders-pdf" label="Descargar PDF" icon={FileText} variant="pdf" onClick={() => reportsApi.ordersPdf(filters)} />
              <Btn keyId="orders-excel" label="Descargar Excel" icon={FileSpreadsheet} variant="excel" onClick={() => reportsApi.ordersExcel(filters)} />
            </>
          )}
          {tab === "payments" && (
            <>
              <Btn keyId="payments-pdf" label="Descargar PDF" icon={FileText} variant="pdf" onClick={() => reportsApi.paymentsPdf(filters)} />
              <Btn keyId="payments-excel" label="Descargar Excel" icon={FileSpreadsheet} variant="excel" onClick={() => reportsApi.paymentsExcel(filters)} />
            </>
          )}
          {tab === "users" && (
            <Btn keyId="users-excel" label="Descargar Excel" icon={FileSpreadsheet} variant="excel" onClick={() => reportsApi.usersExcel()} />
          )}
          {tab === "couriers" && (
            <Btn keyId="couriers-excel" label="Descargar Excel" icon={FileSpreadsheet} variant="excel" onClick={() => reportsApi.couriersExcel()} />
          )}
        </div>

        <p className="admin-reports-hint">
          {usesFilters
            ? "Deja los filtros vacíos para incluir todos los registros."
            : "Este reporte incluye el listado completo."}
        </p>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminReports;
