import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderDocument } from '../../../order/infrastructure/schemas/order.schema';
import { CourierEntity } from '../../../courier/infrastructure/persistence/entities/courier.entity';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';
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
  ) {}

  async execute(vendorId: number): Promise<VendorCourierDTO[]> {
    const courierIds = await this.orderModel.distinct('courier_id', {
      vendor_id: vendorId,
      courier_id: { $ne: null },
    });

    if (!courierIds.length) return [];

    const couriers = await this.courierRepo.find({
      where: { user_id: In(courierIds) },
    });

    const people = await this.peopleRepo.find({
      where: { user_id: In(courierIds) },
    });

    const peopleMap = new Map(people.map(p => [p.user_id, p]));

    return couriers.map(c => {
      const person = peopleMap.get(c.user_id);
      return {
        courier_id: c.user_id,
        name: person ? `${person.firstName} ${person.firstLastName}` : 'Sin nombre',
        status: c.status,
      };
    });
  }
}
