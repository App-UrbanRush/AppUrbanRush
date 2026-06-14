import "./Register.css";
import PasswordInput from "../../components/ui/PasswordInput";
import FormField from "../../components/ui/FormField/FormField";
import { useAuth } from "../../context/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { RegisterRequest } from "../../../domain/types/auth.types";
import LocationInput from "../../components/ui/LocationInput";

// Validación con zod adaptada al nuevo DTO
const registerSchema = z.object({
  user_email: z.string().email("Email inválido"),
  user_password: z.string().min(6, "Mínimo 6 caracteres"),
  firstName: z.string().min(2, "Nombre requerido"),
  firstLastName: z.string().min(2, "Apellido requerido"),
  cellphone: z.string().min(7, "Celular requerido"),
  address: z.string().min(5, "Dirección requerida"),
  gender: z.string().min(1, "Género requerido"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: registerUser, isLoading, error: contextError } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    setValue("address", address);
    setLocation({ lat, lng });
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setApiError("");
      
      const payload: RegisterRequest & { latitude?: number; longitude?: number } = {
        ...data,
        ...(location && { latitude: location.lat, longitude: location.lng }),
      };

      await registerUser(payload);
      setShowSuccess(true);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || "Error en registro";
      setApiError(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccess(false);
    navigate("/dashboard");
  };

  return (
    <div className="register-container">
      <button
        type="button"
        onClick={() => navigate("/register-select")}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.92)', color: '#e8500a', border: 'none', borderRadius: 22, padding: '9px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}
      >
        ← Regresar
      </button>
      {showSuccess && (
        <div className="register-success-overlay">
          <div className="register-success-modal">
            <div className="register-success-icon">✓</div>
            <h3>¡Registro exitoso!</h3>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <button className="register-success-btn" onClick={handleSuccessConfirm}>
              Ir al panel
            </button>
          </div>
        </div>
      )}

      <div className="register-left">
        <motion.div
          className="register-card"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Crear cuenta</h2>
          <p style={{ marginTop: -6, marginBottom: 18, color: '#888', fontSize: 14, fontWeight: 600 }}>Registro de usuario</p>

          {(apiError || contextError) && (
            <div className="register-api-error">
              {apiError || contextError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Correo electrónico" error={errors.user_email?.message}>
              <input
                {...register("user_email")}
                type="email"
                placeholder="Correo electrónico"
              />
            </FormField>

            <FormField label="Contraseña" error={errors.user_password?.message}>
              <PasswordInput
                {...register("user_password")}
                placeholder="Contraseña"
              />
            </FormField>

            <div className="register-row">
              <FormField label="Nombre" error={errors.firstName?.message}>
                <input
                  {...register("firstName")}
                  placeholder="Nombre"
                />
              </FormField>
              <FormField label="Apellido" error={errors.firstLastName?.message}>
                <input
                  {...register("firstLastName")}
                  placeholder="Apellido"
                />
              </FormField>
            </div>

            <div className="register-row">
              <FormField label="Celular" error={errors.cellphone?.message}>
                <input
                  {...register("cellphone")}
                  placeholder="Celular"
                />
              </FormField>
              <FormField label="Género" error={errors.gender?.message}>
                <select {...register("gender")} defaultValue="">
                  <option value="" disabled>Seleccione Género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </FormField>
            </div>

            <FormField label="Dirección" error={errors.address?.message}>
              <input
                {...register("address")}
                placeholder="Dirección"
              />
              <LocationInput onAddressFound={handleLocationSelect} />
            </FormField>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Registrarse"}
            </button>
          </form>

          <p className="login-link">
            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
          </p>
        </motion.div>
      </div>

      <div className="register-right">
        <img src="/delivery2.png" alt="delivery" />

        <div className="register-overlay">
          <img src="/Logo-png.png" alt="UrbanRush Logo" className="register-logo-img" />
        </div>
      </div>
    </div>
  );
};

export default Register;
