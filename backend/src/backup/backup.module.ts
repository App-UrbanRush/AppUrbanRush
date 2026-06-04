import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LocalBackupRepository } from './infrastructure/repositories/local-backup.repository';
import { RunBackupUseCase } from './application/use-cases/run-backup.use-case';
import { ListBackupsUseCase } from './application/use-cases/list-backups.use-case';
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
    BackupScheduler,
  ],
})
export class BackupModule {}