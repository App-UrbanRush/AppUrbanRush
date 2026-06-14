import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, Camera, Pencil, X, UserCircle } from "lucide-react";
import Layout from "../../components/layout/Layout/Layout";
import { useAuth } from "../../context/useAuth";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/AuthRepositoryImpl";
import { UpdateMyProfileUseCase } from "../../../application/use-cases/UpdateMyProfileUseCase";
import { UploadAvatarUseCase } from "../../../application/use-cases/UploadAvatarUseCase";
import "./UserProfile.css";

const authRepo = new AuthRepositoryImpl();
const updateMyProfile = new UpdateMyProfileUseCase(authRepo);
const uploadAvatar = new UploadAvatarUseCase(authRepo);

interface ProfileForm {
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
}

const UserProfile = () => {
  const { myProfile, fetchMyProfile, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [myProfile?.avatarUrl]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "", firstLastName: "", cellphone: "", address: "", gender: "",
  });

  useEffect(() => { fetchMyProfile(); }, [fetchMyProfile]);

  const openEdit = () => {
    setForm({
      firstName: myProfile?.firstName ?? "",
      firstLastName: myProfile?.firstLastName ?? "",
      cellphone: myProfile?.cellphone ?? "",
      address: myProfile?.address ?? "",
      gender: myProfile?.gender ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateMyProfile.execute(Number(user.id), form);
      await fetchMyProfile();
      toast.success("Perfil actualizado");
      setEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAvatar.execute(file);
      await fetchMyProfile();
      toast.success("Foto de perfil actualizada");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo subir la foto");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Layout>
      <div className="user-profile">
        <div className="user-profile-banner">
          <div className="user-profile-avatar-wrap">
            <div className="user-profile-avatar">
              {myProfile?.avatarUrl && !imgError
                ? <img src={myProfile.avatarUrl} alt="Foto de perfil" onError={() => setImgError(true)} />
                : <User size={40} strokeWidth={2.2} />}
            </div>
            <button
              type="button"
              className="user-profile-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Cambiar foto"
            >
              <Camera size={15} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleAvatarChange} />
          </div>
          <div className="user-profile-banner-info">
            <h1>{myProfile?.firstName || "Usuario"} {myProfile?.firstLastName || ""}</h1>
            <p>{user?.email || "Mi cuenta"}</p>
            <span className="user-profile-chip"><UserCircle size={13} /> Cliente</span>
          </div>
          <button type="button" className="user-profile-edit-btn" onClick={openEdit}>
            <Pencil size={15} /> Editar perfil
          </button>
        </div>

        <div className="user-profile-card">
          <div className="user-profile-card-head">
            <User size={20} /> <h2>Datos Personales</h2>
          </div>
          <div className="user-profile-fields">
            <div className="user-profile-field">
              <span className="user-profile-label">Nombre</span>
              <span className="user-profile-value">{myProfile?.firstName || "-"} {myProfile?.firstLastName || ""}</span>
            </div>
            <div className="user-profile-field">
              <span className="user-profile-label"><Mail size={14} /> Correo</span>
              <span className="user-profile-value">{user?.email || "-"}</span>
            </div>
            <div className="user-profile-field">
              <span className="user-profile-label"><Phone size={14} /> Celular</span>
              <span className="user-profile-value">{myProfile?.cellphone || "-"}</span>
            </div>
            <div className="user-profile-field">
              <span className="user-profile-label"><MapPin size={14} /> Dirección</span>
              <span className="user-profile-value">{myProfile?.address || "-"}</span>
            </div>
            <div className="user-profile-field">
              <span className="user-profile-label">Género</span>
              <span className="user-profile-value">{myProfile?.gender || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="profile-edit-overlay" onClick={() => !saving && setEditing(false)}>
          <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-edit-head">
              <h2>Editar perfil</h2>
              <button className="profile-edit-close" onClick={() => setEditing(false)} disabled={saving}><X size={18} /></button>
            </div>
            <div className="profile-edit-body">
              <label className="profile-edit-field"><span>Nombre</span>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </label>
              <label className="profile-edit-field"><span>Apellido</span>
                <input value={form.firstLastName} onChange={(e) => setForm({ ...form, firstLastName: e.target.value })} />
              </label>
              <label className="profile-edit-field"><span>Celular</span>
                <input value={form.cellphone} onChange={(e) => setForm({ ...form, cellphone: e.target.value })} />
              </label>
              <label className="profile-edit-field"><span>Dirección</span>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </label>
              <label className="profile-edit-field"><span>Género</span>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Seleccionar…</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
            </div>
            <div className="profile-edit-actions">
              <button className="profile-edit-cancel" onClick={() => setEditing(false)} disabled={saving}>Cancelar</button>
              <button className="profile-edit-save" onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserProfile;
