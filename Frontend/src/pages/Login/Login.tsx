import "./Login.css";
import { login } from "../../services/authService";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

/* VALIDACIÓN */
const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /* HOOK FORM */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  /* ✅ ESTA ES LA FUNCIÓN QUE FALTABA */
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const response = await login(data);

      saveToken(response.access_token);

      navigate("/dashboard");
    } catch (error) {
  console.error(error);
  alert("Credenciales incorrectas");
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      
      {/* LEFT */}
      <div className="login-left">
        <img src="/delivery1.png" alt="delivery" />
        <div className="overlay">
          <h1>UrbanRush</h1>
          <p>Entrega rápida en la ciudad 🚀</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>¡Hola de nuevo!</h2>
          <p>Inicia sesión para continuar</p>

          {/* ✅ SOLO UN FORM */}
          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="input-group">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                {...register("email")}
                type="email"
                placeholder="Email"
              />
              {errors.email && <span>{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                {...register("password")}
                type="password"
                placeholder="Contraseña"
              />
              {errors.password && <span>{errors.password.message}</span>}
            </div>

            <button disabled={loading} className="btn-primary">
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>

          <button className="btn-google">
            Continuar con Google
          </button>

          <a href="#" className="forgot">
            ¿Olvidaste tu contraseña?
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;