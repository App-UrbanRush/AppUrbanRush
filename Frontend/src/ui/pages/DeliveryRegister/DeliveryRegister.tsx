/**
 * UI LAYER - PÁGINA DELIVERY REGISTER
 * Usa correctamente la arquitectura hexagonal
 * - Usa useAuth() para el registro y verificación
 * - NO crea instancias de casos de uso
 * - NO importa detalles de infraestructura (axios, APIs, etc)
 */

import "./DeliveryRegister.css";
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
  const [documentImage, setDocumentImage] = useState<File | null>(null);

  const [form, setForm] = useState<RegisterDeliveryRequest>({
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
    birthDate: "",
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
    if (e.target.files && e.target.files[0]) {
      setDocumentImage(e.target.files[0]);
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
    if (!form.birthDate) newErrors.birthDate = "Requerido";

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
    if (!documentImage) {
      setApiError("Debes subir una foto de tu cédula para continuar");
      return;
    }

    try {
      setApiError("");
      setIsVerifying(true);

      const verificationResult = await verifyDocument(documentImage, {
        cedula: form.document_number || "",
        firstName: form.firstName,
        firstLastName: form.firstLastName,
        birthDate: form.birthDate || "",
      });

      if (!verificationResult.verified) {
        throw new Error(`Verificación fallida: ${verificationResult.mismatches.join(", ")}`);
      }

      await registerDelivery(form);
      setStep("result");
    } catch (error: unknown) {
      // Axios error has response.data.message sometimes
      const errorMsg = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || "Error en el proceso";
      setApiError(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="delivery-register-container">
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

                  <input
                    name="user_password"
                    type="password"
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
                        name="birthDate"
                        type="date"
                        title="Fecha de Nacimiento"
                        value={form.birthDate}
                        onChange={handleChange}
                      />
                      {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
                    </div>
                  </div>
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
                  Para garantizar la seguridad de nuestra plataforma, validaremos tus datos contra tu cédula de ciudadanía.
                </p>

                <div className="file-upload-wrapper">
                  <label htmlFor="cedula-upload" className="file-upload-label">
                    {documentImage ? `📸 ${documentImage.name}` : "📸 Subir foto frontal de la Cédula"}
                  </label>
                  <input
                    id="cedula-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-upload-input"
                  />
                </div>
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

          {/* RESULTADO */}
          {step === "result" && (
            <div className="result-section">
              <h2 className="result-title">¡Registro exitoso!</h2>
              <p className="result-message-style">
                Tu identidad fue verificada correctamente. Cuenta creada exitosamente.</p>
              <button 
                onClick={() => navigate("/")} 
                className="delivery-register-btn"
              >
                Ir al inicio de sesión
              </button>
            </div>
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
