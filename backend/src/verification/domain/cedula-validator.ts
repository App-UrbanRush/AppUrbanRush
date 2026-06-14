/**
 * Validador de cédula colombiana — acepta cédula amarilla (vieja) y
 * cédula digital (nueva, 2020+).
 *
 * Ambas usan el mismo NUIP (Número Único de Identificación Personal),
 * lo único que cambia es el plástico. El número tiene entre 6 y 10
 * dígitos sin letras (las cédulas antiguas tenían 6-8, las nuevas
 * suelen tener 10).
 *
 * Reglas:
 *   - Solo dígitos (se aceptan puntos/espacios/guiones, se normalizan)
 *   - 6 a 10 dígitos después de normalizar
 *   - No puede empezar por 0
 *   - No puede ser una secuencia trivial (11111111, 12345678...)
 */

export interface CedulaValidationResult {
  valid: boolean;
  normalized: string;
  reason?: string;
}

const TRIVIAL_PATTERNS = [
  /^(\d)\1+$/,         // todos iguales: 1111111, 99999999
  /^0+$/,
];

export function normalizeCedula(raw: string): string {
  return (raw ?? '').replace(/[.\s\-_]/g, '').trim();
}

export function validateCedula(raw: string): CedulaValidationResult {
  const normalized = normalizeCedula(raw);

  if (!normalized) {
    return { valid: false, normalized, reason: 'El número de cédula es requerido' };
  }
  if (!/^\d+$/.test(normalized)) {
    return { valid: false, normalized, reason: 'La cédula solo puede contener números' };
  }
  if (normalized.length < 6 || normalized.length > 10) {
    return {
      valid: false,
      normalized,
      reason: 'La cédula debe tener entre 6 y 10 dígitos',
    };
  }
  if (normalized.startsWith('0')) {
    return { valid: false, normalized, reason: 'La cédula no puede comenzar con 0' };
  }
  if (TRIVIAL_PATTERNS.some((re) => re.test(normalized))) {
    return { valid: false, normalized, reason: 'El número de cédula no es válido' };
  }

  return { valid: true, normalized };
}

/**
 * Compara dos números de cédula tolerando puntos/espacios/guiones.
 */
export function cedulasMatch(a: string, b: string): boolean {
  return normalizeCedula(a) === normalizeCedula(b) && !!normalizeCedula(a);
}
