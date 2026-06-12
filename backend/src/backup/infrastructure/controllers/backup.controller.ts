import { Controller, Get, Post, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { MinRole, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { RunBackupUseCase } from '../../application/use-cases/run-backup.use-case';
import { ListBackupsUseCase } from '../../application/use-cases/list-backups.use-case';
import { DownloadBackupUseCase } from '../../application/use-cases/download-backup.use-case';
import { CreateBackupDownloadUseCase } from '../../application/use-cases/create-backup-download.use-case';

@ApiTags('Backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/backup')
export class BackupController {
  constructor(
    private readonly runBackup: RunBackupUseCase,
    private readonly listBackups: ListBackupsUseCase,
    private readonly downloadBackup: DownloadBackupUseCase,
    private readonly createBackupDownload: CreateBackupDownloadUseCase,
  ) {}

  @Post()
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Disparar backup manual (ADMIN+)' })
  run() {
    return this.runBackup.execute();
  }

  @Get('download-now')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generar y descargar un backup combinado (PostgreSQL + MongoDB) (ADMIN+)' })
  async downloadNow(@Res() res: Response) {
    const { filename, content } = await this.createBackupDownload.execute();
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': Buffer.byteLength(content),
    });
    res.end(content);
  }

  @Get()
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar backups disponibles (ADMIN+)' })
  list() {
    return this.listBackups.execute();
  }

  @Get(':name/download')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Descargar un archivo de backup (ADMIN+)' })
  download(@Param('name') name: string, @Res() res: Response) {
    const filePath = this.downloadBackup.execute(name);
    return res.download(filePath);
  }
}