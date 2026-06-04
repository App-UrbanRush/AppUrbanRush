import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { Order, OrderDocument } from 'src/order/infrastructure/schemas/order.schema';
import { Payment, PaymentDocument } from 'src/payment/infrastructure/schemas/payment.schema';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';
import { SystemStats } from '../../domain/interfaces/admin.interfaces';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(VendorEntity) private readonly vendorRepo: Repository<VendorEntity>,
    @InjectRepository(CourierEntity) private readonly courierRepo: Repository<CourierEntity>,
  ) {}

  async getSystemStats(): Promise<SystemStats> {
    const [totalUsers, totalVendors, totalCouriers] = await Promise.all([
      this.userRepo.count(),
      this.vendorRepo.count(),
      this.courierRepo.count(),
    ]);

    const orders = await this.orderModel.find().exec();
    const payments = await this.paymentModel.find().exec();

    const ordersByStatus: Record<string, number> = {};
    let totalRevenue = 0;
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
      if (o.status === 'DELIVERED') totalRevenue += o.total;
    }

    const paymentsByStatus: Record<string, number> = {};
    for (const p of payments) {
      paymentsByStatus[p.status] = (paymentsByStatus[p.status] ?? 0) + 1;
    }

    return {
      total_users: totalUsers,
      total_orders: orders.length,
      total_payments: payments.length,
      total_vendors: totalVendors,
      total_couriers: totalCouriers,
      total_revenue: totalRevenue,
      orders_by_status: ordersByStatus,
      payments_by_status: paymentsByStatus,
    };
  }
}
