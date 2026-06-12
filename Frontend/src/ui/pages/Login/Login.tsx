import "./Login.css";
import { useAuth } from "../../context/useAuth";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Logo oficial multicolor de Google
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
  </svg>
);

// Validación con zod
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  // Los casos de uso ya vienen inyectados del AuthProvider
  const { login, isLoading, error: contextError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apiError, setApiError] = useState<string>("");

  // Muestra el error si el callback de Google redirige con ?error=
  useEffect(() => {
    const googleError = searchParams.get("error");
    if (googleError) setApiError(googleError);
  }, [searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // onSubmit: llama al caso de uso inyectado
  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError("");
      // Aquí login es el LoginUseCase inyectado en el AuthProvider
      // Él se encarga de:
      // 1. Llamar al repositorio
      // 2. Guardar en localStorage
      // 3. Actualizar el contexto
      const response = await login(data.email, data.password);

      // Redirigir según el rol del usuario desde la respuesta
      if (response.user?.role === "Negocio") {
        navigate("/vendor/dashboard");
      } else if (response.user?.role === "Domiciliario") {
        navigate("/courier/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Credenciales incorrectas";
      setApiError(errorMsg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/delivery1.png" alt="delivery" />
        <div className="login-overlay">
          <img src="/Logo-png.png" alt="UrbanRush Logo" className="login-logo-img" />
        </div>
      </div>

      <div className="login-right">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>¡Hola, Bienvenido a UrbanRush!</h2>
          <p>Inicia sesión para continuar</p>

          {(apiError || contextError) && (
            <span style={{ display: "block", marginBottom: "15px", color: "red" }}>
              {apiError || contextError}
            </span>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="login-input-group">
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" size={18} />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  {...register("email")}
                  type="email"
                  placeholder="     Email"
                />
              </div>
              {errors.email && <span>{errors.email.message}</span>}
            </div>

            <div className="login-input-group">
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" size={18} />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  {...register("password")}
                  type="password"
                  placeholder="     Contraseña"
                />
              </div>
              {errors.password && <span>{errors.password.message}</span>}
            </div>

            <button type="submit" disabled={isLoading} className="login-btn-primary">
              <LogIn size={18} />
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>

          <button type="button" className="login-btn-google" onClick={handleGoogleLogin}>
            <GoogleIcon />
            Continuar con Google
          </button>

           <Link className="login-forgot" to="/register-select">
             Crear cuenta
           </Link>

           <Link className="login-forgot" to="/forgot-password">
             ¿Olvidaste tu contraseña?
           </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
