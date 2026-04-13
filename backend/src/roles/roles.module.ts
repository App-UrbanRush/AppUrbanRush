import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './application/services/roles.service';
import { RolEntity } from './infrastructure/persistence/entity/rol.entity';
import { TypeOrmRolesRepository } from './infrastructure/persistence/repositories/typeorm-roles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntity])],
  providers: [
    RolesService,
    {
      provide: 'IRolesRepository',
      useClass: TypeOrmRolesRepository,
    },
  ],
  exports: [RolesService, 'IRolesRepository'], 
})
export class RolesModule {}