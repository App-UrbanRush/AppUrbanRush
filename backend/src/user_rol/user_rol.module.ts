import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRolService } from './application/services/user-roles.service';
import { UserRolesEntity } from './infrastructure/persistence/entity/user_rol.entity';
import { TypeOrmUserRolesRepository } from './infrastructure/persistence/repositories/typeorm-user-roles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserRolesEntity])],
  providers: [
    UserRolService,
    {
      provide: 'IUserRolesRepository',
      useClass: TypeOrmUserRolesRepository,
    },
  ],
  exports: [UserRolService, 'IUserRolesRepository'],
})
export class UserRolModule {}