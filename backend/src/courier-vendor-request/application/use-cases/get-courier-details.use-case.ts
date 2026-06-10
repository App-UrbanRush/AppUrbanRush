import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';
import { CourierEntity } from '../../../courier/infrastructure/persistence/entities/courier.entity';
import { UserEntity } from '../../../user/infrastructure/persistence/entities/user.entity';

@Injectable()
export class GetCourierDetailsUseCase {
  constructor(
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async execute(userId: number) {
    const person = await this.peopleRepo.findOne({ where: { user_id: userId } });
    const courier = await this.courierRepo.findOne({ where: { user_id: userId } });
    const user = await this.userRepo.findOne({ where: { user_id: userId } });

    if (!person && !courier) {
      throw new NotFoundException('Domiciliario no encontrado');
    }

    return {
      firstName: person?.firstName || '',
      firstLastName: person?.firstLastName || '',
      cellphone: person?.cellphone || '',
      address: person?.address || '',
      gender: person?.gender || '',
      document_number: person?.document_number || '',
      vehicle_type: courier?.vehicle_type || '',
      vehicle_plate: courier?.vehicle_plate || '',
      soat_number: courier?.soat_number || '',
      courier_status: courier?.status || '',
      email: user?.user_email || '',
    };
  }
}
