import { People } from 'src/people/domain/entities/people.model';
import { PeopleEntity } from '../entities/people.entity';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';


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
      entity.avatar_url ?? null,
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
    if (domain.avatarUrl !== undefined) {
      entity.avatar_url = domain.avatarUrl;
    }
    if (domain.userId) {
      entity.user = { user_id: domain.userId } as UserEntity;
    }
    return entity;
  }
}