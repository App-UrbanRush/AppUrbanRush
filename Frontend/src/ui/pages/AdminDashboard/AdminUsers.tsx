import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Shield, Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import AdminUserModal, { type UserModalMode } from "./AdminUserModal";
import { useAuth } from "../../context/useAuth";
import { AdminRepositoryImpl } from "../../../infrastructure/repositories/AdminRepositoryImpl";
import type { AdminUserView } from "../../../domain/types/admin.types";
import "./AdminCommon.css";

const repo = new AdminRepositoryImpl();

const ROLE_LABEL: Record<number, string> = {
  1: "Admin", 2: "Usuario", 3: "Domiciliario", 4: "Negocio", 5: "SuperAdmin",
};

const AdminUsers = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SuperAdmin";

  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [modal, setModal] = useState<{ mode: UserModalMode; user?: AdminUserView | null } | null>(null);
  const [toDelete, setToDelete] = useState<AdminUserView | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = isSuperAdmin
        ? await repo.getUsers({
            search: search || undefined,
            role: roleFilter ? Number(roleFilter) : undefined,
          })
        : await repo.getCommonUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  // Filtro cliente para ADMIN (su endpoint no acepta filtros)
  const visible = isSuperAdmin
    ? users
    : users.filter((u) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          u.user_email.toLowerCase().includes(q) ||
          `${u.person?.firstName ?? ""} ${u.person?.firstLastName ?? ""}`.toLowerCase().includes(q)
        );
      });

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      if (isSuperAdmin) await repo.deleteUser(toDelete.user_id);
      else await repo.deleteCommonUser(toDelete.user_id);
      toast.success("Usuario eliminado");
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
          <h1>Usuarios</h1>
          <p>{isSuperAdmin ? "Gestión completa de usuarios" : "Usuarios comunes del sistema"}</p>
        </div>
        {isSuperAdmin && (
          <button className="admin-btn primary" onClick={() => setModal({ mode: "create" })}>
            <Plus size={16} /> Crear usuario
          </button>
        )}
      </div>

      <div className="admin-filters">
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 11, color: "#9aa0ab" }} />
          <input
            style={{ paddingLeft: 30 }}
            placeholder="Buscar por email o nombre"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isSuperAdmin && (
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Todos los roles</option>
            {Object.entries(ROLE_LABEL).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        )}
        <button className="admin-btn ghost" onClick={load}><RefreshCw size={15} /> Actualizar</button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando usuarios…</div>
        ) : visible.length === 0 ? (
          <div className="admin-empty">No hay usuarios.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Email</th><th>Celular</th>
                <th>Roles</th><th>Verificación</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.person ? `${u.person.firstName} ${u.person.firstLastName}` : "—"}</td>
                  <td>{u.user_email}</td>
                  <td>{u.person?.cellphone || "—"}</td>
                  <td>
                    {u.roles.map((r) => (
                      <span key={r} className={`admin-chip role-${r}`} style={{ marginRight: 4 }}>
                        {ROLE_LABEL[r] ?? r}
                      </span>
                    ))}
                  </td>
                  <td>{u.verification_status}</td>
                  <td><span className={`admin-chip ${u.status ? "on" : "off"}`}>{u.status ? "Activo" : "Inactivo"}</span></td>
                  <td>
                    <div className="admin-row-actions">
                      {isSuperAdmin && (
                        <button className="admin-icon-btn" title="Cambiar rol" onClick={() => setModal({ mode: "role", user: u })}>
                          <Shield size={15} />
                        </button>
                      )}
                      <button className="admin-icon-btn" title="Editar" onClick={() => setModal({ mode: "edit", user: u })}>
                        <Pencil size={15} />
                      </button>
                      <button className="admin-icon-btn danger" title="Eliminar" onClick={() => setToDelete(u)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <AdminUserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {toDelete && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setToDelete(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head"><h2>Eliminar usuario</h2></div>
            <div className="admin-modal-body">
              <p style={{ margin: 0 }}>
                ¿Seguro que quieres eliminar a <strong>{toDelete.user_email}</strong>? Esta acción no se puede deshacer.
              </p>
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

export default AdminUsers;
