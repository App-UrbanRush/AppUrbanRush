import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderModel } from '../../domain/entities/order.model';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class MongoOrderRepository implements IOrderRepository {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(order: OrderModel): Promise<OrderModel> {
    const created = new this.orderModel({
      user_id: order.user_id,
      vendor_id: order.vendor_id,
      courier_id: order.courier_id,
      status: order.status,
      delivery_address: order.delivery_address,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      platform_commission: order.platform_commission,
      total: order.total,
      items: order.items,
    });
    const saved = await created.save();
    return OrderMapper.toDomain(saved);
  }

  async findById(id: string): Promise<OrderModel | null> {
    const doc = await this.orderModel.findById(id).exec();
    return doc ? OrderMapper.toDomain(doc) : null;
  }

  async findByUser(userId: number): Promise<OrderModel[]> {
    const docs = await this.orderModel
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(OrderMapper.toDomain);
  }

  async findByVendor(vendorId: number): Promise<OrderModel[]> {
    const docs = await this.orderModel
      .find({ vendor_id: vendorId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(OrderMapper.toDomain);
  }

  async findByCourier(courierId: number): Promise<OrderModel[]> {
    const docs = await this.orderModel
      .find({ courier_id: courierId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(OrderMapper.toDomain);
  }

  async findAvailableForCourier(): Promise<OrderModel[]> {
    const docs = await this.orderModel
      .find({ status: 'READY' })
      .sort({ createdAt: 1 })
      .exec();
    return docs.map(OrderMapper.toDomain);
  }


async updateStatus(id: string, status: string, courierId?: number): Promise<OrderModel | null> {
    const update: any = { status };
    if (courierId) update.courier_id = courierId;
    const updated = await this.orderModel
      .findByIdAndUpdate(id, update, { returnDocument: 'after' }) 
      .exec();
    return updated ? OrderMapper.toDomain(updated) : null;
  }
}