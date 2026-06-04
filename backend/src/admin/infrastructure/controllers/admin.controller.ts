import { Controller, Get, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, MinRole, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.use-case';
import { ChangeUserRoleUseCase } from '../../application/use-cases/change-user-role.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly getAllUsers: GetAllUsersUseCase,
    private readonly changeRole: ChangeUserRoleUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  // ADMIN y SUPERADMIN pueden listar usuarios
  @Get('users')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios (ADMIN y SUPERADMIN)' })
  findAll() {
    return this.getAllUsers.execute();
  }

  // Solo SUPERADMIN puede cambiar roles
  @Put('users/:id/role')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Cambiar rol de un usuario (solo SUPERADMIN)' })
  changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rol_id: number },
  ) {
    return this.changeRole.execute(id, body.rol_id);
  }

  // SUPERADMIN puede eliminar cualquier usuario
  // ADMIN solo puede eliminar usuarios comunes 
  @Delete('users/:id')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuario (ADMIN usuarios comunes, SUPERADMIN cualquiera)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteUser.execute(id);
  }
}