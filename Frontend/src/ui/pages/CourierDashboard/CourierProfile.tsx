import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { useAuth } from "../../context/useAuth";
import { courierVendorRequestsApi, type CourierVendorRequest } from "../../../infrastructure/api/courierVendorRequestsApi";
import { vendorsApi, type VendorListItem } from "../../../infrastructure/api/vendorsApi";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/AuthRepositoryImpl";
import { UpdateMyProfileUseCase } from "../../../application/use-cases/UpdateMyProfileUseCase";
import { courierProfileApi } from "../../../infrastructure/api/courierProfileApi";
import { storageApi } from "../../../infrastructure/api/storageApi";
import { User, Mail, Phone, MapPin, Car, CreditCard, Shield, FileText, Clock, CheckCircle, XCircle, Send, Camera, Loader2, Power, Pencil, X } from "lucide-react";
import "./CourierProfile.css";

const authRepo = new AuthRepositoryImpl();
const updateMyProfile = new UpdateMyProfileUseCase(authRepo);

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
  const [uploading, setUploading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      alert("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }

    setUploading(true);
    try {
      const result = await storageApi.uploadCourierPhoto(file);
      if (user?.id) {
        await courierProfileApi.updateProfile(Number(user.id), { photo_url: result.photo_url });
        await fetchCourierProfile();
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Error al subir la foto. Intenta de nuevo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleStatus = async () => {
    if (!user?.id) return;

    const currentStatus = courierProfile?.status || "PENDING";
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUpdatingStatus(true);
    try {
      await courierProfileApi.updateProfile(Number(user.id), { status: newStatus });
      await fetchCourierProfile();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isOnline = courierProfile?.status === "ACTIVE";

  const displayName = `${myProfile?.firstName || "Domiciliario"} ${myProfile?.firstLastName || ""}`.trim();

  return (
    <CourierLayout>
      <div className="courier-profile">

        {/* Photo + Welcome + Status Section */}
        <div className="courier-profile-top-section">
          <div className="courier-profile-photo-card">
            <div className="courier-profile-welcome-row">
              <div className="courier-profile-photo-wrapper" onClick={handlePhotoClick}>
                {courierProfile?.photo_url ? (
                  <img src={courierProfile.photo_url} alt="Foto de perfil" className="courier-profile-photo" />
                ) : (
                  <div className="courier-profile-photo-placeholder">
                    <User size={40} />
                  </div>
                )}
                <div className="courier-photo-overlay">
                  {uploading ? (
                    <Loader2 size={20} className="courier-photo-spinner" />
                  ) : (
                    <Camera size={20} />
                  )}
                </div>
              </div>
              <div className="courier-profile-welcome-text">
                <span className="courier-profile-welcome-label">Bienvenido</span>
                <span className="courier-profile-welcome-name">{displayName}</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <p className="courier-photo-hint">Toca para cambiar foto</p>
            <button type="button" className="courier-profile-edit-btn" onClick={openEdit} style={{ marginTop: '10px' }}>
              <Pencil size={15} /> Editar perfil
            </button>
          </div>

          <div className="courier-profile-status-card">
            <div className={`courier-profile-status-toggle ${isOnline ? "online" : "offline"}`}>
              <div className="courier-status-indicator">
                <Power size={20} />
                <div className="courier-status-info">
                  <span className="courier-status-label">Estado</span>
                  <span className="courier-status-value">{isOnline ? "En línea" : "Desconectado"}</span>
                </div>
              </div>
              <button
                className={`courier-toggle-btn ${isOnline ? "active" : "inactive"}`}
                onClick={handleToggleStatus}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <Loader2 size={18} className="courier-photo-spinner" />
                ) : (
                  <div className={`courier-toggle-knob ${isOnline ? "active" : ""}`} />
                )}
              </button>
            </div>
            <p className="courier-status-hint">
              {isOnline ? "Estás recibiendo pedidos" : "Actívate para recibir pedidos"}
            </p>
          </div>
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

          {/* Mis Solicitudes */}
          <div className="courier-profile-card">
            <div className="courier-profile-card-header">
              <Send size={20} />
              <h2>Mis Solicitudes</h2>
            </div>
            <div className="courier-profile-card-body">
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
