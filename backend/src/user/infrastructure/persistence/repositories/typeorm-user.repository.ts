import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { RolEntity } from 'src/roles/infrastructure/persistence/entity/rol.entity';
import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { UserEntity } from '../entities/user.entity';
import { User } from '../../../domain/entities/user.model';
import { UserMapper } from '../mappers/user.mapper';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    @InjectRepository(UserRolesEntity) private readonly urRepo: Repository<UserRolesEntity>,
    @InjectRepository(RolEntity) private readonly rolRepo: Repository<RolEntity>,
    @InjectRepository(PeopleEntity) private readonly peopleRepo: Repository<PeopleEntity>, 
  ) {}

  async create(user: User, personData: any): Promise<User> {
    const queryRunner = this.repo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Guardar la Entidad de Usuario
      const userEntity = queryRunner.manager.create(UserEntity, {
        user_email: user.user_email,
        user_password: user.user_password,
      });
      const savedUser = await queryRunner.manager.save(userEntity);

      // 2. Guardar la Persona asociada al usuario
      const personEntity = queryRunner.manager.create(PeopleEntity, {
        ...personData,
        user_id: savedUser.user_id, 
      });
      await queryRunner.manager.save(personEntity);

      // 3. Guardar los Roles - CORREGIDO PARA EVITAR TS2769
      if (user.roles && user.roles.length > 0) {
        for (const roleId of user.roles) {
          const userRole = queryRunner.manager.create(UserRolesEntity, {
            user: savedUser, // Pasamos la entidad completa
            rol: { rol_id: roleId } as RolEntity,
          } as any); // Usamos any para saltar la validación estricta de TypeORM aquí
          await queryRunner.manager.save(userRole);
        }
      }

      await queryRunner.commitTransaction();

      // CORREGIDO PARA EVITAR TS2322 (Agregamos el !)
      return UserMapper.toDomain(savedUser)!; 

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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
    if (!user.user_id) return null; 

    return this.urRepo.findOne({ 
      where: { user: { user_id: user.user_id } }, 
      relations: ['rol'] 
    }); 
  }

  async saveUserRole(urData: any): Promise<void> { 
    await this.urRepo.save(urData); 
  }

  async savePeople(peopleData: any): Promise<any> {
    return await this.peopleRepo.save(peopleData);
  }
}