import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';
import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { Order, OrderSchema } from 'src/order/infrastructure/schemas/order.schema';
import { Payment, PaymentSchema } from 'src/payment/infrastructure/schemas/payment.schema';
import { AuditLog, AuditLogSchema } from './infrastructure/schemas/audit-log.schema';
import { MongoAuditLogRepository } from './infrastructure/repositories/mongo-audit-log.repository';
import { TypeormAdminUserRepository } from './infrastructure/repositories/typeorm-admin-user.repository';
import { StatsService } from './infrastructure/services/stats.service';
import { AdminController } from './infrastructure/controllers/admin.controller';
import { GetFilteredUsersUseCase } from './application/use-cases/get-filtered-users.use-case';
import { CreateUserAdminUseCase } from './application/use-cases/create-user-admin.use-case';
import { ChangeRoleAdminUseCase } from './application/use-cases/change-role-admin.use-case';
import { DeleteUserAdminUseCase } from './application/use-cases/delete-user-admin.use-case';
import { GetSystemStatsUseCase } from './application/use-cases/get-system-stats.use-case';
import { GetAuditLogsUseCase } from './application/use-cases/get-audit-logs.use-case';
import { UpdateCommonUserUseCase } from './application/use-cases/update-common-user.use-case';
import { GetUserDetailUseCase } from './application/use-cases/get-user-detail.use-case';
import { LiquidationModule } from 'src/liquidation/liquidation.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    TypeOrmModule.forFeature([
      UserEntity,
      PeopleEntity,
      VendorEntity,
      CourierEntity,
      UserRolesEntity,
    ]),
    LiquidationModule,
  ],
  controllers: [AdminController],
  providers: [
    MongoAuditLogRepository,
    { provide: 'IAuditLogRepository', useClass: MongoAuditLogRepository },
    TypeormAdminUserRepository,
    { provide: 'IAdminUserRepository', useClass: TypeormAdminUserRepository },
    StatsService,
    GetFilteredUsersUseCase,
    CreateUserAdminUseCase,
    ChangeRoleAdminUseCase,
    DeleteUserAdminUseCase,
    GetSystemStatsUseCase,
    GetAuditLogsUseCase,
    UpdateCommonUserUseCase,
    GetUserDetailUseCase,
  ],
})
export class AdminModule {}
