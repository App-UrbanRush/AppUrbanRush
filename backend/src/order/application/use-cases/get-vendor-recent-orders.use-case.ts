import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderDocument } from '../../infrastructure/schemas/order.schema';
import { VendorRecentOrderDTO } from '../dtos/vendor-recent-order.dto';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';
import { CourierEntity } from '../../../courier/infrastructure/persistence/entities/courier.entity';

@Injectable()
export class GetVendorRecentOrdersUseCase {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
  ) {}

  async execute(vendorId: number): Promise<VendorRecentOrderDTO[]> {
    const validStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'IN_DELIVERY'];

    // 1. Get orders from MongoDB
    const orders = await this.orderModel.find({
      vendor_id: vendorId,
      status: { $in: validStatuses },
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    if (!orders.length) return [];

    // 2. Get unique customer and courier IDs
    const customerIds = [...new Set(orders.map(o => o.user_id).filter(id => id != null))];
    const courierIds = [...new Set(orders.map(o => o.courier_id).filter(id => id != null))];

    // 3. Get people data from PostgreSQL
    const people = await this.peopleRepo.find({
      where: { user_id: In([...customerIds, ...courierIds]) },
    });

    const peopleMap = new Map(people.map(p => [p.user_id, p]));

    // 4. Get courier data from PostgreSQL
    const couriers = courierIds.length > 0 ? await this.courierRepo.find({
      where: { user_id: In(courierIds) },
    }) : [];

    const courierMap = new Map(couriers.map(c => [c.user_id, c]));

    // 5. Combine data
    return orders.map((order: any) => {
      const customer = peopleMap.get(Number(order.user_id));
      const courier = courierMap.get(Number(order.courier_id));
      const courierPerson = courier ? peopleMap.get(Number(courier.user_id)) : null;

      const timeElapsed = this.calculateTimeElapsed(order.createdAt);

      return {
        order_id: order._id.toString(),
        customer_name: customer ? `${customer.firstName} ${customer.firstLastName}` : 'Cliente',
        status: order.status as 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY',
        courier_name: courierPerson ? `${courierPerson.firstName} ${courierPerson.firstLastName}` : 'Sin asignar',
        courier_id: order.courier_id || null,
        total: order.total,
        time_elapsed: timeElapsed,
        items: order.items || [],
        delivery_address: order.delivery_address,
      };
    });
  }

  private calculateTimeElapsed(createdAt: Date): string {
    if (!createdAt) return 'Desconocido';

    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Hace un momento';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
  }
}