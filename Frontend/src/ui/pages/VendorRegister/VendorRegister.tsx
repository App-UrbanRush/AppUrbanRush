import "./VendorRegister.css";
import PasswordInput from "../../components/ui/PasswordInput";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/useAuth";
import type { RegisterVendorRequest } from "../../../domain/types/vendor.types";
import LocationInput from "../../components/ui/LocationInput";
import CedulaUploader from "../../components/verification/CedulaUploader";

const schema = z.object({
  user_email: z.string().email("Email inválido"),
  user_password: z.string().min(6, "Mínimo 6 caracteres"),
  confirm_password: z.string().min(6, "Confirma tu contraseña"),
  firstName: z.string().min(2, "Nombre requerido"),
  firstLastName: z.string().min(2, "Apellido requerido"),
  document_number: z
    .string()
    .refine(
      (v) => {
        const n = (v ?? "").replace(/[.\s\-_]/g, "");
        return /^\d{6,10}$/.test(n) && !n.startsWith("0") && !/^(\d)\1+$/.test(n);
      },
      { message: "Cédula inválida: 6 a 10 dígitos sin letras" },
    ),
  expedition_date: z.string().min(1, "Fecha de expedición requerida"),
  city: z.string().min(1, "Ciudad de expedición requerida"),
  cellphone: z.string().min(7, "Celular requerido"),
  gender: z.string().min(1, "Género requerido"),
  business_name: z.string().min(2, "Nombre del negocio requerido"),
  business_type: z.string().min(1, "Tipo de negocio requerido"),
  business_address: z.string().min(5, "Dirección del negocio requerida"),
  business_phone: z.string().min(7, "Teléfono del negocio requerido"),
  description: z.string().optional(),
  nit: z.string().optional(),
  document_url: z.string().optional(),
}).refine((data) => data.user_password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

const stepTitles: Record<number, string> = {
  1: "Datos de la cuenta",
  2: "Datos del propietario",
  3: "Verificación de documento",
  4: "Datos del negocio",
};

const VendorRegister = () => {
  const navigate = useNavigate();
  const { verifyDocument: verifyDocumentApi, registerVendor, login, error: contextError } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [docFront, setDocFront] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [docVerified, setDocVerified] = useState(false);
  const [docMessage, setDocMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [businessLocation, setBusinessLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const handleBusinessLocationFound = (address: string, lat: number, lng: number) => {
    setValue("business_address", address);
    setBusinessLocation({ lat, lng });
  };

  const nextStep1 = async () => {
    const ok = await trigger(["user_email", "user_password", "confirm_password"]);
    if (ok) setStep(2);
  };

  const validateDocFile = (file: File | null): string | null => {
    if (!file) return null;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return "Solo se permiten imágenes JPG, PNG o WEBP";
    if (file.size > 5 * 1024 * 1024) return "La imagen no debe superar los 5MB";
    return null;
  };

  const handleFrontChange = (file: File | null) => {
    const err = validateDocFile(file);
    if (err) { setApiError(err); return; }
    setDocFront(file);
    setApiError("");
    setDocVerified(false);
    setDocMessage("");
  };
  const handleBackChange = (file: File | null) => {
    const err = validateDocFile(file);
    if (err) { setApiError(err); return; }
    setDocBack(file);
    setApiError("");
    setDocVerified(false);
    setDocMessage("");
  };

  const verifyDocument = async () => {
    const values = getValues();
    const ok = await trigger(["firstName", "firstLastName", "document_number", "expedition_date", "city"]);
    if (!ok) return;

    if (!docFront) {
      setApiError("Subí la cara frontal de tu cédula");
      return;
    }
    if (!docBack) {
      setApiError("Ahora subí la cara trasera de tu cédula");
      return;
    }

    setVerifying(true);
    setApiError("");
    setDocMessage("");
    try {
      const expeditionPlace = values.city || "";
      const result = await verifyDocumentApi([docFront, docBack], {
        cedula: values.document_number,
        firstName: values.firstName,
        firstLastName: values.firstLastName,
        expeditionDate: values.expedition_date,
        expeditionPlace: expeditionPlace,
      });

      if (result.verified) {
        setDocVerified(true);
        setDocMessage("✅ Documento verificado correctamente");
      } else {
        setDocVerified(false);
        setDocMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setDocMessage(error.response?.data?.message || "Error al verificar el documento");
    } finally {
      setVerifying(false);
    }
  };

  const nextStep2 = async () => {
    const ok = await trigger(["firstName", "firstLastName", "document_number", "expedition_date", "city", "cellphone", "gender"]);
    if (ok) setStep(3);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError("");
    try {
      const payload: RegisterVendorRequest & { latitude?: number; longitude?: number } = {
        user_email: data.user_email,
        user_password: data.user_password,
        firstName: data.firstName,
        firstLastName: data.firstLastName,
        document_number: data.document_number,
        expedition_date: data.expedition_date,
        expedition_place: data.city,
        cellphone: data.cellphone,
        gender: data.gender,
        business_name: data.business_name,
        business_type: data.business_type,
        business_address: data.business_address,
        business_phone: data.business_phone,
        description: data.description,
        nit: data.nit,
        document_url: data.document_url,
        ...(businessLocation && { latitude: businessLocation.lat, longitude: businessLocation.lng }),
      };
      await registerVendor(payload as RegisterVendorRequest);
      setShowSuccess(true);
    } catch (error: any) {
      if (error.response) {
        const backendErrors = error.response.data?.message;
        if (Array.isArray(backendErrors)) {
          setApiError(backendErrors.join("\n"));
        } else if (typeof backendErrors === "string") {
          setApiError(backendErrors);
        } else {
          setApiError("Error en registro");
        }
      } else {
        setApiError(error instanceof Error ? error.message : "Error en registro");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = async () => {
    setShowSuccess(false);
    // Auto-login con las credenciales recién registradas para entrar al panel del negocio.
    try {
      const values = getValues();
      await login(values.user_email, values.user_password);
      navigate("/vendor/dashboard");
    } catch {
      navigate("/login");
    }
  };

  const stepTitle = stepTitles[step] || "";

  return (
    <div className="vendorregister-container">
      <button
        type="button"
        onClick={() => navigate("/register-select")}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.92)', color: '#e8500a', border: 'none', borderRadius: 22, padding: '9px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}
      >
        ← Regresar
      </button>
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h3>¡Registro exitoso!</h3>
            <p>Tu negocio ha sido registrado correctamente.</p>
            <button className="success-btn" onClick={handleSuccessConfirm}>
              Ir a mi Panel de Negocio
            </button>
          </div>
        </div>
      )}

      <div className="vendorregister-left">
        <div className="vendorregister-card" key={step}>
          {step > 1 && (
            <button className="back-btn" onClick={() => setStep(step - 1)}>
              ← Volver
            </button>
          )}

          <h2>Registro de Negocio</h2>

          <div className="step-indicator">
            <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
            <div className="step-line"></div>
            <div className={`step ${step >= 4 ? "active" : ""}`}>4</div>
          </div>

          <p className="step-title">{stepTitle}</p>

          {(apiError || contextError) && <div className="api-error">{apiError || contextError}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div key="step1">
                <div className="input-group">
                  <input {...register("user_email")} type="email" placeholder="Correo electrónico" />
                  {errors.user_email && <span className="error">{errors.user_email.message}</span>}
                </div>

                <div className="input-group">
                  <PasswordInput {...register("user_password")} placeholder="Contraseña" />
                  {errors.user_password && <span className="error">{errors.user_password.message}</span>}
                </div>

                <div className="input-group">
                  <PasswordInput {...register("confirm_password")} placeholder="Confirmar contraseña" />
                  {errors.confirm_password && <span className="error">{errors.confirm_password.message}</span>}
                </div>

                <button type="button" className="next-btn" onClick={nextStep1}>
                  Siguiente →
                </button>
              </div>
            )}

            {step === 2 && (
              <div key="step2">
                <div className="register-row">
                  <div className="input-group" style={{ flex: 1, marginRight: "10px" }}>
                    <input {...register("firstName")} placeholder="Nombre" />
                    {errors.firstName && <span className="error">{errors.firstName.message}</span>}
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input {...register("firstLastName")} placeholder="Apellido" />
                    {errors.firstLastName && <span className="error">{errors.firstLastName.message}</span>}
                  </div>
                </div>

                <div className="register-row">
                  <div className="input-group" style={{ flex: 1, marginRight: "10px" }}>
                    <input {...register("document_number")} placeholder="Número de documento" />
                    {errors.document_number && <span className="error">{errors.document_number.message}</span>}
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input {...register("expedition_date")} type="date" placeholder="Fecha de Expedición" />
                    {errors.expedition_date && <span className="error">{errors.expedition_date.message}</span>}
                  </div>
                </div>

                <div className="input-group">
                  <input {...register("city")} placeholder="Ciudad de expedición" />
                  {errors.city && <span className="error">{errors.city.message}</span>}
                </div>
                

                <div className="register-row">
                  <div className="input-group" style={{ flex: 1, marginRight: "10px" }}>
                    <input {...register("cellphone")} placeholder="Celular" />
                    {errors.cellphone && <span className="error">{errors.cellphone.message}</span>}
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <select {...register("gender")} defaultValue="">
                      <option value="" disabled>Seleccione Género</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {errors.gender && <span className="error">{errors.gender.message}</span>}
                  </div>
                </div>

                <button type="button" className="next-btn" onClick={nextStep2}>
                  Siguiente →
                </button>
              </div>
            )}

            {step === 3 && (
              <div key="step3">
                <div className="doc-upload-section">
                  <label className="doc-label">📷 Foto de tu cédula</label>
                  <p className="doc-hint" style={{ marginBottom: 10 }}>
                    Subí <strong>primero la cara frontal</strong> y después la <strong>cara trasera</strong>. JPG, PNG o WEBP, máx 5 MB cada una.
                  </p>

                  <CedulaUploader
                    frontImage={docFront}
                    backImage={docBack}
                    onFrontChange={handleFrontChange}
                    onBackChange={handleBackChange}
                    disabled={verifying}
                  />

                  {docFront && docBack && !docVerified && (
                    <button
                      type="button"
                      className="verify-doc-btn"
                      onClick={verifyDocument}
                      disabled={verifying}
                      style={{ marginTop: 12 }}
                    >
                      {verifying ? "⏳ Verificando..." : "🔍 Verificar documento"}
                    </button>
                  )}
                  {docMessage && (
                    <div className={`doc-result ${docVerified ? "verified" : "rejected"}`} style={{ marginTop: 10 }}>
                      {docMessage}
                    </div>
                  )}
                </div>

                <button type="button" className="next-btn" onClick={() => docVerified && setStep(4)} disabled={!docVerified}>
                  {docVerified ? "Siguiente →" : "Verifica tu documento para continuar"}
                </button>
              </div>
            )}

{step === 4 && (
              <div key="step4">
                <div className="input-group">
                  <input {...register("business_name")} placeholder="Nombre del negocio" />
                  {errors.business_name && <span className="error">{errors.business_name.message}</span>}
                </div>

                <div className="input-group">
                  <select {...register("business_type")} defaultValue="">
                    <option value="" disabled>Seleccione tipo de negocio</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Tienda">Tienda</option>
                    <option value="Panadería">Panadería</option>
                    <option value="Cafetería">Cafetería</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Bar">Bar</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.business_type && <span className="error">{errors.business_type.message}</span>}
                </div>

                <div className="input-group">
                  <input {...register("business_address")} placeholder="Dirección del negocio" />
                  {errors.business_address && <span className="error">{errors.business_address.message}</span>}
                  <LocationInput onAddressFound={handleBusinessLocationFound} />
                </div>

                <div className="register-row">
                  <div className="input-group" style={{ flex: 1, marginRight: "10px" }}>
                    <input {...register("business_phone")} placeholder="Teléfono del negocio" />
                    {errors.business_phone && <span className="error">{errors.business_phone.message}</span>}
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <input {...register("nit")} placeholder="NIT (opcional)" />
                  </div>
                </div>

                <div className="input-group">
                  <textarea {...register("description")} placeholder="Descripción del negocio (opcional)" rows={3} />
                </div>

                <div className="input-group">
                  <input {...register("document_url")} placeholder="URL documento RUT/Cámara de Comercio (opcional)" />
                </div>

                <button type="submit" disabled={isLoading} className="next-btn">
                  {isLoading ? "Registrando..." : "Completar Registro"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="vendorregister-right">
        <img src="/delivery2.png" alt="delivery" />
        <div className="vendorregister-overlay">
          <img src="/Logo-png.png" alt="UrbanRush Logo" className="vendorregister-logo-img" />
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
