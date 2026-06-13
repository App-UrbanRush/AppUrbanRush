import { useCallback, useEffect, useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import { AdminRepositoryImpl } from "../../../infrastructure/repositories/AdminRepositoryImpl";
import type { AdminUserView } from "../../../domain/types/admin.types";
import "./AdminCommon.css";

const repo = new AdminRepositoryImpl();

const AdminAdmins = () => {
  const [admins, setAdmins] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<AdminUserView | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAdmins(await repo.getAdmins());
    } catch (error) {
      console.error("Error cargando admins:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await repo.deleteAdmin(toDelete.user_id);
      toast.success("Administrador eliminado");
      setToDelete(null);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Administradores</h1>
          <p>Cuentas con rol de administración</p>
        </div>
        <button className="admin-btn ghost" onClick={load}><RefreshCw size={15} /> Actualizar</button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando…</div>
        ) : admins.length === 0 ? (
          <div className="admin-empty">No hay administradores.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.user_id}>
                  <td>{a.user_id}</td>
                  <td>{a.person ? `${a.person.firstName} ${a.person.firstLastName}` : "—"}</td>
                  <td>{a.user_email}</td>
                  <td><span className={`admin-chip ${a.status ? "on" : "off"}`}>{a.status ? "Activo" : "Inactivo"}</span></td>
                  <td>
                    <button className="admin-icon-btn danger" title="Eliminar" onClick={() => setToDelete(a)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toDelete && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setToDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head"><h2>Eliminar administrador</h2></div>
            <div className="admin-modal-body">
              <p style={{ margin: 0 }}>¿Eliminar a <strong>{toDelete.user_email}</strong>?</p>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn ghost" onClick={() => setToDelete(null)} disabled={deleting}>Cancelar</button>
              <button className="admin-btn danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAdmins;
