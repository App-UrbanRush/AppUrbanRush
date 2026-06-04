import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IStoreVerificationRepository } from '../../domain/repositories/store-verification.repository.interface';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';
import { StorefrontAIService } from '../../infrastructure/services/storefront-ai.service';
import { EmailService } from 'src/email/email.service';
import { StoreVerificationModel, VerificationResult } from '../../domain/entities/store-verification.model';

@Injectable()
export class VerifyStorefrontUseCase {
  constructor(
    @Inject('IStoreVerificationRepository')
    private readonly verificationRepo: IStoreVerificationRepository,
    @Inject('IVendorRepository')
    private readonly vendorRepo: IVendorRepository,
    private readonly aiService: StorefrontAIService,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    vendorUserId: number,
    image: Express.Multer.File,
    userEmail: string,
  ): Promise<StoreVerificationModel> {
    // 1. Buscar vendor
    const vendor = await this.vendorRepo.findByUserId(vendorUserId);
    if (!vendor) throw new NotFoundException('Vendor no encontrado');
    if (!vendor.vendor_id) throw new BadRequestException('Vendor sin ID');

    // 2. Analizar imagen con IA
    const aiResult = await this.aiService.analyzeStorefront(
      image.buffer,
      image.mimetype,
      vendor.business_name,
    );

    // 3. Determinar resultado
    let result: VerificationResult;
    if (aiResult.is_real_sign && aiResult.name_matches && aiResult.confidence >= 70) {
      result = VerificationResult.APPROVED;
    } else if (aiResult.confidence >= 40 && aiResult.confidence < 70) {
      result = VerificationResult.NEEDS_REVIEW;
    } else {
      result = VerificationResult.REJECTED;
    }

    // 4. Guardar resultado en MongoDB
    const verification = new StoreVerificationModel(
      null,
      vendor.vendor_id,
      vendor.business_name,
      result,
      aiResult.confidence,
      aiResult.detected_text,
      aiResult.is_real_sign,
      aiResult.name_matches,
      aiResult.reasons,
      null,
      null,
    );
    const saved = await this.verificationRepo.save(verification);

    // 5. Actualizar estado del vendor
    if (result === VerificationResult.APPROVED) {
      await this.vendorRepo.updateStatus(vendor.vendor_id, 'VERIFIED');
    } else if (result === VerificationResult.REJECTED) {
      await this.vendorRepo.updateStatus(vendor.vendor_id, 'REJECTED');
    }
    // NEEDS_REVIEW mantiene el status actual

    // 6. Notificar por email (no bloquea el flujo)
    this.notifyVendor(userEmail, vendor.business_name, result, aiResult.reasons).catch(() => {});

    return saved;
  }

  private async notifyVendor(
    email: string,
    businessName: string,
    result: VerificationResult,
    reasons: string[],
  ) {
    const subjects: Record<string, string> = {
      APPROVED: `✅ ${businessName} — Verificación aprobada`,
      REJECTED: `❌ ${businessName} — Verificación rechazada`,
      NEEDS_REVIEW: `⏳ ${businessName} — Verificación en revisión`,
    };

    // Usamos sendWelcomeEmail como fallback simple (envía email genérico)
    // En producción se crearía un template específico
    await this.emailService.sendWelcomeEmail(email, `${businessName} - Resultado: ${result}. ${reasons.join('. ')}`);
  }
}
