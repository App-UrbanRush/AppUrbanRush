import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import { AdminRepositoryImpl } from "../../../infrastructure/repositories/AdminRepositoryImpl";
import type { AuditLog } from "../../../domain/types/admin.types";
import "./AdminCommon.css";

const repo = new AdminRepositoryImpl();

const ACTION_LABEL: Record<string, string> = {
  CREATE_USER: "Creó usuario",
  UPDATE_USER: "Editó usuario",
  DELETE_USER: "Eliminó usuario",
  CHANGE_ROLE: "Cambió rol",
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    repo.getAuditLogs(150)
      .then(setLogs)
      .catch((e) => console.error("Error cargando auditoría:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <div className="admin-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Auditoría</h1>
          <p>Registro de acciones administrativas</p>
        </div>
        <button className="admin-btn ghost" onClick={load}><RefreshCw size={15} /> Actualizar</button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando…</div>
        ) : logs.length === 0 ? (
          <div className="admin-empty">No hay registros de auditoría.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Fecha</th><th>Acción</th><th>Entidad</th><th>Realizado por</th><th>Detalles</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.created_at ? new Date(log.created_at).toLocaleString("es-CO") : "—"}</td>
                  <td><span className="admin-chip role-1">{ACTION_LABEL[log.action] ?? log.action}</span></td>
                  <td>{log.entity} #{log.entity_id}</td>
                  <td>{log.performed_by_email}</td>
                  <td style={{ fontSize: "0.8rem", color: "#6b7280", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
