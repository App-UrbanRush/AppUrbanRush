import { User } from '../../../domain/entities/user.model';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity | null): User | null {
    if (!entity) return null;
    
    const rolIds = entity.userroles 
      ? entity.userroles.map(ur => Number(ur.rol.rol_id)) 
      : [];

    return new User(
      entity.user_id,
      entity.user_email,
      entity.user_password ?? undefined, // ← null → undefined
      rolIds as any,
    );
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    
    if (domain.user_id !== null) {
        entity.user_id = domain.user_id;
    }
    
    entity.user_email = domain.user_email;
    
    if (domain.user_password) {
        entity.user_password = domain.user_password;
    }

    return entity;
  }
}