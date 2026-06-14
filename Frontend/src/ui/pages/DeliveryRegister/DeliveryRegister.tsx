/**
 * UI LAYER - PÁGINA DELIVERY REGISTER
 * Usa correctamente la arquitectura hexagonal
 * - Usa useAuth() para el registro y verificación
 * - NO crea instancias de casos de uso
 * - NO importa detalles de infraestructura (axios, APIs, etc)
 */

import "./DeliveryRegister.css";
import PasswordInput from "../../components/ui/PasswordInput";
import FormField from "../../components/ui/FormField/FormField";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import type { RegisterDeliveryRequest } from "../../../domain/types/auth.types";
import { validateCedula } from "../../../domain/utils/cedula";
import CedulaUploader from "../../components/verification/CedulaUploader";

type Step = "form" | "verification" | "result";

const DeliveryRegister = () => {
  const navigate = useNavigate();
  const { registerDelivery, verifyDocument, login, isLoading, error: contextError } = useAuth();

  const [step, setStep] = useState<Step>("form");
  const [apiError, setApiError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
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

  const handleFrontChange = (file: File | null) => {
    setFrontImage(file);
    setVerificationMessage("");
    setIsVerified(false);
  };
  const handleBackChange = (file: File | null) => {
    setBackImage(file);
    setVerificationMessage("");
    setIsVerified(false);
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
    const cedulaCheck = validateCedula(form.document_number || "");
    if (!cedulaCheck.valid) newErrors.document_number = cedulaCheck.reason ?? "Inválido";
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
    if (!frontImage) {
      setApiError("Subí la cara frontal de tu cédula");
      return;
    }
    if (!backImage) {
      setApiError("Ahora subí la cara trasera de tu cédula");
      return;
    }

    try {
      setApiError("");
      setVerificationMessage("");
      setIsVerifying(true);

      const verificationResult = await verifyDocument([frontImage, backImage], {
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

  const handleSuccessConfirm = async () => {
    setShowSuccess(false);
    // Auto-login con las credenciales recién registradas para entrar al panel de domiciliario.
    try {
      await login(form.user_email, form.user_password);
      navigate("/courier/dashboard");
    } catch {
      // Si el auto-login falla (por lo que sea) lo mandamos al login con su email pre-cargado.
      navigate("/login");
    }
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
              Ir a mi Panel de Domiciliario
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

                  <FormField label="Correo electrónico" error={errors.user_email}>
                    <input
                      name="user_email"
                      type="email"
                      placeholder="Correo electrónico"
                      value={form.user_email}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Contraseña" error={errors.user_password}>
                    <PasswordInput
                      name="user_password"
                      placeholder="Contraseña"
                      value={form.user_password}
                      onChange={handleChange}
                    />
                  </FormField>

                  <div className="delivery-register-row">
                    <FormField label="Nombre" error={errors.firstName}>
                      <input
                        name="firstName"
                        placeholder="Nombre"
                        value={form.firstName}
                        onChange={handleChange}
                      />
                    </FormField>
                    <FormField label="Apellido" error={errors.firstLastName}>
                      <input
                        name="firstLastName"
                        placeholder="Apellido"
                        value={form.firstLastName}
                        onChange={handleChange}
                      />
                    </FormField>
                  </div>

                  <div className="delivery-register-row">
                    <FormField label="Celular" error={errors.cellphone}>
                      <input
                        name="cellphone"
                        placeholder="Celular"
                        value={form.cellphone}
                        onChange={handleChange}
                      />
                    </FormField>
                    <FormField label="Género" error={errors.gender}>
                      <select name="gender" value={form.gender} onChange={handleChange}>
                        <option value="" disabled>Género</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Dirección" error={errors.address}>
                    <input
                      name="address"
                      placeholder="Dirección"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </FormField>

                  <div className="delivery-register-row">
                    <FormField label="Cédula" error={errors.document_number}>
                      <input
                        name="document_number"
                        placeholder="Número de Cédula"
                        value={form.document_number}
                        onChange={handleChange}
                      />
                    </FormField>
                    <FormField label="Fecha exp." error={errors.expedition_date}>
                      <input
                        name="expedition_date"
                        type="date"
                        placeholder="Fecha de Expedición"
                        value={form.expedition_date}
                        onChange={handleChange}
                      />
                    </FormField>
                  </div>

                  <FormField label="Ciudad de expedición" error={errors.city}>
                    <input
                      name="city"
                      placeholder="Ciudad de expedición"
                      value={form.city}
                      onChange={handleChange}
                    />
                  </FormField>
                </div>

                <div className="form-section">
                  <h3>Información del Vehículo</h3>

                  <FormField label="Tipo de vehículo" error={errors.vehicle_type}>
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
                  </FormField>

                  <FormField label="Placa" error={errors.vehicle_plate}>
                    <input
                      name="vehicle_plate"
                      placeholder="Placa del vehículo"
                      value={form.vehicle_plate}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="SOAT" error={errors.soat_number}>
                    <input
                      name="soat_number"
                      placeholder="Número de SOAT"
                      value={form.soat_number}
                      onChange={handleChange}
                    />
                  </FormField>
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
                  Para garantizar la seguridad de nuestra plataforma validaremos tus datos contra tu cédula de ciudadanía. Subí <strong>primero la cara frontal</strong> y después la <strong>cara trasera</strong>.
                </p>

                <CedulaUploader
                  frontImage={frontImage}
                  backImage={backImage}
                  onFrontChange={handleFrontChange}
                  onBackChange={handleBackChange}
                  disabled={isVerifying || isLoading}
                />

                {verificationMessage && (
                  <div className={`doc-result ${isVerified ? 'verified' : 'rejected'}`} style={{ marginTop: 12 }}>
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
                  disabled={isVerifying || isLoading || !frontImage || !backImage}
                  title={!frontImage ? "Subí primero la cara frontal" : !backImage ? "Falta la cara trasera" : ""}
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
