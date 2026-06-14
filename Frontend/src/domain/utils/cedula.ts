/**
 * Validación de cédula colombiana — espejo del validador del backend.
 * Acepta cédula amarilla (vieja, 6-8 dígitos) y digital (nueva, 10 dígitos).
 */

export interface CedulaValidationResult {
  valid: boolean;
  normalized: string;
  reason?: string;
}

export const normalizeCedula = (raw: string): string =>
  (raw ?? "").replace(/[.\s\-_]/g, "").trim();

export const validateCedula = (raw: string): CedulaValidationResult => {
  const normalized = normalizeCedula(raw);

  if (!normalized) return { valid: false, normalized, reason: "Requerido" };
  if (!/^\d+$/.test(normalized)) {
    return { valid: false, normalized, reason: "Solo se permiten números" };
  }
  if (normalized.length < 6 || normalized.length > 10) {
    return { valid: false, normalized, reason: "Debe tener entre 6 y 10 dígitos" };
  }
  if (normalized.startsWith("0")) {
    return { valid: false, normalized, reason: "No puede comenzar con 0" };
  }
  if (/^(\d)\1+$/.test(normalized)) {
    return { valid: false, normalized, reason: "Número inválido" };
  }
  return { valid: true, normalized };
};
