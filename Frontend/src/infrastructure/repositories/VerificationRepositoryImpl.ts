/**
 * INFRASTRUCTURE LAYER - IMPLEMENTACIÓN DE REPOSITORIO
 * Implementa IVerificationRepository
 * Aquí está el detalle de cómo se hace la verificación (axios, etc)
 */

import type { IVerificationRepository } from "../../domain/interfaces/IVerificationRepository";
import type { VerifyDocumentRequest, VerificationResult } from "../../domain/types/verification.types";
import { verifyDocumentApi } from "../api/verificationApi";

export class VerificationRepositoryImpl implements IVerificationRepository {
  async verifyDocument(images: File[], data: VerifyDocumentRequest): Promise<VerificationResult> {
    try {
      const result = await verifyDocumentApi(images, data);
      return result;
    } catch (error) {
      throw new Error("Error en verificación de documento: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }
}
