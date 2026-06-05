import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { CategoryModel } from '../../domain/entities/category.model';
import { CategoryMapper } from '../mappers/category.mapper';

@Injectable()
export class MongoCategoryRepository implements ICategoryRepository {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(category: CategoryModel): Promise<CategoryModel> {
    const created = new this.categoryModel({
      vendor_id: category.vendor_id,
      name: category.name,
      image_url: category.image_url,
    });
    const saved = await created.save();
    return CategoryMapper.toDomain(saved);
  }

  async findById(id: string): Promise<CategoryModel | null> {
    const doc = await this.categoryModel.findById(id).exec();
    return doc ? CategoryMapper.toDomain(doc) : null;
  }

  async findByVendor(vendorId: number): Promise<CategoryModel[]> {
    const docs = await this.categoryModel.find({ vendor_id: vendorId }).exec();
    return docs.map(CategoryMapper.toDomain);
  }

  async findByNameAndVendor(name: string, vendorId: number): Promise<CategoryModel | null> {
    const doc = await this.categoryModel
      .findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, vendor_id: vendorId })
      .exec();
    return doc ? CategoryMapper.toDomain(doc) : null;
  }

  async update(id: string, data: Partial<CategoryModel>): Promise<CategoryModel | null> {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .exec();
    return updated ? CategoryMapper.toDomain(updated) : null;
  }

  async delete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
  }
}
