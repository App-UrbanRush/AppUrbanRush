import { useEffect, useRef, useState } from "react";
import "./CedulaUploader.css";

export interface CedulaUploaderProps {
  frontImage: File | null;
  backImage: File | null;
  onFrontChange: (file: File | null) => void;
  onBackChange: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * Subida de cédula en DOS PASOS:
 *   1. El usuario sube la cara FRONTAL (lado con foto y nombre)
 *   2. Recién entonces se habilita subir el REVERSO (lado con expedición / MRZ)
 *
 * Cada slot muestra preview en miniatura y permite "Cambiar" o "Quitar".
 */
const slotImage = (file: File | null): string | null => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

const CedulaUploader: React.FC<CedulaUploaderProps> = ({
  frontImage, backImage, onFrontChange, onBackChange, disabled = false,
}) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = slotImage(frontImage);
    setFrontUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [frontImage]);

  useEffect(() => {
    const url = slotImage(backImage);
    setBackUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [backImage]);

  const handlePick = (which: "front" | "back") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (which === "front") onFrontChange(file); else onBackChange(file);
    e.target.value = ""; // permitir re-elegir el mismo archivo
  };

  const renderSlot = (
    step: 1 | 2,
    label: string,
    description: string,
    file: File | null,
    url: string | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    onChange: (file: File | null) => void,
    locked: boolean,
  ) => {
    const isComplete = !!file;
    return (
      <div className={`cedula-slot ${isComplete ? "complete" : ""} ${locked ? "locked" : ""}`}>
        <div className="cedula-slot-head">
          <span className="cedula-slot-step">{step}</span>
          <div>
            <strong>{label}</strong>
            <p>{description}</p>
          </div>
          {isComplete && <span className="cedula-slot-check">✓</span>}
        </div>

        {isComplete ? (
          <div className="cedula-slot-preview">
            <img src={url ?? ""} alt={label} />
            <div className="cedula-slot-preview-info">
              <span className="cedula-slot-filename" title={file!.name}>{file!.name}</span>
              <div className="cedula-slot-actions">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={disabled}
                  className="cedula-slot-btn"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  disabled={disabled}
                  className="cedula-slot-btn cedula-slot-btn-danger"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="cedula-slot-upload"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || locked}
          >
            <span className="cedula-slot-upload-icon">📸</span>
            <span>
              {locked
                ? "Subí primero la cara frontal"
                : `Subir ${label.toLowerCase()}`}
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePick(step === 1 ? "front" : "back")}
        />
      </div>
    );
  };

  return (
    <div className="cedula-uploader">
      {renderSlot(
        1,
        "Cara frontal",
        "Lado con tu foto, nombre y número de cédula",
        frontImage,
        frontUrl,
        frontInputRef,
        onFrontChange,
        false,
      )}
      {renderSlot(
        2,
        "Cara trasera",
        "Reverso con el código MRZ / QR / fecha de expedición",
        backImage,
        backUrl,
        backInputRef,
        onBackChange,
        !frontImage, // bloqueado hasta que suban el frente
      )}
    </div>
  );
};

export default CedulaUploader;
