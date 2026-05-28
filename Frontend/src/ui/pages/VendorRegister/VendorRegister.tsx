import "./VendorRegister.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/useAuth";
import type { RegisterVendorRequest } from "../../../domain/types/vendor.types";

const schema = z.object({
  user_email: z.string().email("Email inválido"),
  user_password: z.string().min(6, "Mínimo 6 caracteres"),
  confirm_password: z.string().min(6, "Confirma tu contraseña"),
  firstName: z.string().min(2, "Nombre requerido"),
  firstLastName: z.string().min(2, "Apellido requerido"),
  document_number: z.string().min(5, "Documento requerido"),
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
  const { verifyDocument: verifyDocumentApi, registerVendor, error: contextError } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [docImages, setDocImages] = useState<File[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [docVerified, setDocVerified] = useState(false);
  const [docMessage, setDocMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const nextStep1 = async () => {
    const ok = await trigger(["user_email", "user_password", "confirm_password"]);
    if (ok) setStep(2);
  };

  const handleDocImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
          setApiError("Solo se permiten imágenes JPG, PNG o WEBP");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setApiError("La imagen no debe superar los 5MB");
          return;
        }
        newImages.push(file);
      }
      setDocImages(newImages);
      setApiError("");
      setDocVerified(false);
      setDocMessage("");
    }
  };

  const verifyDocument = async () => {
    const values = getValues();
    const ok = await trigger(["firstName", "firstLastName", "document_number", "expedition_date", "city"]);
    if (!ok) return;

    if (docImages.length === 0) {
      setApiError("Debes subir las dos caras de tu cédula");
      return;
    }

    if (docImages.length < 2) {
      setApiError("Debes subir las dos caras del documento");
      return;
    }

    setVerifying(true);
    setApiError("");
    setDocMessage("");
    try {
      const expeditionPlace = values.city || "";
      const result = await verifyDocumentApi(docImages, {
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
      const payload: RegisterVendorRequest = {
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

  const handleSuccessConfirm = () => {
    setShowSuccess(false);
    navigate("/dashboard");
  };

  const stepTitle = stepTitles[step] || "";

  return (
    <div className="vendorregister-container">
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h3>¡Registro exitoso!</h3>
            <p>Tu negocio ha sido registrado correctamente.</p>
            <button className="success-btn" onClick={handleSuccessConfirm}>
              Ir al panel
            </button>
          </div>
        </div>
      )}

      <div className="vendorregister-left">
        <div className="vendorregister-card" key={step}>
          <button className="back-btn" onClick={() => step === 1 ? navigate("/register-select") : setStep(step - 1)}>
            ← Volver
          </button>

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
                  <input {...register("user_password")} type="password" placeholder="Contraseña" />
                  {errors.user_password && <span className="error">{errors.user_password.message}</span>}
                </div>

                <div className="input-group">
                  <input {...register("confirm_password")} type="password" placeholder="Confirmar contraseña" />
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
                <div className="input-group doc-upload-section">
                  <label className="doc-label">📷 Foto de tu cédula (ambas caras)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleDocImageChange}
                    className="doc-input"
                  />
                  {docImages.length > 0 && docImages.length < 2 && (
                    <span className="error">Debes subir las dos caras del documento</span>
                  )}
                  {docImages.length >= 2 && !docVerified && (
                    <button
                      type="button"
                      className="verify-doc-btn"
                      onClick={verifyDocument}
                      disabled={verifying}
                    >
                      {verifying ? "⏳ Verificando..." : "🔍 Verificar documento"}
                    </button>
                  )}
                  {docMessage && (
                    <div className={`doc-result ${docVerified ? "verified" : "rejected"}`}>
                      {docMessage}
                    </div>
                  )}
                  <span className="doc-hint">Sube una foto clara de tu cédula (JPG, PNG o WEBP, máx. 5MB)</span>
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
