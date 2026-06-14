import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBackupRepository } from '../../domain/repositories/backup.repository.interface';
import { BACKUP_PATH } from 'src/config/constants';

@Injectable()
export class DownloadBackupUseCase {
  constructor(
    @Inject('IBackupRepository')
    private readonly backupRepository: IBackupRepository,
    private readonly configService: ConfigService,
  ) {}

  execute(name: string): string {
    const backupPath = this.configService.get<string>(BACKUP_PATH) ?? './backups';
    const filePath = this.backupRepository.resolveBackupFile(backupPath, name);
    if (!filePath) throw new NotFoundException('Backup no encontrado');
    return filePath;
  }
}
