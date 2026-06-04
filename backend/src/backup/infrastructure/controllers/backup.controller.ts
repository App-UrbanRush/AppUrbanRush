import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { MinRole, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { RunBackupUseCase } from '../../application/use-cases/run-backup.use-case';
import { ListBackupsUseCase } from '../../application/use-cases/list-backups.use-case';

@ApiTags('Backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/backup')
export class BackupController {
  constructor(
    private readonly runBackup: RunBackupUseCase,
    private readonly listBackups: ListBackupsUseCase,
  ) {}

  @Post()
  @MinRole(UserRole.ADMIN) 
  @ApiOperation({ summary: 'Disparar backup manual' })
  run() {
    return this.runBackup.execute();
  }

  @Get()
  @MinRole(UserRole.ADMIN) 
  @ApiOperation({ summary: 'Listar backups disponibles' })
  list() {
    return this.listBackups.execute();
  }
}