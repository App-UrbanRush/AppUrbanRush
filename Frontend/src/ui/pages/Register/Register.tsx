import "../Register/Register.css";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/AuthRepositoryImpl";
import { RegisterUseCase } from "../../../application/use-cases/RegisterUseCase";
import type { RegisterCredentials } from "../../../domain/types/auth.types";

const Register = () => {
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterCredentials>({
    user_email: "",
    user_password: "",
    firstName: "",
    firstLastName: "",
    cellphone: "",
    address: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const authRepository = new AuthRepositoryImpl();
      const registerUseCase = new RegisterUseCase(authRepository);

      const res = await registerUseCase.execute(form);

      saveToken(res.access_token);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Error en registro";

        console.error("Axios error:", message);
        alert(message);
      } else {
        console.error("Error desconocido:", error);
        alert("Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">

      {/* LEFT → FORM */}
      <div className="register-left">
        <motion.div
          className="register-card"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Crear cuenta</h2>

          <form onSubmit={handleSubmit}>

            <input
              name="user_email"
              placeholder="Correo"
              onChange={handleChange}
              required
            />

            <input
              name="user_password"
              type="password"
              placeholder="Contraseña"
              onChange={handleChange}
              required
            />

            <div className="register-row">
              <input
                name="firstName"
                placeholder="Nombre"
                onChange={handleChange}
              />
              <input
                name="firstLastName"
                placeholder="Apellido"
                onChange={handleChange}
              />
            </div>

            <input
              name="cellphone"
              placeholder="Celular"
              onChange={handleChange}
            />

            <input
              name="address"
              placeholder="Dirección"
              onChange={handleChange}
            />

            <input
              name="gender"
              placeholder="Género"
              onChange={handleChange}
            />

            <button disabled={loading}>
              {loading ? "Creando..." : "Registrarse"}
            </button>
          </form>

          <p className="login-link">
            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
          </p>
        </motion.div>
      </div>

      {/* RIGHT → IMAGE */}
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
