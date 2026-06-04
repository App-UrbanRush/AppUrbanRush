import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AdminController } from './infrastructure/controllers/admin.controller';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { ChangeUserRoleUseCase } from './application/use-cases/change-user-role.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [
    GetAllUsersUseCase,
    ChangeUserRoleUseCase,
    DeleteUserUseCase,
  ],
})
export class AdminModule {}