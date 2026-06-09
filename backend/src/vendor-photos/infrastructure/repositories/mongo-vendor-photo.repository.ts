import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VendorPhoto, VendorPhotoDocument } from '../schemas/vendor-photo.schema';
import { IVendorPhotoRepository } from '../../domain/repositories/vendor-photo.repository';
import { VendorPhotoModel } from '../../domain/entities/vendor-photo.model';
import { VendorPhotoMapper } from '../mappers/vendor-photo.mapper';

@Injectable()
export class MongoVendorPhotoRepository implements IVendorPhotoRepository {
  constructor(
    @InjectModel(VendorPhoto.name)
    private readonly photoModel: Model<VendorPhotoDocument>,
  ) {}

  async create(vendorId: number, imageUrl: string, publicId: string, type = 'storefront'): Promise<VendorPhotoModel> {
    const count = await this.photoModel.countDocuments({ vendor_id: vendorId });
    const created = new this.photoModel({
      vendor_id: vendorId,
      image_url: imageUrl,
      public_id: publicId,
      order: count,
      type,
    });
    const saved = await created.save();
    return VendorPhotoMapper.toDomain(saved);
  }

  async findByVendor(vendorId: number): Promise<VendorPhotoModel[]> {
    const docs = await this.photoModel.find({ vendor_id: vendorId }).sort({ order: 1 }).exec();
    return docs.map(VendorPhotoMapper.toDomain);
  }

  async findById(id: string): Promise<VendorPhotoModel | null> {
    const doc = await this.photoModel.findById(id).exec();
    return doc ? VendorPhotoMapper.toDomain(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.photoModel.findByIdAndDelete(id).exec();
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await this.photoModel.findOneAndDelete({ public_id: publicId }).exec();
  }

  async updateOrder(id: string, order: number): Promise<void> {
    await this.photoModel.findByIdAndUpdate(id, { order }).exec();
  }
}
