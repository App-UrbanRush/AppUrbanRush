import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderDocument } from '../../../order/infrastructure/schemas/order.schema';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';

export interface PendingOrderNotification {
  order_id: string;
  customer_name: string;
  total: number;
  delivery_address: string;
  created_at: Date | null;
}

@Injectable()
export class GetVendorPendingOrdersUseCase {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
  ) {}

  async execute(vendorId: number): Promise<PendingOrderNotification[]> {
    const orders = await this.orderModel
      .find({ vendor_id: vendorId, status: 'PENDING' })
      .sort({ createdAt: -1 })
      .exec();

    if (!orders.length) return [];

    const userIds = [...new Set(orders.map(o => o.user_id))];
    const people = await this.peopleRepo.find({ where: { user_id: In(userIds) } });
    const peopleMap = new Map(people.map(p => [p.user_id, p]));

    return orders.map(order => {
      const person = peopleMap.get(order.user_id);
      return {
        order_id: order._id.toString(),
        customer_name: person ? `${person.firstName} ${person.firstLastName}` : 'Cliente',
        total: order.total,
        delivery_address: order.delivery_address,
        created_at: (order as any).createdAt ?? null,
      };
    });
  }
}
