import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { Order, OrderDocument } from 'src/order/infrastructure/schemas/order.schema';
import { Payment, PaymentDocument } from 'src/payment/infrastructure/schemas/payment.schema';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';
import { IReportsRepository } from '../../domain/repositories/reports.repository.interface';
import {
  OrderReportRow,
  PaymentReportRow,
  UserReportRow,
  VendorReportRow,
  CourierReportRow,
  ReportFilters,
} from '../../domain/interfaces/report-data.interface';

@Injectable()
export class MongoPgReportsRepository implements IReportsRepository {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(PeopleEntity) private readonly peopleRepo: Repository<PeopleEntity>,
    @InjectRepository(VendorEntity) private readonly vendorRepo: Repository<VendorEntity>,
    @InjectRepository(UserRolesEntity) private readonly userRolesRepo: Repository<UserRolesEntity>,
    @InjectRepository(CourierEntity) private readonly courierRepo: Repository<CourierEntity>,
  ) {}

  // Mapa user_id -> nombre completo (desde people)
  private async buildCustomerNameMap(): Promise<Map<number, string>> {
    const people = await this.peopleRepo.find();
    const map = new Map<number, string>();
    for (const p of people) {
      if (p.user_id != null) {
        map.set(p.user_id, `${p.firstName ?? ''} ${p.firstLastName ?? ''}`.trim());
      }
    }
    return map;
  }

  // Mapa vendor_id -> nombre del negocio
  private async buildVendorNameMap(): Promise<Map<number, string>> {
    const vendors = await this.vendorRepo.find();
    const map = new Map<number, string>();
    for (const v of vendors) map.set(v.vendor_id, v.business_name);
    return map;
  }

  async getOrders(filters: ReportFilters): Promise<OrderReportRow[]> {
    const query: any = {};

    if (filters.from || filters.to) {
      query.createdAt = {};
      if (filters.from) query.createdAt.$gte = new Date(filters.from);
      if (filters.to) query.createdAt.$lte = new Date(filters.to + 'T23:59:59.999Z');
    }
    if (filters.status) query.status = filters.status;
    if (filters.vendor_id) query.vendor_id = filters.vendor_id;
    if (filters.courier_id) query.courier_id = filters.courier_id;

    const docs = await this.orderModel.find(query).sort({ createdAt: -1 }).exec();

    const [customers, vendors] = await Promise.all([
      this.buildCustomerNameMap(),
      this.buildVendorNameMap(),
    ]);

    return docs.map((doc) => ({
      order_id: doc._id.toString(),
      user_id: doc.user_id,
      customer_name: customers.get(doc.user_id) || `Usuario ${doc.user_id}`,
      vendor_id: doc.vendor_id,
      vendor_name: vendors.get(doc.vendor_id) || `Vendor ${doc.vendor_id}`,
      courier_id: doc.courier_id,
      status: doc.status,
      delivery_address: doc.delivery_address,
      total: doc.total,
      items_count: doc.items?.length ?? 0,
      created_at: (doc as any).createdAt,
    }));
  }

  async getPayments(filters: ReportFilters): Promise<PaymentReportRow[]> {
    const query: any = {};

    if (filters.from || filters.to) {
      query.createdAt = {};
      if (filters.from) query.createdAt.$gte = new Date(filters.from);
      if (filters.to) query.createdAt.$lte = new Date(filters.to + 'T23:59:59.999Z');
    }
    if (filters.status) query.status = filters.status;
    if (filters.vendor_id) query.vendor_id = filters.vendor_id;

    const docs = await this.paymentModel.find(query).sort({ createdAt: -1 }).exec();

    const [customers, vendors] = await Promise.all([
      this.buildCustomerNameMap(),
      this.buildVendorNameMap(),
    ]);

    return docs.map((doc) => ({
      payment_id: doc._id.toString(),
      order_id: doc.order_id,
      user_id: doc.user_id,
      customer_name: customers.get(doc.user_id) || `Usuario ${doc.user_id}`,
      vendor_id: doc.vendor_id,
      vendor_name: vendors.get(doc.vendor_id) || `Vendor ${doc.vendor_id}`,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
      payment_method: doc.payment_method,
      reference: doc.reference,
      customer_email: doc.customer_email,
      created_at: (doc as any).createdAt,
    }));
  }

  async getUsers(): Promise<UserReportRow[]> {
    const users = await this.userRepo.find({ relations: ['userroles'] });

    const result: UserReportRow[] = [];
    for (const user of users) {
      const person = await this.peopleRepo.findOne({ where: { user_id: user.user_id } });
      const roleNames = (user.userroles ?? []).map((ur) => `Rol-${ur.rol_id}`).join(', ');

      result.push({
        user_id: user.user_id,
        user_email: user.user_email,
        firstName: person?.firstName ?? '',
        firstLastName: person?.firstLastName ?? '',
        cellphone: person?.cellphone ?? '',
        verification_status: user.verification_status ?? 'pending',
        roles: roleNames,
      });
    }
    return result;
  }

  async getVendorReport(vendorId: number): Promise<VendorReportRow | null> {
    const vendor = await this.vendorRepo.findOne({
      where: { vendor_id: vendorId },
      relations: ['user'],
    });
    if (!vendor) return null;

    const orders = await this.orderModel.find({ vendor_id: vendorId }).exec();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    return {
      vendor_id: vendor.vendor_id,
      business_name: vendor.business_name,
      business_type: vendor.business_type,
      address: vendor.address,
      phone: vendor.phone,
      status: vendor.status,
      user_email: vendor.user?.user_email ?? '',
      total_orders: totalOrders,
      total_revenue: totalRevenue,
    };
  }

  async getCouriers(): Promise<CourierReportRow[]> {
    const couriers = await this.courierRepo.find();
    const customers = await this.buildCustomerNameMap();

    const result: CourierReportRow[] = [];
    for (const c of couriers) {
      const completed = await this.orderModel.countDocuments({
        courier_id: c.couriers_id,
        status: 'DELIVERED',
      }).exec();

      result.push({
        couriers_id: c.couriers_id,
        name: customers.get(c.user_id) || `Usuario ${c.user_id}`,
        vehicle_plate: c.vehicle_plate ?? 'N/A',
        vehicle_type: c.vehicle_type,
        completed_orders: completed,
        status: c.status,
      });
    }
    return result;
  }
}
