/**
 * DOMAIN LAYER - Tipos de verificación
 * Tipos puros de negocio, independientes de tecnología
 */

export interface VerifyDocumentRequest {
  cedula: string;
  firstName: string;
  firstLastName: string;
  expeditionDate: string;
  expeditionPlace: string;
}

export interface VerificationResult {
  verified: boolean;
  status: string;
  confidence: number;
  extractedData: Record<string, unknown>;
  mismatches: string[];
  message: string;
}
