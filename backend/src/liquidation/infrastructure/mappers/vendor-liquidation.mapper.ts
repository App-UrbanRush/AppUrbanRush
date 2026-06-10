import { VendorLiquidationModel } from '../../domain/entities/vendor-liquidation.model';
import { VendorLiquidationDocument } from '../schemas/vendor-liquidation.schema';

export class VendorLiquidationMapper {
  static toDomain(doc: VendorLiquidationDocument): VendorLiquidationModel {
    return new VendorLiquidationModel(
      doc._id.toString(),
      doc.vendor_id,
      doc.order_id,
      doc.subtotal,
      doc.platform_commission,
      doc.vendor_net,
      doc.status,
      (doc as any).createdAt ?? null,
      doc.paid_at,
    );
  }
}
