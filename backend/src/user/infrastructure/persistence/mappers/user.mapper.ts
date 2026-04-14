import { User } from '../../../domain/entities/user.model';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity | null): User | null {
    if (!entity) return null;
    return new User(
      entity.user_id,
      entity.user_email,
      entity.user_password,
      entity.userroles?.map(ur => ur.rol.rol_name) || []
    );
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    if (domain.id !== null) entity.user_id = domain.id; // TypeORM generará el ID si es null
    entity.user_email = domain.email;
    entity.user_password = domain.password!;
    return entity;
  }
}