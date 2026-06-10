/**
 * UI LAYER - PÁGINA LOGIN
 * Usa correctamente la arquitectura hexagonal:
 * - NO crea instancias de casos de uso
 * - NO importa detalles de implementación (axios, localStorage, etc)
 * - Usa useAuth() hook que ya tiene todo inyectado
 */

import "./Login.css";
import { useAuth } from "../../context/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

// Validación con zod
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  // Los casos de uso ya vienen inyectados del AuthProvider
  const { login, isLoading, error: contextError, state } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>("");

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

      console.log("Login response:", response);
      console.log("User role:", response.user?.role);

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
          <h2>¡Hola de nuevo!</h2>
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

          <button className="login-btn-google">
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
