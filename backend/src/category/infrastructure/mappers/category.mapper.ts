import { CategoryModel } from '../../domain/entities/category.model';
import { CategoryDocument } from '../schemas/category.schema';

export class CategoryMapper {
  static toDomain(doc: CategoryDocument): CategoryModel {
    return new CategoryModel(
      doc._id.toString(),
      doc.vendor_id,
      doc.name,
      doc.image_url,
    );
  }
}
