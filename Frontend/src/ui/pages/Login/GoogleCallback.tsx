import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./Login.css";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string>("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setError("No recibimos el token de Google.");
      return;
    }

    googleLogin(token)
      .then((response) => {
        const role = response.user?.role;
        if (role === "Negocio") navigate("/vendor/dashboard", { replace: true });
        else if (role === "Domiciliario") navigate("/courier/dashboard", { replace: true });
        else navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "No se pudo iniciar sesión con Google.");
      });
  }, [googleLogin, navigate, searchParams]);

  return (
    <div className="login-container">
      <div className="login-right" style={{ width: "100%" }}>
        <div className="login-card">
          {error ? (
            <>
              <h2>Ups…</h2>
              <p>{error}</p>
              <button className="login-btn-primary" onClick={() => navigate("/login", { replace: true })}>
                Volver a iniciar sesión
              </button>
            </>
          ) : (
            <>
              <h2>Iniciando sesión…</h2>
              <p>Validando tu cuenta de Google, un momento.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
