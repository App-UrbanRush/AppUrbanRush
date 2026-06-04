import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBackupRepository } from '../../domain/repositories/backup.repository.interface';
import { BACKUP_PATH } from 'src/config/constants';

@Injectable()
export class ListBackupsUseCase {
  constructor(
    @Inject('IBackupRepository')
    private readonly backupRepository: IBackupRepository,
    private readonly configService: ConfigService,
  ) {}

  execute() {
    const backupPath = this.configService.get<string>(BACKUP_PATH) ?? './backups';
    return this.backupRepository.listBackups(backupPath);
  }
}