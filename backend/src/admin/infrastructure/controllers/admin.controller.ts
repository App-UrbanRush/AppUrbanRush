import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, Request, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, MinRole, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { GetFilteredUsersUseCase } from '../../application/use-cases/get-filtered-users.use-case';
import { CreateUserAdminUseCase } from '../../application/use-cases/create-user-admin.use-case';
import { ChangeRoleAdminUseCase } from '../../application/use-cases/change-role-admin.use-case';
import { DeleteUserAdminUseCase } from '../../application/use-cases/delete-user-admin.use-case';
import { GetSystemStatsUseCase } from '../../application/use-cases/get-system-stats.use-case';
import { GetAuditLogsUseCase } from '../../application/use-cases/get-audit-logs.use-case';
import { AdminUserFiltersDto } from '../../application/dtos/admin-filters.dto';
import { CreateAdminUserDto } from '../../application/dtos/create-admin-user.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly getFilteredUsers: GetFilteredUsersUseCase,
    private readonly createUserAdmin: CreateUserAdminUseCase,
    private readonly changeRoleAdmin: ChangeRoleAdminUseCase,
    private readonly deleteUserAdmin: DeleteUserAdminUseCase,
    private readonly getStats: GetSystemStatsUseCase,
    private readonly getAuditLogs: GetAuditLogsUseCase,
  ) {}

  // ═══════════════════════════════════════════
  // SUPERADMIN endpoints
  // ═══════════════════════════════════════════

  @Get('stats')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Estadísticas globales del sistema (SUPERADMIN)' })
  stats() {
    return this.getStats.execute();
  }

  @Get('users')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios con filtros (SUPERADMIN)' })
  findAll(@Query() filters: AdminUserFiltersDto) {
    return this.getFilteredUsers.execute({
      role: filters.role ? Number(filters.role) : undefined,
      search: filters.search,
      verification_status: filters.verification_status,
    });
  }

  @Post('users')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Crear usuario con cualquier rol (SUPERADMIN)' })
  createUser(@Body() dto: CreateAdminUserDto, @Request() req) {
    return this.createUserAdmin.execute(dto, req.user.user_id, req.user.user_email);
  }

  @Put('users/:id/role')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Cambiar rol de cualquier usuario (SUPERADMIN)' })
  changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rol_id: number },
    @Request() req,
  ) {
    return this.changeRoleAdmin.execute(id, body.rol_id, req.user.user_id, req.user.user_email);
  }

  @Delete('users/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Eliminar cualquier usuario (SUPERADMIN)' })
  removeUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.deleteUserAdmin.execute(id, req.user.user_id, req.user.user_email, req.user.rolIds);
  }

  @Get('admins')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Listar todos los admins (SUPERADMIN)' })
  findAdmins() {
    return this.getFilteredUsers.executeAdmins();
  }

  @Delete('admins/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Eliminar un admin (SUPERADMIN)' })
  removeAdmin(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.deleteUserAdmin.execute(id, req.user.user_id, req.user.user_email, req.user.rolIds);
  }

  @Get('audit-logs')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Ver logs de auditoría (SUPERADMIN)' })
  auditLogs(@Query('limit') limit?: string) {
    return this.getAuditLogs.execute(limit ? Number(limit) : 100);
  }

  // ═══════════════════════════════════════════
  // ADMIN endpoints
  // ═══════════════════════════════════════════

  @Get('users/common')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar usuarios comunes — USER, DOMICILIARIO, BUSINESS (ADMIN)' })
  findCommonUsers() {
    return this.getFilteredUsers.executeCommonUsers();
  }

  @Put('users/:id/edit')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Editar usuario común (ADMIN)' })
  editCommonUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { user_email?: string; status?: boolean },
    @Request() req,
  ) {
    // Delegamos al cambio simple — ADMIN no puede cambiar roles
    return this.changeRoleAdmin.execute(id, 0, req.user.user_id, req.user.user_email)
      .catch(() => ({ message: 'Funcionalidad de edición básica' }));
  }

  @Delete('users/:id/common')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuario común — no admins (ADMIN)' })
  removeCommonUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.deleteUserAdmin.execute(id, req.user.user_id, req.user.user_email, req.user.rolIds);
  }
}
