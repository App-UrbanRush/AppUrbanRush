import { type FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { peopleApi } from "../../../infrastructure/api/peopleApi";
import { Camera, Trash2, User, Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import Loading from "../../components/Loading/Loading";
import "./Profile.css";

const Profile = () => {
  const { myProfile, user, fetchMyProfile } = useAuth();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const firstLastNameRef = useRef<HTMLInputElement>(null);
  const cellphoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetchMyProfile();
  }, [fetchMyProfile]);

  useEffect(() => {
    if (myProfile) {
      if (firstNameRef.current) firstNameRef.current.value = myProfile.firstName ?? "";
      if (firstLastNameRef.current) firstLastNameRef.current.value = myProfile.firstLastName ?? "";
      if (cellphoneRef.current) cellphoneRef.current.value = myProfile.cellphone ?? "";
      if (addressRef.current) addressRef.current.value = myProfile.address ?? "";
      if (genderRef.current) genderRef.current.value = myProfile.gender ?? "";
    }
  }, [myProfile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await peopleApi.uploadAvatar(file);
      await fetchMyProfile();
      toast.success("Foto de perfil actualizada.");
    } catch {
      toast.error("Error al subir la foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!myProfile?.id) return;
    try {
      await peopleApi.updateMyProfile(myProfile.id, { avatarUrl: null });
      await fetchMyProfile();
      toast.success("Foto de perfil eliminada.");
    } catch {
      toast.error("Error al eliminar la foto.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!myProfile?.id) {
      toast.error("No se encontró el ID de perfil para actualizar.");
      return;
    }

    setIsSaving(true);

    try {
      await peopleApi.updateMyProfile(myProfile.id, {
        firstName: firstNameRef.current?.value.trim() ?? "",
        firstLastName: firstLastNameRef.current?.value.trim() ?? "",
        cellphone: cellphoneRef.current?.value.trim() ?? "",
        address: addressRef.current?.value.trim() ?? "",
        gender: genderRef.current?.value.trim() ?? "",
      });
      await fetchMyProfile();
      toast.success("Perfil actualizado con éxito.");
    } catch {
      toast.error("Error al actualizar el perfil. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!myProfile) {
    return <Loading text="Cargando perfil…" />;
  }

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-avatar-wrap">
          <div className="profile-hero-avatar">
            {myProfile?.avatarUrl ? (
              <img src={myProfile.avatarUrl} alt="Avatar" className="profile-hero-avatar-img" />
            ) : (
              <span className="profile-hero-avatar-letter">
                {(myProfile?.firstName?.[0] || user?.name?.[0] || "U").toUpperCase()}
              </span>
            )}
          </div>
          <button
            className="profile-hero-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Cambiar foto"
          >
            <Camera size={14} />
          </button>
          {myProfile?.avatarUrl && (
            <button
              className="profile-hero-avatar-btn profile-hero-avatar-btn--delete"
              onClick={handleDeleteAvatar}
              title="Eliminar foto"
            >
              <Trash2 size={14} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>
        <div className="profile-hero-content">
          <p className="profile-subtitle">Perfil de usuario</p>
          <h1 className="profile-title">
            Bienvenido{myProfile?.firstName ? `, ${myProfile.firstName}` : ""}
          </h1>
          <p className="profile-description">
            Aquí puedes ver y actualizar tus datos personales.
          </p>
        </div>
      </section>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-card-grid">
          <div className="profile-card">
            <div className="profile-card-header">
              <User size={16} />
              <h2>Datos personales</h2>
            </div>
            <div className="profile-card-body">
              <label className="profile-field">
                <span className="profile-field-label">Nombre</span>
                <div className="profile-input-wrap">
                  <User size={15} className="profile-input-icon" />
                  <input
                    ref={firstNameRef}
                    className="profile-input"
                    type="text"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Apellido</span>
                <div className="profile-input-wrap">
                  <User size={15} className="profile-input-icon" />
                  <input
                    ref={firstLastNameRef}
                    className="profile-input"
                    type="text"
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </label>
              <div className="profile-field">
                <span className="profile-field-label">Correo</span>
                <div className="profile-input-wrap">
                  <Mail size={15} className="profile-input-icon" />
                  <span className="profile-input profile-input--readonly">
                    {myProfile?.email || user?.email || "-"}
                  </span>
                </div>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Rol</span>
                <div className="profile-input-wrap">
                  <span className="profile-input profile-input--readonly">Cliente</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <Phone size={16} />
              <h2>Contacto</h2>
            </div>
            <div className="profile-card-body">
              <label className="profile-field">
                <span className="profile-field-label">Celular</span>
                <div className="profile-input-wrap">
                  <Phone size={15} className="profile-input-icon" />
                  <input
                    ref={cellphoneRef}
                    className="profile-input"
                    type="tel"
                    placeholder="Tu celular"
                  />
                </div>
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Género</span>
                <div className="profile-input-wrap">
                  <User size={15} className="profile-input-icon" />
                  <input
                    ref={genderRef}
                    className="profile-input"
                    type="text"
                    placeholder="Tu género"
                  />
                </div>
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Dirección</span>
                <div className="profile-input-wrap">
                  <MapPin size={15} className="profile-input-icon" />
                  <input
                    ref={addressRef}
                    className="profile-input"
                    type="text"
                    placeholder="Tu dirección"
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="profile-button" type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
