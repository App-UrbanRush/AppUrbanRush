import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductModel } from '../../domain/entities/product.model';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class MongoProductRepository implements IProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(product: ProductModel): Promise<ProductModel> {
    const created = new this.productModel({
      vendor_id: product.vendor_id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      is_available: product.is_available,
      stock: product.stock,
    });
    const saved = await created.save();
    return ProductMapper.toDomain(saved);
  }

  async findById(id: string): Promise<ProductModel | null> {
    const doc = await this.productModel.findById(id).exec();
    return doc ? ProductMapper.toDomain(doc) : null;
  }

  async findByVendor(vendorId: number): Promise<ProductModel[]> {
    const docs = await this.productModel.find({ vendor_id: vendorId }).exec();
    return docs.map(ProductMapper.toDomain);
  }

  async findAll(): Promise<ProductModel[]> {
    const docs = await this.productModel.find({ is_available: true }).exec();
    return docs.map(ProductMapper.toDomain);
  }


async update(id: string, product: Partial<ProductModel>): Promise<ProductModel | null> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, product, { returnDocument: 'after' }) 
      .exec();
    return updated ? ProductMapper.toDomain(updated) : null;
  }

  async delete(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec();
  }
}