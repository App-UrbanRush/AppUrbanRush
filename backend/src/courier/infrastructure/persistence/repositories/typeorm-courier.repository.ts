import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICourierRepository } from 'src/courier/domain/repositories/courier.repository';
import { CourierEntity } from '../entities/courier.entity';
import { Courier } from 'src/courier/domain/entities/courier.model';
import { CourierMapper } from '../mappers/courier.mapper';

@Injectable()
export class TypeOrmCourierRepository implements ICourierRepository {
  constructor(
    @InjectRepository(CourierEntity)
    private readonly repository: Repository<CourierEntity>,
  ) {}

  async save(courier: Partial<Courier>): Promise<Courier> {
    const entityData = {
      ...courier,
      couriers_id: courier.couriers_id ?? undefined,
    };
  
    const entity = this.repository.create(entityData as any);
  
    const saved = (await this.repository.save(entity)) as unknown as CourierEntity;

    return CourierMapper.toDomain(saved);
  }

  async findByUserId(userId: number): Promise<Courier | null> {
    const entity = await this.repository.findOne({ where: { user_id: userId } });
    return entity ? CourierMapper.toDomain(entity) : null;
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.repository.update(id, { status });
  }
}