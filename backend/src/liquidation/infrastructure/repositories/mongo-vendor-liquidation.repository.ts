import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VendorLiquidation, VendorLiquidationDocument } from '../schemas/vendor-liquidation.schema';
import { IVendorLiquidationRepository } from '../../domain/repositories/vendor-liquidation.repository.interface';
import { VendorLiquidationModel } from '../../domain/entities/vendor-liquidation.model';
import { VendorLiquidationMapper } from '../mappers/vendor-liquidation.mapper';

@Injectable()
export class MongoVendorLiquidationRepository implements IVendorLiquidationRepository {
  constructor(
    @InjectModel(VendorLiquidation.name)
    private readonly model: Model<VendorLiquidationDocument>,
  ) {}

  async create(liq: VendorLiquidationModel): Promise<VendorLiquidationModel> {
    const created = new this.model({
      vendor_id: liq.vendor_id,
      order_id: liq.order_id,
      subtotal: liq.subtotal,
      platform_commission: liq.platform_commission,
      vendor_net: liq.vendor_net,
      status: liq.status,
    });
    const saved = await created.save();
    return VendorLiquidationMapper.toDomain(saved);
  }

  async findByVendorId(vendorId: number): Promise<VendorLiquidationModel[]> {
    const docs = await this.model
      .find({ vendor_id: vendorId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(VendorLiquidationMapper.toDomain);
  }

  async findByOrderId(orderId: string): Promise<VendorLiquidationModel | null> {
    const doc = await this.model.findOne({ order_id: orderId }).exec();
    return doc ? VendorLiquidationMapper.toDomain(doc) : null;
  }

  async findAllPending(): Promise<VendorLiquidationModel[]> {
    const docs = await this.model.find({ status: 'PENDING' }).exec();
    return docs.map(VendorLiquidationMapper.toDomain);
  }

  async markAsPaid(ids: string[]): Promise<number> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'PAID', paid_at: new Date() } },
    ).exec();
    return result.modifiedCount;
  }
}
