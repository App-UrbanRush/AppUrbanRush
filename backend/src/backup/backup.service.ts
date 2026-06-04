import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RunBackupUseCase } from './application/use-cases/run-backup.use-case';

@Injectable()
export class BackupScheduler {
  private readonly logger = new Logger(BackupScheduler.name);

  constructor(private readonly runBackupUseCase: RunBackupUseCase) {}

  @Cron('0 2 * * *')
  async handleCron() {
    this.logger.log('⏰ Ejecutando backup automático programado (2:00 AM)');
    await this.runBackupUseCase.execute();
  }
}