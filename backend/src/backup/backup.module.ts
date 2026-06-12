import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LocalBackupRepository } from './infrastructure/repositories/local-backup.repository';
import { RunBackupUseCase } from './application/use-cases/run-backup.use-case';
import { ListBackupsUseCase } from './application/use-cases/list-backups.use-case';
import { DownloadBackupUseCase } from './application/use-cases/download-backup.use-case';
import { CreateBackupDownloadUseCase } from './application/use-cases/create-backup-download.use-case';
import { BackupScheduler } from './backup.service';
import { BackupController } from './infrastructure/controllers/backup.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [BackupController],
  providers: [
    LocalBackupRepository,
    { provide: 'IBackupRepository', useClass: LocalBackupRepository },
    RunBackupUseCase,
    ListBackupsUseCase,
    DownloadBackupUseCase,
    CreateBackupDownloadUseCase,
    BackupScheduler,
  ],
})
export class BackupModule {}