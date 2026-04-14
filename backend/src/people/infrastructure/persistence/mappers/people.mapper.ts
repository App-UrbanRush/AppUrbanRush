import { People } from 'src/people/domain/entities/people.model';
import { PeopleEntity } from '../entities/people.entity';


export class PeopleMapper {
  static toDomain(entity: PeopleEntity | null): People | null {
    if (!entity) return null;
    return new People(
      entity.people_id,
      entity.firstName,
      entity.firstLastName,
      entity.cellphone,
      entity.address,
      entity.gender,
      entity.user?.user_id || null,
    );
  }

  static toPersistence(domain: People): PeopleEntity {
    const entity = new PeopleEntity();
    if (domain.id) entity.people_id = domain.id;
    entity.firstName = domain.firstName;
    entity.firstLastName = domain.firstLastName;
    entity.cellphone = domain.cellphone;
    entity.address = domain.address;
    entity.gender = domain.gender;
    // La relación se maneja usualmente por ID en la entidad
    return entity;
  }
}