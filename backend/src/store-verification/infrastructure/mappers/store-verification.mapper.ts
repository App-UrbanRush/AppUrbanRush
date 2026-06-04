import { StoreVerificationModel, VerificationResult } from '../../domain/entities/store-verification.model';
import { StoreVerificationDocument } from '../schemas/store-verification.schema';

export class StoreVerificationMapper {
  static toDomain(doc: StoreVerificationDocument): StoreVerificationModel {
    return new StoreVerificationModel(
      doc._id.toString(),
      doc.vendor_id,
      doc.business_name,
      doc.result as VerificationResult,
      doc.confidence,
      doc.detected_text,
      doc.is_real_sign,
      doc.name_matches,
      doc.reasons,
      doc.image_url,
      (doc as any).createdAt ?? null,
    );
  }
}
