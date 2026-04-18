import { User } from '../../../domain/entities/user.model';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity | null): User | null {
    if (!entity) return null;
    
    // Extraemos los IDs de los roles como números para que el Guard funcione
    const rolIds = entity.userroles 
      ? entity.userroles.map(ur => Number(ur.rol.rol_id)) 
      : [];

    return new User(
      entity.user_id,
      entity.user_email,
      entity.user_password,
      rolIds as any // Lo pasamos al array de roles del dominio
    );
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    
    // Ajustado a los nombres de tu clase User (user_id, user_email...)
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