import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPeopleRepository } from '../../../domain/repositories/people.repository.interface';
import { People } from '../../../domain/entities/people.model';
import { PeopleMapper } from '../mappers/people.mapper';
import { PeopleEntity } from '../entities/people.entity';

@Injectable()
export class TypeOrmPeopleRepository implements IPeopleRepository {
  constructor(
    @InjectRepository(PeopleEntity) private readonly repo: Repository<PeopleEntity>,
  ) {}

  async findAll(): Promise<People[]> {
    const entities = await this.repo.find({ relations: ['user'] });
    return entities.map(PeopleMapper.toDomain) as People[];
  }

  async findById(id: number): Promise<People | null> {
    const entity = await this.repo.findOne({ where: { people_id: id }, relations: ['user'] });
    return PeopleMapper.toDomain(entity);
  }

  async findByUserId(userId: number): Promise<People | null> {
    const entity = await this.repo.findOne({ 
      where: { user: { user_id: userId } }, 
      relations: ['user'] 
    });
    return PeopleMapper.toDomain(entity);
  }

  async save(people: People): Promise<People> {
    const persistence = PeopleMapper.toPersistence(people);
    const saved = await this.repo.save(persistence);
    return PeopleMapper.toDomain(saved)!;
  }
}