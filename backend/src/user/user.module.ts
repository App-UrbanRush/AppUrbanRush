import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './application/services/user.service';
import { UserController } from './infrastructure/controllers/user.controller';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { UserRolesEntity } from '../user_rol/infrastructure/persistence/entity/user_rol.entity';
import { RolEntity } from '../roles/infrastructure/persistence/entity/rol.entity';
// 1. IMPORTA la entidad PeopleEntity (ajusta la ruta si es necesario)
import { PeopleEntity } from '../people/infrastructure/persistence/entities/people.entity'; 

@Module({
  imports: [
    // 2. AGREGA PeopleEntity al forFeature
    TypeOrmModule.forFeature([
      UserEntity, 
      UserRolesEntity, 
      RolEntity, 
      PeopleEntity 
    ])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: 'IUserRepository', useClass: TypeOrmUserRepository }
  ],
  // 3. EXPORTA 'IUserRepository' para que el AuthModule pueda usarlo
  exports: [UserService, 'IUserRepository'] 
})
export class UserModule {}