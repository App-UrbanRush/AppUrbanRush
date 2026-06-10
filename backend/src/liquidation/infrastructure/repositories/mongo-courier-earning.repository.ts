import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourierEarning, CourierEarningDocument } from '../schemas/courier-earning.schema';
import { ICourierEarningRepository } from '../../domain/repositories/courier-earning.repository.interface';
import { CourierEarningModel } from '../../domain/entities/courier-earning.model';
import { CourierEarningMapper } from '../mappers/courier-earning.mapper';

@Injectable()
export class MongoCourierEarningRepository implements ICourierEarningRepository {
  constructor(
    @InjectModel(CourierEarning.name)
    private readonly model: Model<CourierEarningDocument>,
  ) {}

  async create(earning: CourierEarningModel): Promise<CourierEarningModel> {
    const created = new this.model({
      courier_id: earning.courier_id,
      order_id: earning.order_id,
      delivery_fee: earning.delivery_fee,
      status: earning.status,
    });
    const saved = await created.save();
    return CourierEarningMapper.toDomain(saved);
  }

  async findByCourierId(courierId: number): Promise<CourierEarningModel[]> {
    const docs = await this.model
      .find({ courier_id: courierId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(CourierEarningMapper.toDomain);
  }

  async findByOrderId(orderId: string): Promise<CourierEarningModel | null> {
    const doc = await this.model.findOne({ order_id: orderId }).exec();
    return doc ? CourierEarningMapper.toDomain(doc) : null;
  }

  async findAllPending(): Promise<CourierEarningModel[]> {
    const docs = await this.model.find({ status: 'PENDING' }).exec();
    return docs.map(CourierEarningMapper.toDomain);
  }

  async markAsPaid(ids: string[]): Promise<number> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'PAID', paid_at: new Date() } },
    ).exec();
    return result.modifiedCount;
  }
}
