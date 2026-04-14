import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { RolEntity } from 'src/roles/infrastructure/persistence/entity/rol.entity';
import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { UserEntity } from '../entities/user.entity';
import { User } from '../../../domain/entities/user.model';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    @InjectRepository(UserRolesEntity) private readonly urRepo: Repository<UserRolesEntity>,
    @InjectRepository(RolEntity) private readonly rolRepo: Repository<RolEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(user);
    const savedEntity = await this.repo.save(persistenceModel);
    return UserMapper.toDomain(savedEntity)!;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ 
      where: { user_email: email },
      relations: ['userroles', 'userroles.rol'] 
    });
    return UserMapper.toDomain(entity);
  }

  async findOneById(id: number): Promise<User | null> {
    const entity = await this.repo.findOne({ 
      where: { user_id: id }, 
      relations: ['userroles', 'userroles.rol'] 
    });
    return UserMapper.toDomain(entity);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find({ 
      relations: ['userroles', 'userroles.rol'] 
    });
    // Filtramos los nulls por seguridad
    return entities.map(entity => UserMapper.toDomain(entity)).filter(u => u !== null) as User[];
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async updateUserRole(userId: number, rolId: number): Promise<void> {
    const existingRole = await this.urRepo.findOne({ 
      where: { user: { user_id: userId } } 
    });

    if (existingRole) {
      existingRole.rol = { rol_id: rolId } as RolEntity;
      await this.urRepo.save(existingRole);
    } else {
      const newUr = this.urRepo.create({
        user: { user_id: userId } as UserEntity,
        rol: { rol_id: rolId } as RolEntity
      });
      await this.urRepo.save(newUr);
    }
  }

  async findRolById(rol_id: number) { 
    return this.rolRepo.findOne({ where: { rol_id } }); 
  }

  async findUserRole(user: User) { 
    if (!user.id) return null; 

    return this.urRepo.findOne({ 
      where: { user: { user_id: user.id } }, 
      relations: ['rol'] 
    }); 
  }

  async saveUserRole(ur: any) { 
    await this.urRepo.save(ur); 
  }
}