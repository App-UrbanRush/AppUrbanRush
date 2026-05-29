import { useState } from "react";
import "./ForgotPassword.css";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { forgotPassword, isLoading, error: contextError } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setApiError("");
      await forgotPassword(data.email);
      // Navigate to reset password page with email as state
      navigate("/reset-password", { state: { email: data.email } });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al enviar el código";
      setApiError(errorMsg);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-left">
        <img src="/delivery1.png" alt="delivery" />
        <div className="forgot-password-overlay">
          <img src="/Logo-png.png" alt="UrbanRush Logo" className="forgot-password-logo-img" />
        </div>
      </div>

      <div className="forgot-password-right">
        <motion.div
          className="forgot-password-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>Recupera tu contraseña</h2>
          <p>Ingresa tu correo electrónico para recibir un código de verificación</p>

          {(apiError || contextError) && (
            <span style={{ display: "block", marginBottom: "15px", color: "red" }}>
              {apiError || contextError}
            </span>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="forgot-password-input-group">
              <div className="forgot-password-input-wrapper">
                <Mail className="forgot-password-input-icon" size={18} />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  {...register("email")}
                  type="email"
                  placeholder="     Email"
                />
              </div>
              {errors.email && <span>{errors.email.message}</span>}
            </div>

            <button type="submit" disabled={isLoading} className="forgot-password-btn-primary">
              {isLoading ? "Enviando..." : "Enviar Código"}
            </button>
          </form>

          <div className="forgot-password-footer">
            <p>¿Recordaste tu contraseña? <a href="/login">Inicia sesión</a></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;