import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { useAuth } from "../../context/useAuth";
import { courierVendorRequestsApi, type CourierVendorRequest } from "../../../infrastructure/api/courierVendorRequestsApi";
import { vendorsApi, type VendorListItem } from "../../../infrastructure/api/vendorsApi";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/AuthRepositoryImpl";
import { UpdateMyProfileUseCase } from "../../../application/use-cases/UpdateMyProfileUseCase";
import { UploadAvatarUseCase } from "../../../application/use-cases/UploadAvatarUseCase";
import { User, Mail, Phone, MapPin, Car, CreditCard, Shield, FileText, Clock, CheckCircle, XCircle, Send, Bike, Camera, Pencil, X } from "lucide-react";
import "./CourierProfile.css";

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

const CourierProfile = () => {
  const { myProfile, courierProfile, fetchMyProfile, fetchCourierProfile, user } = useAuth();
  const [myRequests, setMyRequests] = useState<CourierVendorRequest[]>([]);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    firstLastName: "",
    cellphone: "",
    address: "",
    gender: "",
  });

  useEffect(() => {
    fetchMyProfile();
    fetchCourierProfile();
    loadRequests();
    loadVendors();
  }, [fetchMyProfile, fetchCourierProfile]);

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
      toast.error(error.response?.data?.message || "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar.execute(file);
      await fetchMyProfile();
      toast.success("Foto de perfil actualizada");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo subir la foto");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const loadRequests = async () => {
    try {
      const data = await courierVendorRequestsApi.getMyRequests();
      setMyRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await vendorsApi.getAll();
      setVendors(data);
    } catch (error) {
      console.error("Error loading vendors:", error);
    }
  };

  const getVendorName = (vendorId: number): string => {
    const vendor = vendors.find((v) => v.vendor_id === vendorId);
    return vendor?.business_name || "Negocio desconocido";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "accepted":
        return <CheckCircle size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "accepted":
        return "Aceptada";
      case "rejected":
        return "Rechazada";
      default:
        return status;
    }
  };

  return (
    <CourierLayout>
      <div className="courier-profile">
        {/* Banner de perfil */}
        <div className="courier-profile-banner">
          <div className="courier-profile-avatar-wrap">
            <div className="courier-profile-avatar">
              {myProfile?.avatarUrl ? (
                <img src={myProfile.avatarUrl} alt="Foto de perfil" />
              ) : (
                (myProfile?.firstName?.[0] || "D").toUpperCase()
              )}
            </div>
            <button
              type="button"
              className="courier-profile-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Cambiar foto de perfil"
            >
              <Camera size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleAvatarChange}
            />
          </div>
          <div className="courier-profile-banner-info">
            <h1>{myProfile?.firstName || "Domiciliario"} {myProfile?.firstLastName || ""}</h1>
            <p className="courier-profile-subtitle">{user?.email || "Información personal y datos del vehículo"}</p>
            <span className="courier-profile-role-chip">
              <Bike size={13} /> Domiciliario
            </span>
          </div>
          <button type="button" className="courier-profile-edit-btn" onClick={openEdit}>
            <Pencil size={15} /> Editar perfil
          </button>
        </div>

        <div className="courier-profile-grid">
          {/* Datos Personales */}
          <div className="courier-profile-card">
            <div className="courier-profile-card-header">
              <User size={20} />
              <h2>Datos Personales</h2>
            </div>
            <div className="courier-profile-card-body">
              <div className="courier-profile-field">
                <span className="courier-profile-label">Nombre</span>
                <span className="courier-profile-value">{myProfile?.firstName || "-"} {myProfile?.firstLastName || ""}</span>
              </div>
              <div className="courier-profile-field">
                <span className="courier-profile-label">
                  <Mail size={14} /> Correo
                </span>
                <span className="courier-profile-value">{user?.email || "-"}</span>
              </div>
              <div className="courier-profile-field">
                <span className="courier-profile-label">
                  <Phone size={14} /> Celular
                </span>
                <span className="courier-profile-value">{myProfile?.cellphone || "-"}</span>
              </div>
              <div className="courier-profile-field">
                <span className="courier-profile-label">
                  <MapPin size={14} /> Dirección
                </span>
                <span className="courier-profile-value">{myProfile?.address || "-"}</span>
              </div>
              <div className="courier-profile-field">
                <span className="courier-profile-label">Género</span>
                <span className="courier-profile-value">{myProfile?.gender || "-"}</span>
              </div>
            </div>
          </div>

          {/* Datos del Vehículo */}
          <div className="courier-profile-card">
            <div className="courier-profile-card-header">
              <Car size={20} />
              <h2>Datos del Vehículo</h2>
            </div>
            <div className="courier-profile-card-body">
              <div className="courier-profile-field">
                <span className="courier-profile-label">Tipo de vehículo</span>
                <span className="courier-profile-value">{courierProfile?.vehicle_type || "-"}</span>
              </div>
              <div className="courier-profile-field">
                <span className="courier-profile-label">
                  <CreditCard size={14} /> Placa
                </span>
                <span className="courier-profile-value">{courierProfile?.vehicle_plate || "-"}</span>
              </div>
              <div className="courier-profile-field">
                <span className="courier-profile-label">
                  <Shield size={14} /> SOAT
                </span>
                <span className="courier-profile-value">{courierProfile?.soat_number || "-"}</span>
              </div>
              <div className="courier-profile-field">
                <span className="courier-profile-label">
                  <FileText size={14} /> Estado
                </span>
                <span className={`courier-profile-status ${courierProfile?.status?.toLowerCase() || "pending"}`}>
                  {courierProfile?.status || "PENDING"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mis Solicitudes */}
        <div className="courier-profile-requests">
          <div className="courier-profile-requests-header">
            <Send size={20} />
            <h2>Mis Solicitudes</h2>
          </div>
          {myRequests.length === 0 ? (
            <p className="courier-profile-requests-empty">No has enviado ninguna solicitud todavía</p>
          ) : (
            <div className="courier-profile-requests-list">
              {myRequests.map((request) => (
                <div key={request.id} className="courier-profile-request-item">
                  <div className="courier-profile-request-info">
                    <span className="courier-profile-request-vendor">{getVendorName(request.vendor_id)}</span>
                    <span className="courier-profile-request-date">
                      {new Date(request.created_at).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                  <span className={`courier-profile-request-status ${request.status}`}>
                    {getStatusIcon(request.status)}
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="profile-edit-overlay" onClick={() => !saving && setEditing(false)}>
          <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-edit-head">
              <h2>Editar perfil</h2>
              <button className="profile-edit-close" onClick={() => setEditing(false)} disabled={saving}>
                <X size={18} />
              </button>
            </div>

            <div className="profile-edit-body">
              <label className="profile-edit-field">
                <span>Nombre</span>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </label>
              <label className="profile-edit-field">
                <span>Apellido</span>
                <input
                  value={form.firstLastName}
                  onChange={(e) => setForm({ ...form, firstLastName: e.target.value })}
                />
              </label>
              <label className="profile-edit-field">
                <span>Celular</span>
                <input
                  value={form.cellphone}
                  onChange={(e) => setForm({ ...form, cellphone: e.target.value })}
                />
              </label>
              <label className="profile-edit-field">
                <span>Dirección</span>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </label>
              <label className="profile-edit-field">
                <span>Género</span>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Seleccionar…</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
            </div>

            <div className="profile-edit-actions">
              <button className="profile-edit-cancel" onClick={() => setEditing(false)} disabled={saving}>
                Cancelar
              </button>
              <button className="profile-edit-save" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CourierLayout>
  );
};

export default CourierProfile;
