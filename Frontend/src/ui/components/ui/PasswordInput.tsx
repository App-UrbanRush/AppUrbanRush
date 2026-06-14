import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Input de contraseña con botón de ojo (mostrar/ocultar) anclado a la derecha.
 * Compatible con react-hook-form (spread de register vía forwardRef) e inputs controlados.
 */
const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput({ style, ...props }, ref) {
    const [show, setShow] = useState(false);
    return (
      <div style={{ position: "relative", width: "100%", display: "block" }}>
        <input
          {...props}
          ref={ref}
          type={show ? "text" : "password"}
          style={{ ...style, paddingRight: 40 }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#999",
            padding: 0,
            margin: 0,
            zIndex: 2,
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);

export default PasswordInput;
