import { VendorPhotoDocument } from '../schemas/vendor-photo.schema';
import { VendorPhotoModel } from '../../domain/entities/vendor-photo.model';

export class VendorPhotoMapper {
  static toDomain(doc: VendorPhotoDocument): VendorPhotoModel {
    return new VendorPhotoModel(
      doc._id?.toString() ?? null,
      doc.vendor_id,
      doc.image_url,
      doc.public_id,
      doc.order,
      doc.type,
      doc.createdAt,
    );
  }
}
