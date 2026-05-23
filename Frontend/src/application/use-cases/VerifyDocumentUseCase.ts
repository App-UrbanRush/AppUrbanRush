/**
 * APPLICATION LAYER - CASO DE USO
 * Encapsula la lógica de verificación de documentos
 * Depende de IVerificationRepository (interfaz, no implementación)
 */

import type { IVerificationRepository } from "../../domain/interfaces/IVerificationRepository";
import type { VerifyDocumentRequest, VerificationResult } from "../../domain/types/verification.types";

export class VerifyDocumentUseCase {
  private verificationRepository: IVerificationRepository;

  constructor(verificationRepository: IVerificationRepository) {
    this.verificationRepository = verificationRepository;
  }

  async execute(images: File[], data: VerifyDocumentRequest): Promise<VerificationResult> {
    return this.verificationRepository.verifyDocument(images, data);
  }
}
