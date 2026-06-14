/**
 * UI LAYER - PÁGINA DELIVERY REGISTER
 * Usa correctamente la arquitectura hexagonal
 * - Usa useAuth() para el registro y verificación
 * - NO crea instancias de casos de uso
 * - NO importa detalles de infraestructura (axios, APIs, etc)
 */

import "./DeliveryRegister.css";
import PasswordInput from "../../components/ui/PasswordInput";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import type { RegisterDeliveryRequest } from "../../../domain/types/auth.types";

type Step = "form" | "verification" | "result";

const DeliveryRegister = () => {
  const navigate = useNavigate();
  const { registerDelivery, verifyDocument, isLoading, error: contextError } = useAuth();

  const [step, setStep] = useState<Step>("form");
  const [apiError, setApiError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [documentImages, setDocumentImages] = useState<File[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);

  const [form, setForm] = useState<RegisterDeliveryRequest & { city?: string }>({
    user_email: "",
    user_password: "",
    firstName: "",
    firstLastName: "",
    cellphone: "",
    address: "",
    gender: "",
    document_number: "",
    vehicle_type: "",
    vehicle_plate: "",
    soat_number: "",
    expedition_date: "",
    expedition_place: "",
    city: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setDocumentImages(files);
      setVerificationMessage("");
      setIsVerified(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.user_email) newErrors.user_email = "Requerido";
    if (!form.user_password) newErrors.user_password = "Requerido";
    if (!form.firstName) newErrors.firstName = "Requerido";
    if (!form.firstLastName) newErrors.firstLastName = "Requerido";
    if (!form.cellphone) newErrors.cellphone = "Requerido";
    if (!form.address) newErrors.address = "Requerido";
    if (!form.gender) newErrors.gender = "Requerido";
    if (!form.document_number) newErrors.document_number = "Requerido";
    if (!form.vehicle_type) newErrors.vehicle_type = "Requerido";
    if (!form.vehicle_plate) newErrors.vehicle_plate = "Requerido";
    if (!form.soat_number) newErrors.soat_number = "Requerido";
    if (!form.expedition_date) newErrors.expedition_date = "Requerido";
    if (!form.city) newErrors.city = "Requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep("verification");
      setApiError("");
    }
  };

  const handleVerifyAndRegister = async () => {
    if (documentImages.length === 0) {
      setApiError("Debes subir las fotos de tu cédula (frontal y reverso) para continuar");
      return;
    }

    if (documentImages.length < 2) {
      setApiError("Debes subir las dos caras de tu cédula (frontal y reverso)");
      return;
    }

    try {
      setApiError("");
      setVerificationMessage("");
      setIsVerifying(true);

      const verificationResult = await verifyDocument(documentImages, {
        cedula: form.document_number || "",
        firstName: form.firstName,
        firstLastName: form.firstLastName,
        expeditionDate: form.expedition_date || "",
        expeditionPlace: form.city || "",
      });

      if (verificationResult.verified) {
        setIsVerified(true);
        setVerificationMessage("✅ Documento verificado correctamente");
        const { city: cityField, ...rest } = form;
        const registerData = {
          ...rest,
          expedition_place: cityField || "",
        };
        await registerDelivery(registerData);
        setShowSuccess(true);
      } else {
        setIsVerified(false);
        setVerificationMessage(`❌ ${verificationResult.message}`);
      }
    } catch (error: unknown) {
      const errorMsg = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || "Error en el proceso";
      setIsVerified(false);
      setVerificationMessage(`❌ ${errorMsg}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccess(false);
    navigate("/dashboard");
  };

  return (
    <div className="delivery-register-container">
      <button
        type="button"
        onClick={() => navigate("/register-select")}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.92)', color: '#e8500a', border: 'none', borderRadius: 22, padding: '9px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}
      >
        ← Regresar
      </button>
      {showSuccess && (
        <div className="delivery-success-overlay">
          <div className="delivery-success-modal">
            <div className="delivery-success-icon">✓</div>
            <h3>¡Registro exitoso!</h3>
            <p>Tu identidad fue verificada correctamente. Cuenta creada exitosamente.</p>
            <button className="delivery-success-btn" onClick={handleSuccessConfirm}>
              Ir al Panel de Control
            </button>
          </div>
        </div>
      )}
      <div className="delivery-register-left">
        <img src="/Logo-png.png" alt="UrbanRush Logo" className="mobile-logo-form" />

        <motion.div
          className="delivery-register-card"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* PASO 1: FORMULARIO */}
          {step === "form" && (
            <>
              <div className="delivery-register-header">
                <h2>Registro de Domiciliario</h2>
                <p>Paso 1 de 2 — Información personal y vehículo</p>
              </div>

              {(apiError || contextError) && (
                <div className="error-text">
                  {apiError || contextError}
                </div>
              )}

              <form onSubmit={handleNextStep} className="delivery-register-form">
                <div className="form-section">
                  <h3>Información Personal</h3>
                  
                  <input
                    name="user_email"
                    type="email"
                    placeholder="Correo electrónico"
                    value={form.user_email}
                    onChange={handleChange}
                  />
                  {errors.user_email && <span className="error-message">{errors.user_email}</span>}

                  <PasswordInput
                    name="user_password"
                    placeholder="Contraseña"
                    value={form.user_password}
                    onChange={handleChange}
                  />
                  {errors.user_password && <span className="error-message">{errors.user_password}</span>}

                  <div className="delivery-register-row">
                    <div>
                      <input
                        name="firstName"
                        placeholder="Nombre"
                        value={form.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    <div>
                      <input
                        name="firstLastName"
                        placeholder="Apellido"
                        value={form.firstLastName}
                        onChange={handleChange}
                      />
                      {errors.firstLastName && <span className="error-message">{errors.firstLastName}</span>}
                    </div>
                  </div>

                  <div className="delivery-register-row">
                    <div>
                      <input
                        name="cellphone"
                        placeholder="Celular"
                        value={form.cellphone}
                        onChange={handleChange}
                      />
                      {errors.cellphone && <span className="error-message">{errors.cellphone}</span>}
                    </div>
                    <div>
                      <select name="gender" value={form.gender} onChange={handleChange}>
                        <option value="" disabled>Género</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                      {errors.gender && <span className="error-message">{errors.gender}</span>}
                    </div>
                  </div>

                  <input
                    name="address"
                    placeholder="Dirección"
                    value={form.address}
                    onChange={handleChange}
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}

                  <div className="delivery-register-row">
                    <div>
                      <input
                        name="document_number"
                        placeholder="Número de Cédula"
                        value={form.document_number}
                        onChange={handleChange}
                      />
                      {errors.document_number && <span className="error-message">{errors.document_number}</span>}
                    </div>
                    <div>
                      <input
                        name="expedition_date"
                        type="date"
                        placeholder="Fecha de Expedición"
                        value={form.expedition_date}
                        onChange={handleChange}
                      />
                      {errors.expedition_date && <span className="error-message">{errors.expedition_date}</span>}
                    </div>
                  </div>
                  <input
                    name="city"
                    placeholder="Ciudad de expedición"
                    value={form.city}
                    onChange={handleChange}
                  />
          {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-section">
                  <h3>Información del Vehículo</h3>
                  
                  <select
                    name="vehicle_type"
                    value={form.vehicle_type}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Selecciona tipo de vehículo</option>
                    <option value="motorcycle">Motocicleta</option>
                    <option value="bicycle">Bicicleta</option>
                    <option value="car">Auto</option>
                  </select>
                  {errors.vehicle_type && (
                    <span className="error-message">{errors.vehicle_type}</span>
                  )}

                  <input
                    name="vehicle_plate"
                    placeholder="Placa del vehículo"
                    value={form.vehicle_plate}
                    onChange={handleChange}
                  />
                  {errors.vehicle_plate && (
                    <span className="error-message">{errors.vehicle_plate}</span>
                  )}

                  <input
                    name="soat_number"
                    placeholder="Número de SOAT"
                    value={form.soat_number}
                    onChange={handleChange}
                  />
                  {errors.soat_number && (
                    <span className="error-message">{errors.soat_number}</span>
                  )}
                </div>

                <button type="submit" className="delivery-register-btn">
                  Siguiente
                </button>
              </form>

              <p className="login-link">
                ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
              </p>
            </>
          )}

          {/* PASO 2: VERIFICACIÓN */}
          {step === "verification" && (
            <>
              <div className="delivery-register-header">
                <h2>Verificación de Identidad</h2>
                <p>Paso 2 de 2 — Sube tu cédula</p>
              </div>

              {apiError && (
                <div className="error-box">
                  {apiError}
                </div>
              )}

              <div className="verification-section">
                <p className="verification-info-text">
                  Para garantizar la seguridad de nuestra plataforma, validaremos tus datos contra tu cédula de ciudadanía. Sube las dos caras del documento.
                </p>

                <div className="file-upload-wrapper">
                  <label htmlFor="cedula-upload" className="file-upload-label">
                    {documentImages.length > 0 
                      ? `📸 ${documentImages.map(f => f.name).join(", ")}` 
                      : "📸 Subir las dos caras de la Cédula"}
                  </label>
                  <input
                    id="cedula-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="file-upload-input"
                  />
                </div>
                
        {documentImages.length > 0 && documentImages.length < 2 && (
          <p className="error-message" style={{ marginTop: "8px" }}>
            Debes subir las dos caras del documento
          </p>
        )}

        {verificationMessage && (
          <div className={`doc-result ${isVerified ? 'verified' : 'rejected'}`}>
            {verificationMessage}
          </div>
        )}
      </div>

      <div className="button-group">
                <button 
                  onClick={() => setStep("form")} 
                  className="delivery-register-btn btn-secondary-style"
                  disabled={isVerifying || isLoading}
                >
                  Volver
                </button>
                <button 
                  onClick={handleVerifyAndRegister} 
                  className="delivery-register-btn"
                  disabled={isVerifying || isLoading}
                >
                  {isVerifying ? "Verificando con IA..." : (isLoading ? "Registrando..." : "Confirmar y Registrar")}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* RIGHT - IMAGE */}
      <div className="delivery-register-right">
        <img src="/delivery.png" alt="delivery" />
        <div className="delivery-register-overlay">
          <img src="/Logo-png.png" alt="UrbanRush Logo" className="register-logo-img" />
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegister;
