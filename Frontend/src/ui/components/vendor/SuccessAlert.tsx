import { useEffect } from "react";
import { Check } from "lucide-react";
import "./SuccessAlert.css";

interface SuccessAlertProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const SuccessAlert = ({ message, onClose, duration = 2000 }: SuccessAlertProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="success-overlay">
      <div className="success-card">
        <div className="success-icon">
          <Check size={40} strokeWidth={3} />
        </div>
        <p className="success-text">{message}</p>
      </div>
    </div>
  );
};

export default SuccessAlert;
