import { useEffect } from "react";
import { X } from "lucide-react";
import "./ErrorAlert.css";

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const ErrorAlert = ({ message, onClose, duration = 2500 }: ErrorAlertProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="error-overlay" onClick={onClose}>
      <div className="error-card" onClick={(e) => e.stopPropagation()}>
        <div className="error-icon">
          <X size={40} strokeWidth={3} />
        </div>
        <p className="error-text">{message}</p>
      </div>
    </div>
  );
};

export default ErrorAlert;
