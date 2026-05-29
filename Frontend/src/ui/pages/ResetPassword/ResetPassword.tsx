import { useState } from "react";
import "./ResetPassword.css";
import { useAuth } from "../../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";

const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
  new_password: z.string().min(6, "Mínimo 6 caracteres"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const { resetPassword, isLoading, error: contextError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromState,
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setApiError("");
      await resetPassword({ user_email: data.email, code: data.code, new_password: data.new_password });
      navigate("/login", { state: { message: "Contraseña actualizada correctamente" } });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al restablecer la contraseña";
      setApiError(errorMsg);
    }
  };

  const [apiError, setApiError] = useState<string>("");

  return (
    <div className="reset-password-container">
      <div className="reset-password-left">
        <img src="/delivery1.png" alt="delivery" />
        <div className="reset-password-overlay">
          <img src="/Logo-png.png" alt="UrbanRush Logo" className="reset-password-logo-img" />
        </div>
      </div>

      <div className="reset-password-right">
        <motion.div
          className="reset-password-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>Restablece tu contraseña</h2>
          <p>Ingresa el código enviado a tu correo y una nueva contraseña</p>

          {(apiError || contextError) && (
            <span style={{ display: "block", marginBottom: "15px", color: "red" }}>
              {apiError || contextError}
            </span>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="reset-password-input-group">
              <div className="reset-password-input-wrapper">
                <Mail className="reset-password-input-icon" size={18} />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  {...register("email")}
                  type="email"
                  placeholder="     Email"
                  readOnly
                />
              </div>
              {errors.email && <span>{errors.email.message}</span>}
            </div>

            <div className="reset-password-input-group">
              <div className="reset-password-input-wrapper">
                <Lock className="reset-password-input-icon" size={18} />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  {...register("code")}
                  type="text"
                  placeholder="     Código"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
              {errors.code && <span>{errors.code.message}</span>}
            </div>

            <div className="reset-password-input-group">
              <div className="reset-password-input-wrapper">
                <Lock className="reset-password-input-icon" size={18} />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  {...register("new_password")}
                  type="password"
                  placeholder="     Nueva contraseña"
                />
              </div>
              {errors.new_password && <span>{errors.new_password.message}</span>}
            </div>

            <button type="submit" disabled={isLoading} className="reset-password-btn-primary">
              {isLoading ? "Actualizando..." : "Restablecer Contraseña"}
            </button>
          </form>

          <div className="reset-password-footer">
            <p>¿No recibiste el código? <a href="/forgot-password">Reenviar</a></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;