import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../../infrastructure/schemas/order.schema';
import { VendorRecentOrderDTO } from '../dtos/vendor-recent-order.dto';

@Injectable()
export class GetVendorRecentOrdersUseCase {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async execute(vendorId: number): Promise<VendorRecentOrderDTO[]> {
    const validStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'];

    const orders = await this.orderModel.aggregate([
      {
        $match: {
          vendor_id: vendorId,
          status: { $in: validStatuses },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 4,
      },
      {
        $lookup: {
          from: 'people',
          localField: 'user_id',
          foreignField: 'userId',
          as: 'customer',
        },
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'couriers',
          localField: 'courier_id',
          foreignField: 'user_id',
          as: 'courier',
        },
      },
      {
        $unwind: {
          path: '$courier',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'people',
          localField: 'courier.user_id',
          foreignField: 'userId',
          as: 'courierPeople',
        },
      },
      {
        $unwind: {
          path: '$courierPeople',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          order_id: '$_id',
          customer_name: {
            $cond: [
              { $ifNull: ['$customer', false] },
              { $concat: ['$customer.firstName', ' ', '$customer.firstLastName'] },
              'Cliente',
            ],
          },
          status: 1,
          courier_name: {
            $cond: [
              { $ifNull: ['$courierPeople', false] },
              { $concat: ['$courierPeople.firstName', ' ', '$courierPeople.firstLastName'] },
              'Sin asignar',
            ],
          },
          total: 1,
          items: 1,
          delivery_address: 1,
          createdAt: 1,
        },
      },
    ]);

    return orders.map((order: any) => {
      const timeElapsed = this.calculateTimeElapsed(order.createdAt);

      return {
        order_id: order.order_id.toString(),
        customer_name: order.customer_name,
        status: order.status as 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY',
        courier_name: order.courier_name,
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