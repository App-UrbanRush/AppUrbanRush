import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IGPSRepository } from '../../domain/repositories/gps.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';

export interface VendorCourierLocation {
  courier_id: number;
  name: string;
  lat: number;
  lng: number;
  timestamp: string;
}

@Injectable()
export class GetVendorCourierLocationsUseCase {
  constructor(
    @Inject('IGPSRepository')
    private readonly gpsRepo: IGPSRepository,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
  ) {}

  async execute(vendorId: number): Promise<VendorCourierLocation[]> {
    const orders = await this.orderRepo.findByVendor(vendorId);

    const inDeliveryCourierIds = orders
      .filter(o => o.status === 'IN_DELIVERY' && o.courier_id !== null)
      .map(o => o.courier_id as number);

    const uniqueCourierIds = [...new Set(inDeliveryCourierIds)];
    if (!uniqueCourierIds.length) return [];

    const locations = await this.gpsRepo.getLocationsByCourierIds(uniqueCourierIds);

    const people = await this.peopleRepo.find({
      where: { user_id: In(uniqueCourierIds) },
    });
    const peopleMap = new Map(people.map(p => [p.user_id, p]));

    return locations.map(loc => {
      const person = peopleMap.get(loc.courier_id);
      return {
        courier_id: loc.courier_id,
        name: person ? `${person.firstName} ${person.firstLastName}` : 'Sin nombre',
        lat: loc.lat,
        lng: loc.lng,
        timestamp: loc.timestamp.toISOString(),
      };
    });
  }
}
