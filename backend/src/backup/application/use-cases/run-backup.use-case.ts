import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBackupRepository } from '../../domain/repositories/backup.repository.interface';
import { BACKUP_PATH, BACKUP_RETENTION_DAYS } from 'src/config/constants';
import * as fs from 'fs';

@Injectable()
export class RunBackupUseCase {
  private readonly logger = new Logger(RunBackupUseCase.name);

  constructor(
    @Inject('IBackupRepository')
    private readonly backupRepository: IBackupRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<{ success: boolean; files: string[] }> {
    const backupPath = this.configService.get<string>(BACKUP_PATH) ?? './backups';
    const retentionDays = Number(
      this.configService.get<string>(BACKUP_RETENTION_DAYS) ?? '7'
    );
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const files: string[] = [];

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    try {
      const pgFile    = await this.backupRepository.backupPostgres(backupPath, timestamp);
      const mongoFile = await this.backupRepository.backupMongo(backupPath, timestamp);
      files.push(pgFile, mongoFile);

      await this.backupRepository.cleanOldBackups(backupPath, retentionDays);

      this.logger.log(`✅ Backup completado: ${files.join(', ')}`);
      return { success: true, files };

    } catch (error) {
      this.logger.error(
        `Backup fallido a las ${new Date().toLocaleString('es-CO')} — Error: ${error.message}`
      );
      return { success: false, files: [] };
    }
  }
}