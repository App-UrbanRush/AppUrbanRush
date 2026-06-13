import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import PasswordInput from "../../components/ui/PasswordInput";
import { AdminRepositoryImpl } from "../../../infrastructure/repositories/AdminRepositoryImpl";
import type { AdminUserView } from "../../../domain/types/admin.types";
import "./AdminCommon.css";

const repo = new AdminRepositoryImpl();

const ROLE_OPTIONS = [
  { id: 2, label: "Usuario" },
  { id: 3, label: "Domiciliario" },
  { id: 4, label: "Negocio" },
  { id: 1, label: "Administrador" },
  { id: 5, label: "SuperAdmin" },
];

export type UserModalMode = "create" | "edit" | "role";

interface Props {
  mode: UserModalMode;
  user?: AdminUserView | null;
  onClose: () => void;
  onSaved: () => void;
}

const AdminUserModal = ({ mode, user, onClose, onSaved }: Props) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    user_email: user?.user_email ?? "",
    user_password: "",
    firstName: user?.person?.firstName ?? "",
    firstLastName: user?.person?.firstLastName ?? "",
    cellphone: user?.person?.cellphone ?? "",
    address: "",
    gender: "M",
    rol_id: user?.roles?.[0] ?? 2,
    status: user?.status ?? true,
  });

  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const title = mode === "create" ? "Crear usuario" : mode === "edit" ? "Editar usuario" : "Cambiar rol";

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === "create") {
        await repo.createUser({
          user_email: form.user_email,
          user_password: form.user_password,
          firstName: form.firstName,
          firstLastName: form.firstLastName,
          cellphone: form.cellphone,
          address: form.address,
          gender: form.gender,
          rol_id: Number(form.rol_id),
        });
        toast.success("Usuario creado");
      } else if (mode === "edit" && user) {
        await repo.editCommonUser(user.user_id, { user_email: form.user_email, status: form.status });
        toast.success("Usuario actualizado");
      } else if (mode === "role" && user) {
        await repo.changeRole(user.user_id, Number(form.rol_id));
        toast.success("Rol actualizado");
      }
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h2>{title}</h2>
          <button className="admin-modal-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        <div className="admin-modal-body">
          {mode === "create" && (
            <>
              <label className="admin-field"><span>Nombre</span>
                <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </label>
              <label className="admin-field"><span>Apellido</span>
                <input value={form.firstLastName} onChange={(e) => set("firstLastName", e.target.value)} />
              </label>
              <label className="admin-field"><span>Celular</span>
                <input value={form.cellphone} onChange={(e) => set("cellphone", e.target.value)} />
              </label>
              <label className="admin-field"><span>Dirección</span>
                <input value={form.address} onChange={(e) => set("address", e.target.value)} />
              </label>
              <label className="admin-field"><span>Género</span>
                <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </label>
              <label className="admin-field"><span>Contraseña</span>
                <PasswordInput value={form.user_password} onChange={(e) => set("user_password", e.target.value)} />
              </label>
            </>
          )}

          {(mode === "create" || mode === "edit") && (
            <label className="admin-field"><span>Email</span>
              <input type="email" value={form.user_email} onChange={(e) => set("user_email", e.target.value)} />
            </label>
          )}

          {(mode === "create" || mode === "role") && (
            <label className="admin-field"><span>Rol</span>
              <select value={form.rol_id} onChange={(e) => set("rol_id", Number(e.target.value))}>
                {ROLE_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </label>
          )}

          {mode === "edit" && (
            <label className="admin-field"><span>Estado</span>
              <select value={form.status ? "1" : "0"} onChange={(e) => set("status", e.target.value === "1")}>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </label>
          )}
        </div>

        <div className="admin-modal-actions">
          <button className="admin-btn ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="admin-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserModal;
