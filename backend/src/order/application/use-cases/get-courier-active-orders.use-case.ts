import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderDocument } from '../../infrastructure/schemas/order.schema';
import { VendorEntity } from '../../../vendor/infrastructure/persistence/entities/vendor.entity';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';

@Injectable()
export class GetCourierActiveOrdersUseCase {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectRepository(VendorEntity)
    private readonly vendorRepo: Repository<VendorEntity>,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
  ) {}

  async execute(courierUserId: number) {
    const orders = await this.orderModel.find({
      courier_id: courierUserId,
      status: { $in: ['ACCEPTED', 'IN_DELIVERY', 'READY'] },
    }).sort({ created_at: -1 });

    const result = await Promise.all(
      orders.map(async (order) => {
        const vendor = await this.vendorRepo.findOne({ where: { vendor_id: order.vendor_id } });
        const vendorPerson = vendor ? await this.peopleRepo.findOne({ where: { user_id: vendor.user_id } }) : null;
        
        const customer = await this.peopleRepo.findOne({ where: { user_id: order.user_id } });

        return {
          order_id: order._id.toString(),
          vendor_name: vendorPerson ? `${vendorPerson.firstName} ${vendorPerson.firstLastName}` : 'Negocio',
          vendor_address: vendor?.address || 'Dirección del negocio',
          vendor_lat: vendor?.latitude || vendorPerson?.latitude || null,
          vendor_lng: vendor?.longitude || vendorPerson?.longitude || null,
          customer_name: customer ? `${customer.firstName} ${customer.firstLastName}` : 'Cliente',
          customer_phone: customer?.cellphone || null,
          delivery_address: order.delivery_address,
          customer_lat: order.customer_lat ?? customer?.latitude ?? null,
          customer_lng: order.customer_lng ?? customer?.longitude ?? null,
          status: order.status,
          total: order.total,
        };
      })
    );

    return result;
  }
}