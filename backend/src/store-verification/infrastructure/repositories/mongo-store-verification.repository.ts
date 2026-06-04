import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreVerification, StoreVerificationDocument } from '../schemas/store-verification.schema';
import { IStoreVerificationRepository } from '../../domain/repositories/store-verification.repository.interface';
import { StoreVerificationModel } from '../../domain/entities/store-verification.model';
import { StoreVerificationMapper } from '../mappers/store-verification.mapper';

@Injectable()
export class MongoStoreVerificationRepository implements IStoreVerificationRepository {
  constructor(
    @InjectModel(StoreVerification.name)
    private readonly model: Model<StoreVerificationDocument>,
  ) {}

  async save(verification: StoreVerificationModel): Promise<StoreVerificationModel> {
    const created = new this.model({
      vendor_id: verification.vendor_id,
      business_name: verification.business_name,
      result: verification.result,
      confidence: verification.confidence,
      detected_text: verification.detected_text,
      is_real_sign: verification.is_real_sign,
      name_matches: verification.name_matches,
      reasons: verification.reasons,
      image_url: verification.image_url,
    });
    const saved = await created.save();
    return StoreVerificationMapper.toDomain(saved);
  }

  async findByVendorId(vendorId: number): Promise<StoreVerificationModel[]> {
    const docs = await this.model.find({ vendor_id: vendorId }).sort({ createdAt: -1 }).exec();
    return docs.map(StoreVerificationMapper.toDomain);
  }

  async findLatestByVendorId(vendorId: number): Promise<StoreVerificationModel | null> {
    const doc = await this.model.findOne({ vendor_id: vendorId }).sort({ createdAt: -1 }).exec();
    return doc ? StoreVerificationMapper.toDomain(doc) : null;
  }
}
