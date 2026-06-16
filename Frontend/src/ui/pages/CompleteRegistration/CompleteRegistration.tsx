import { useEffect, useState, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin, User, Lock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import { peopleApi } from "../../../infrastructure/api/peopleApi";
import { authApi } from "../../../infrastructure/api/authApi";
import Loading from "../../components/Loading/Loading";
import "../Login/Login.css";
import "./CompleteRegistration.css";

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const { user, myProfile, fetchMyProfile, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cellphoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && myProfile) {
      const needsCompletion =
        !myProfile.cellphone ||
        !myProfile.address ||
        !myProfile.gender;
      if (!needsCompletion) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setLoading(false);
    }
  }, [myProfile, isLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!myProfile?.id || !user?.id) {
      toast.error("Error al cargar tu perfil");
      return;
    }

    const cellphone = cellphoneRef.current?.value.trim() ?? "";
    const address = addressRef.current?.value.trim() ?? "";
    const gender = genderRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value ?? "";

    if (!cellphone || !address || !gender) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!password) {
      toast.error("La contraseña es obligatoria");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);
    try {
      await peopleApi.updateMyProfile(myProfile.id, {
        cellphone,
        address,
        gender,
      });

      await authApi.post("/auth/set-password", { new_password: password });

      await fetchMyProfile();
      toast.success("Registro completado con éxito");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || isLoading) {
    return <Loading text="Cargando..." />;
  }

  if (!myProfile) {
    return (
      <div className="login-container">
        <div className="login-right" style={{ width: "100%" }}>
          <div className="login-card">
            <AlertTriangle size={48} style={{ color: "#e8500a", marginBottom: 16 }} />
            <h2>Error</h2>
            <p>No se pudo cargar tu perfil. Intenta de nuevo.</p>
            <button className="login-btn-primary" onClick={() => navigate("/dashboard")}>
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-right" style={{ width: "100%" }}>
        <div className="complete-card">
          <div className="complete-header">
            <User size={32} style={{ color: "#ff6a00" }} />
            <h2>Completa tu registro</h2>
            <p>Gracias por registrarte con Google. Solo faltan algunos datos.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label className="complete-label">Celular *</label>
              <div className="login-input-wrapper">
                <Phone size={16} className="login-input-icon" />
                <input
                  ref={cellphoneRef}
                  type="tel"
                  placeholder="Tu número de celular"
                  defaultValue={myProfile.cellphone || ""}
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="complete-label">Dirección *</label>
              <div className="login-input-wrapper">
                <MapPin size={16} className="login-input-icon" />
                <input
                  ref={addressRef}
                  type="text"
                  placeholder="Tu dirección"
                  defaultValue={myProfile.address || ""}
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="complete-label">Género *</label>
              <div className="login-input-wrapper">
                <User size={16} className="login-input-icon" />
                <select
                  ref={genderRef as any}
                  className="complete-select"
                  defaultValue={myProfile.gender || ""}
                  required
                >
                  <option value="" disabled>Selecciona tu género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="login-input-group">
              <label className="complete-label">Contraseña *</label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" />
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="Crea una contraseña para iniciar sesión"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn-primary"
              disabled={saving}
              style={{ marginTop: 8 }}
            >
              {saving ? "Guardando..." : "Completar registro"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistration;
