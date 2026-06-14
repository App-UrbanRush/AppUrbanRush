import type { ReactNode } from "react";
import "./FormField.css";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

const FormField = ({ label, error, children, className = "" }: FormFieldProps) => (
  <div className={`field-container ${className}`}>
    <span className="field-label">{label}</span>
    {children}
    <span className={`field-error ${!error ? "field-error--empty" : ""}`}>
      {error || "\u00A0"}
    </span>
  </div>
);

export default FormField;
