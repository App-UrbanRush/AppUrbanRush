import "../DeliveryRegister/DeliveryRegister.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/AuthRepositoryImpl";
import { RegisterUseCase } from "../../../application/use-cases/RegisterUseCase";
import { api } from "../../../infrastructure/api/authApi";
import type { RegisterCredentials } from "../../../domain/types/auth.types";

interface DeliveryCredentials extends RegisterCredentials {
  vehicleType: string;
  licensePlate: string;
  experience: string;
  workSchedule: string;
  hasInsurance: boolean;
  availabilityZone: string;
  cedula: string;
  birthDate: string;
}

type Step = "form" | "verification" | "result";

interface VerificationResult {
  verified: boolean;
  confidence: number;
  mismatches: string[];
  message: string;
}

const DeliveryRegister = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<DeliveryCredentials>({
    user_email: "",
    user_password: "",
    firstName: "",
    firstLastName: "",
    cellphone: "",
    address: "",
    gender: "",
    vehicleType: "",
    licensePlate: "",
    experience: "",
    workSchedule: "",
    hasInsurance: false,
    availabilityZone: "",
    cedula: "",
    birthDate: "",
    rolIds: [2],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      alert("Máximo 2 imágenes (frente y reverso)");
      return;
    }
    setImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.user_email) newErrors.user_email = "Requerido";
    if (!form.user_password) newErrors.user_password = "Requerido";
    if (!form.firstName) newErrors.firstName = "Requerido";
    if (!form.firstLastName) newErrors.firstLastName = "Requerido";
    if (!form.cellphone) newErrors.cellphone = "Requerido";
    if (!form.address) newErrors.address = "Requerido";
    if (!form.vehicleType) newErrors.vehicleType = "Requerido";
    if (!form.licensePlate) newErrors.licensePlate = "Requerido";
    if (!form.cedula) newErrors.cedula = "Requerido";
    if (!form.birthDate) newErrors.birthDate = "Requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStep("verification");
  };

  const handleVerification = async () => {
    if (images.length === 0) {
      alert("Sube al menos una foto de tu cédula");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      images.forEach((img) => formData.append("images", img));
      formData.append("cedula", form.cedula);
      formData.append("firstName", form.firstName);
      formData.append("firstLastName", form.firstLastName);
      formData.append("birthDate", form.birthDate);

      const verifyRes = await api.post(
        "/verification/verify-document",
        formData,
      );
      const result: VerificationResult = verifyRes.data;

      if (!result.verified) {
        setVerificationResult(result);
        setStep("result");
        return;
      }

      const authRepository = new AuthRepositoryImpl();
      const registerUseCase = new RegisterUseCase(authRepository);
      await registerUseCase.execute({
        user_email: form.user_email,
        user_password: form.user_password,
        firstName: form.firstName,
        firstLastName: form.firstLastName,
        cellphone: form.cellphone,
        address: form.address,
        gender: form.gender,
        rolIds: [2],
      });

      const token = localStorage.getItem("token");
      await api.post(
        "/verification/confirm-verification",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setVerificationResult(result);
      setStep("result");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error en verificación");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-register-container">
      <div className="delivery-register-left">
        {/* LOGO PARA MÓVIL */}
        <img src="/Logo-png.png" alt="UrbanRush Logo" className="mobile-logo-form" />

        <motion.div
          className="delivery-register-card"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {step === "form" && (
            <>
              <div className="delivery-register-header">
                <h2>Registro de Domiciliario</h2>
                <p>Paso 1 de 2 — Información personal</p>
              </div>

              <form onSubmit={handleSubmit} className="delivery-register-form">
                <div className="form-section">
                  <h3>Información Personal</h3>
                  <input
                    name="user_email"
                    type="email"
                    placeholder="Correo electrónico"
                    onChange={handleChange}
                    required
                  />
                  {errors.user_email && (
                    <span className="error-message">{errors.user_email}</span>
                  )}
                  <input
                    name="user_password"
                    type="password"
                    placeholder="Contraseña"
                    onChange={handleChange}
                    required
                  />
                  <div className="delivery-register-row">
                    <input
                      name="firstName"
                      placeholder="Nombre"
                      onChange={handleChange}
                    />
                    <input
                      name="firstLastName"
                      placeholder="Apellido"
                      onChange={handleChange}
                    />
                  </div>
                  <input
                    name="cellphone"
                    placeholder="Celular"
                    onChange={handleChange}
                  />
                  <input
                    name="address"
                    placeholder="Dirección"
                    onChange={handleChange}
                  />
                  <select
                    name="gender"
                    onChange={handleChange}
                    value={form.gender}
                  >
                    <option value="">Seleccionar género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>

                  <input
                    name="cedula"
                    placeholder="Número de cédula"
                    onChange={handleChange}
                  />
                  {errors.cedula && (
                    <span className="error-message">{errors.cedula}</span>
                  )}
                  <label style={{ fontSize: "0.85rem", color: "#666" }}>
                    Fecha de nacimiento
                  </label>
                  <input name="birthDate" type="date" onChange={handleChange} />
                  {errors.birthDate && (
                    <span className="error-message">{errors.birthDate}</span>
                  )}
                </div>

                <div className="form-section">
                  <h3>Vehículo</h3>
                  <select
                    name="vehicleType"
                    onChange={handleChange}
                    value={form.vehicleType}
                  >
                    <option value="">Tipo de vehículo</option>
                    <option value="moto">Moto</option>
                    <option value="bicicleta">Bicicleta</option>
                    <option value="carro">Carro</option>
                  </select>
                  <input
                    name="licensePlate"
                    placeholder="Placa"
                    onChange={handleChange}
                  />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasInsurance"
                      checked={form.hasInsurance}
                      onChange={handleChange}
                    />
                    <span>Tengo seguro del vehículo</span>
                  </label>
                </div>

                <div className="form-section">
                  <h3>Horario</h3>
                  <select
                    name="workSchedule"
                    onChange={handleChange}
                    value={form.workSchedule}
                  >
                    <option value="">Horario preferido</option>
                    <option value="tiempo-completo">Tiempo completo</option>
                    <option value="medio-tiempo">Medio tiempo</option>
                    <option value="fines-semana">Fines de semana</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="delivery-register-btn"
                >
                  {loading ? "Registrando..." : "Continuar a verificación →"}
                </button>
              </form>
            </>
          )}

          {step === "verification" && (
            <>
              <div className="delivery-register-header">
                <h2>Verificación de Identidad</h2>
                <p>Paso 2 de 2 — Sube las fotos de tu cédula</p>
              </div>

              <div className="verification-section">
                <div className="verification-info">
                  <p>
                    📋 <strong>¿Por qué necesitamos esto?</strong>
                  </p>
                  <p>
                    Verificamos que los datos de tu cédula coincidan con la
                    información que registraste para garantizar la seguridad de
                    nuestra plataforma.
                  </p>
                </div>

                <div className="verification-tips">
                  <p>✅ Buena iluminación</p>
                  <p>✅ Cédula completa visible</p>
                  <p>✅ Sin reflejos ni sombras</p>
                  <p>✅ Puedes subir frente y reverso</p>
                </div>

                <label className="upload-area">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  {imagePreviews.length === 0 ? (
                    <div className="upload-placeholder">
                      <span style={{ fontSize: "2rem" }}>📷</span>
                      <p>Toca aquí para subir fotos de tu cédula</p>
                      <small>JPG, PNG o WEBP — máx. 5MB por imagen</small>
                    </div>
                  ) : (
                    <div className="image-previews">
                      {imagePreviews.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`CC ${i + 1}`}
                          className="cc-preview"
                        />
                      ))}
                    </div>
                  )}
                </label>

                <button
                  onClick={handleVerification}
                  disabled={loading || images.length === 0}
                  className="delivery-register-btn"
                >
                  {loading ? "Verificando con IA..." : "Verificar identidad"}
                </button>
              </div>
            </>
          )}

          {step === "result" && verificationResult && (
            <div className="verification-result">
              <div style={{ fontSize: "3rem", textAlign: "center" }}>
                {verificationResult.verified ? "✅" : "❌"}
              </div>
              <h2 style={{ textAlign: "center" }}>
                {verificationResult.verified
                  ? "¡Identidad verificada!"
                  : "Verificación fallida"}
              </h2>
              <p style={{ textAlign: "center", color: "#666" }}>
                {verificationResult.message}
              </p>

              <div className="confidence-bar">
                <div className="confidence-label">
                  Confianza: {verificationResult.confidence}%
                </div>
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${verificationResult.confidence}%`,
                      background:
                        verificationResult.confidence >= 75
                          ? "#22c55e"
                          : "#ef4444",
                    }}
                  />
                </div>
              </div>

              {verificationResult.mismatches.length > 0 && (
                <div className="mismatches">
                  <p>
                    <strong>Problemas encontrados:</strong>
                  </p>
                  {verificationResult.mismatches.map((m, i) => (
                    <p key={i} style={{ color: "#ef4444" }}>
                      • {m}
                    </p>
                  ))}
                </div>
              )}

              {verificationResult.verified ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="delivery-register-btn"
                >
                  Ir al Panel De Control
                </button>
              ) : (
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={() => {
                      setImages([]);
                      setImagePreviews([]);
                      setStep("verification");
                    }}
                    className="delivery-register-btn"
                  >
                    Intentar de nuevo
                  </button>
                  <button
                    onClick={() => setStep("form")}
                    style={{
                      background: "transparent",
                      color: "#888",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                    }}
                  >
                    Volver al formulario
                  </button>
                </div>
              )}
            </div>
          )}

          <p
            className="login-link"
            style={{ textAlign: "center", marginTop: "1rem" }}
          >
            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
          </p>
        </motion.div>
      </div>

      <div className="delivery-register-right">
        <img src="/delivery.png" alt="delivery personnel" />
        <div className="delivery-register-overlay">
          <img
            src="/Logo-png.png"
            alt="UrbanRush Logo"
            className="delivery-register-logo-img"
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegister;