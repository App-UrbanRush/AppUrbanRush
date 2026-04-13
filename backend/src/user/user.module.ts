import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './application/services/user.service';
import { UserController } from './infrastructure/controllers/user.controller';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { UserRolesEntity } from '../user_rol/infrastructure/persistence/entity/user_rol.entity';
import { RolEntity } from '../roles/infrastructure/persistence/entity/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRolesEntity, RolEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: 'IUserRepository', useClass: TypeOrmUserRepository }
  ],
  exports: [UserService]
})
export class UserModule {}