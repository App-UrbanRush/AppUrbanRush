import { useState } from "react";
import "./ResetPassword.css";
import PasswordInput from "../../components/ui/PasswordInput";
import { useAuth } from "../../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldCheck } from "lucide-react";

type Step = "code" | "password";

const ResetPassword = () => {
  const { verifyCode, resetPassword, isLoading, error: contextError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<Step>(email ? "code" : "code");
  const [apiError, setApiError] = useState<string>("");
  const [codeError, setCodeError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const handleVerifyCode = async () => {
    if (!email) { setApiError("Ingresa tu correo electrónico"); return; }
    if (code.length !== 6) { setCodeError("El código debe tener 6 dígitos"); return; }
    setCodeError("");
    setApiError("");
    try {
      await verifyCode(email, code);
      setStep("password");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al verificar el código";
      setApiError(msg);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) { setPasswordError("Mínimo 6 caracteres"); return; }
    setPasswordError("");
    setApiError("");
    try {
      await resetPassword({ user_email: email, code, new_password: newPassword });
      navigate("/login", { state: { message: "Contraseña actualizada correctamente" } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al restablecer la contraseña";
      setApiError(msg);
    }
  };

  const errorMsg = apiError || contextError;

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
          {step === "code" && (
            <>
              <h2>Verifica tu código</h2>
              <p>Ingresa el código de 6 dígitos enviado a tu correo</p>

              {errorMsg && (
                <span style={{ display: "block", marginBottom: "15px", color: "red" }}>
                  {errorMsg}
                </span>
              )}

              <div className="reset-password-input-group">
                <div className="reset-password-input-wrapper">
                  <Mail className="reset-password-input-icon" size={18} />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    placeholder="     Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={!!emailFromState}
                  />
                </div>
              </div>

              <div className="reset-password-input-group">
                <div className="reset-password-input-wrapper">
                  <ShieldCheck className="reset-password-input-icon" size={18} />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    placeholder="     Código"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setCodeError(""); }}
                  />
                </div>
                {codeError && <span style={{ color: "red", fontSize: 13 }}>{codeError}</span>}
              </div>

              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={isLoading}
                className="reset-password-btn-primary"
              >
                {isLoading ? "Verificando..." : "Verificar Código"}
              </button>
            </>
          )}

          {step === "password" && (
            <>
              <h2>Nueva contraseña</h2>
              <p>Ingresa tu nueva contraseña</p>

              {errorMsg && (
                <span style={{ display: "block", marginBottom: "15px", color: "red" }}>
                  {errorMsg}
                </span>
              )}

              <div className="reset-password-input-group">
                <div className="reset-password-input-wrapper">
                  <Mail className="reset-password-input-icon" size={18} />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="reset-password-input-readonly"
                  />
                </div>
              </div>

              <div className="reset-password-input-group">
                <div className="reset-password-input-wrapper">
                  <Lock className="reset-password-input-icon" size={18} />
                  <PasswordInput
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                    placeholder="Nueva contraseña"
                  />
                </div>
                {passwordError && <span style={{ color: "red", fontSize: 13 }}>{passwordError}</span>}
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="reset-password-btn-primary"
              >
                {isLoading ? "Actualizando..." : "Restablecer Contraseña"}
              </button>
            </>
          )}

          <div className="reset-password-footer">
            {step === "code" && (
              <p>¿No recibiste el código? <a href="/forgot-password">Reenviar</a></p>
            )}
            {step === "password" && (
              <p style={{ cursor: "pointer", color: "#666" }} onClick={() => setStep("code")}>
                ← Volver a verificar código
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
