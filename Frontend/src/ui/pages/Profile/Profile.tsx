import { type FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { updateMyProfileApi } from "../../../infrastructure/api/authApi";
import "./Profile.css";

const Profile = () => {
  const { myProfile, user, fetchMyProfile } = useAuth();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const firstLastNameRef = useRef<HTMLInputElement>(null);
  const cellphoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!myProfile?.id) {
      setError("No se encontró el ID de perfil para actualizar.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateMyProfileApi(myProfile.id, {
        firstName: firstNameRef.current?.value.trim() ?? "",
        firstLastName: firstLastNameRef.current?.value.trim() ?? "",
        cellphone: cellphoneRef.current?.value.trim() ?? "",
        address: addressRef.current?.value.trim() ?? "",
        gender: genderRef.current?.value.trim() ?? "",
      });
      await fetchMyProfile();
      setMessage("Perfil actualizado con éxito.");
    } catch {
      setError("Error al actualizar el perfil. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-content">
          <p className="profile-subtitle">Perfil de usuario</p>
          <h1 className="profile-title">
            Bienvenido{myProfile?.firstName ? `, ${myProfile.firstName}` : ""}
          </h1>
          <p className="profile-description">
            Aquí puedes ver y actualizar tus datos personales. Mantén tu
            información al día para recibir los pedidos y notificaciones.
          </p>
        </div>
      </section>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-card-grid">
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Información personal</h2>
            </div>
            <div className="profile-card-body">
              <label className="profile-field">
                <span className="profile-field-label">Nombre</span>
                <input
                  ref={firstNameRef}
                  className="profile-input"
                  type="text"
                  placeholder="Tu nombre"
                  required
                />
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Apellido</span>
                <input
                  ref={firstLastNameRef}
                  className="profile-input"
                  type="text"
                  placeholder="Tu apellido"
                  required
                />
              </label>
              <div className="profile-field">
                <span className="profile-field-label">Correo</span>
                <span className="profile-field-value">
                  {myProfile?.email || user?.email || "-"}
                </span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Rol</span>
                <span className="profile-field-value">Cliente</span>
              </div>
              <label className="profile-field">
                <span className="profile-field-label">Género</span>
                <input
                  ref={genderRef}
                  className="profile-input"
                  type="text"
                  placeholder="Tu género"
                />
              </label>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Contacto</h2>
            </div>
            <div className="profile-card-body">
              <label className="profile-field">
                <span className="profile-field-label">Celular</span>
                <input
                  ref={cellphoneRef}
                  className="profile-input"
                  type="tel"
                  placeholder="Tu celular"
                />
              </label>
              <label className="profile-field">
                <span className="profile-field-label">Dirección</span>
                <input
                  ref={addressRef}
                  className="profile-input"
                  type="text"
                  placeholder="Tu dirección"
                />
              </label>
              <div className="profile-field">
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {message && <p className="profile-success">{message}</p>}
          {error && <p className="profile-error">{error}</p>}
          <button className="profile-button" type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
