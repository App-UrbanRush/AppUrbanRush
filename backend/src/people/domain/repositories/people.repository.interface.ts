import { People } from '../entities/people.model';

export interface IPeopleRepository {
  findAll(): Promise<People[]>;
  findById(id: number): Promise<People | null>;
  findByUserId(userId: number): Promise<People | null>;
  save(people: People): Promise<People>;
}