/**
 * DOMAIN LAYER - INTERFAZ DE REPOSITORIO
 * Define el contrato para la verificación de documentos
 * La implementación concreta está en infrastructure/repositories
 */

import type { VerifyDocumentRequest, VerificationResult } from "../types/verification.types";

export interface IVerificationRepository {
  verifyDocument(image: File, data: VerifyDocumentRequest): Promise<VerificationResult>;
}
