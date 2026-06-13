import { OrderModel, OrderItemModel } from '../../domain/entities/order.model';
import { OrderDocument } from '../schemas/order.schema';

export class OrderMapper {
  static toDomain(doc: OrderDocument): OrderModel {
    const items = (doc.items ?? []).map(
      (i) => new OrderItemModel(i.product_id, i.product_name, i.quantity, i.unit_price, i.image_url ?? null),
    );
    return new OrderModel(
      doc._id.toString(),
      doc.user_id,
      doc.vendor_id,
      doc.courier_id,
      doc.status,
      doc.delivery_address,
      doc.subtotal ?? doc.total,
      doc.delivery_fee ?? 0,
      doc.platform_commission ?? 0,
      doc.total,
      items,
      (doc as any).createdAt ?? null,
      doc.delivery_code ?? null,
      doc.delivery_attempts ?? 0,
      doc.delivery_blocked ?? false,
      doc.customer_lat ?? null,
      doc.customer_lng ?? null,
    );
  }
}
