import "../Login/Login.css";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/AuthRepositoryImpl";
import { LoginUseCase } from "../../../application/use-cases/LoginUseCase";
import { LoginDTOSchema, type LoginDTO } from "../../../application/dtos/auth.dtos";

const Login = () => {
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDTO>({
    resolver: zodResolver(LoginDTOSchema),
  });

  const onSubmit = async (data: LoginDTO) => {
    try {
      setLoading(true);
      setError("");

      const authRepository = new AuthRepositoryImpl();
      const loginUseCase = new LoginUseCase(authRepository);

      const response = await loginUseCase.execute(data);
      saveToken(response.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
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

          {error && <span style={{ display: "block", marginBottom: "15px" }}>{error}</span>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="login-input-group">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                {...register("email")}
                type="email"
                placeholder="Email"
              />
              {errors.email && <span>{errors.email.message}</span>}
            </div>

            <div className="login-input-group">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                {...register("password")}
                type="password"
                placeholder="Contraseña"
              />
              {errors.password && <span>{errors.password.message}</span>}
            </div>

            <button disabled={loading} className="login-btn-primary">
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>

          <button className="login-btn-google">
            Continuar con Google
          </button>

          <Link className="login-forgot" to="/register-select">Crear cuenta</Link>

          <a href="#" className="login-forgot">
            ¿Olvidaste tu contraseña?
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
