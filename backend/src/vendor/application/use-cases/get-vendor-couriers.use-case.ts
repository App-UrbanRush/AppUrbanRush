import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderDocument } from '../../../order/infrastructure/schemas/order.schema';
import { CourierEntity } from '../../../courier/infrastructure/persistence/entities/courier.entity';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';
import { CourierVendorRequestEntity } from '../../../courier-vendor-request/infrastructure/persistence/entities/courier-vendor-request.entity';
import { VendorCourierDTO } from '../dts/vendor-courier.dto';

@Injectable()
export class GetVendorCouriersUseCase {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
    @InjectRepository(CourierVendorRequestEntity)
    private readonly requestRepo: Repository<CourierVendorRequestEntity>,
  ) {}

  async execute(vendorId: number): Promise<VendorCourierDTO[]> {
    // 1. Get courier IDs from orders
    const orderCourierIds = await this.orderModel.distinct('courier_id', {
      vendor_id: vendorId,
      courier_id: { $ne: null },
    });

    // 2. Get courier user IDs from accepted requests
    const acceptedRequests = await this.requestRepo.find({
      where: { vendor_id: vendorId, status: 'accepted' },
    });
    const requestCourierIds = acceptedRequests.map(r => r.courier_user_id);

    // 3. Combine and deduplicate
    const allCourierIds = [...new Set([...orderCourierIds, ...requestCourierIds])];

    if (!allCourierIds.length) return [];

    const couriers = await this.courierRepo.find({
      where: { user_id: In(allCourierIds) },
    });

    const people = await this.peopleRepo.find({
      where: { user_id: In(allCourierIds) },
    });

    const peopleMap = new Map(people.map(p => [p.user_id, p]));

    return couriers.map(c => {
      const person = peopleMap.get(c.user_id);
      return {
        courier_id: c.user_id,
        name: person ? `${person.firstName} ${person.firstLastName}` : 'Sin nombre',
        photo_url: c.photo_url,
        status: c.status,
        vehicle_type: c.vehicle_type,
      };
    });
  }
}
