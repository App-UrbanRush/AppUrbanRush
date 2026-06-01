import { ProductModel } from '../../domain/entities/product.model';
import { ProductDocument } from '../schemas/product.schema';

export class ProductMapper {
  static toDomain(doc: ProductDocument): ProductModel {
    return new ProductModel(
      doc._id.toString(),
      doc.vendor_id,
      doc.name,
      doc.description,
      doc.price,
      doc.image_url,
      doc.category,
      doc.is_available,
      doc.stock,
    );
  }
}