export interface BackupFile {
    name: string;
    size: string;
    date: string;
  }
  
  export interface IBackupRepository {
    backupPostgres(backupPath: string, timestamp: string): Promise<string>;
    backupMongo(backupPath: string, timestamp: string): Promise<string>;
    cleanOldBackups(backupPath: string, retentionDays: number): Promise<void>;
    listBackups(backupPath: string): BackupFile[];
  }