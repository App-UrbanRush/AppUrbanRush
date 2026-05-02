import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./RegisterSelect.css";

const RegisterSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="rselect-container">

      {/* LEFT → IMAGEN */}
      <div className="rselect-left">
        <img src="/delivery2.png" alt="delivery" />
        <div className="rselect-overlay">
          <img src="/Logo-png.png" alt="UrbanRush Logo" className="rselect-logo-img" />
        </div>
      </div>

      {/* RIGHT → SELECCIÓN */}
      <div className="rselect-right">
        <motion.div
          className="rselect-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Crear cuenta</h2>
          <p>¿Cómo quieres registrarte?</p>

          <div className="rselect-options">

            {/* OPCIÓN USUARIO NORMAL */}
            <motion.div
              className="rselect-option rselect-option--user"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/register")}
            >
              <div className="rselect-icon">🧑</div>
              <div className="rselect-info">
                <h3>Usuario</h3>
                <p>Haz pedidos y recibe domicilios en tu puerta</p>
              </div>
              <span className="rselect-arrow">→</span>
            </motion.div>

            {/* OPCIÓN DOMICILIARIO */}
            <motion.div
              className="rselect-option rselect-option--delivery"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/register-delivery")}
            >
              <div className="rselect-icon">🛵</div>
              <div className="rselect-info">
                <h3>Domiciliario</h3>
                <p>Únete al equipo de reparto y genera ingresos</p>
              </div>
              <span className="rselect-arrow">→</span>
            </motion.div>

          </div>

          <p className="rselect-login-link">
            ¿Ya tienes cuenta?{" "}
            <span onClick={() => navigate("/")}>Inicia sesión</span>
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default RegisterSelect;