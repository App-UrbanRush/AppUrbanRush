import { Inject, Injectable } from '@nestjs/common';
import { ICourierVendorRequestRepository } from '../../domain/repositories/courier-vendor-request.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';

@Injectable()
export class GetVendorCourierRequestsUseCase {
  constructor(
    @Inject('ICourierVendorRequestRepository')
    private readonly requestRepo: ICourierVendorRequestRepository,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
  ) {}

  async execute(vendorId: number) {
    const requests = await this.requestRepo.findByVendorId(vendorId);

    const courierIds = requests.map((r) => r.courier_user_id);
    if (courierIds.length === 0) return [];

    const people = await this.peopleRepo.find({
      where: { user_id: In(courierIds) },
    });

    const peopleMap = new Map(people.map((p) => [p.user_id, p]));

    return requests.map((r) => {
      const person = peopleMap.get(r.courier_user_id);
      return {
        ...r,
        courier_name: person ? `${person.firstName} ${person.firstLastName}` : 'Sin nombre',
      };
    });
  }
}
