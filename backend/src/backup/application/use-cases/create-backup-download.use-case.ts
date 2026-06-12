import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBackupRepository } from '../../domain/repositories/backup.repository.interface';
import { BACKUP_PATH, BACKUP_RETENTION_DAYS } from 'src/config/constants';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CreateBackupDownloadUseCase {
  private readonly logger = new Logger(CreateBackupDownloadUseCase.name);

  constructor(
    @Inject('IBackupRepository')
    private readonly backupRepository: IBackupRepository,
    private readonly configService: ConfigService,
  ) {}

  /** Genera el backup combinado, lo guarda en disco y devuelve el JSON para descargar. */
  async execute(): Promise<{ filename: string; content: string }> {
    const backupPath = this.configService.get<string>(BACKUP_PATH) ?? './backups';
    const retentionDays = Number(this.configService.get<string>(BACKUP_RETENTION_DAYS) ?? '7');

    if (!fs.existsSync(backupPath)) fs.mkdirSync(backupPath, { recursive: true });

    const data = await this.backupRepository.dumpDatabases();
    const content = JSON.stringify(data, null, 2);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `urbanrush-backup_${timestamp}.json`;
    fs.writeFileSync(path.join(backupPath, filename), content);

    await this.backupRepository.cleanOldBackups(backupPath, retentionDays);

    this.logger.log(`✅ Backup manual generado: ${filename}`);
    return { filename, content };
  }
}
