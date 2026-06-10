import { CourierEarningModel } from '../../domain/entities/courier-earning.model';
import { CourierEarningDocument } from '../schemas/courier-earning.schema';

export class CourierEarningMapper {
  static toDomain(doc: CourierEarningDocument): CourierEarningModel {
    return new CourierEarningModel(
      doc._id.toString(),
      doc.courier_id,
      doc.order_id,
      doc.delivery_fee,
      doc.status,
      (doc as any).createdAt ?? null,
      doc.paid_at,
    );
  }
}
