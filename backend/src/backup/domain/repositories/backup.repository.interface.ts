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
    /** Resuelve la ruta absoluta de un backup de forma segura (evita path traversal). Null si no existe. */
    resolveBackupFile(backupPath: string, name: string): string | null;
    /** Vuelca ambas bases (PostgreSQL + MongoDB) en memoria para descarga directa. */
    dumpDatabases(): Promise<{ generated_at: string; postgres: Record<string, any[]>; mongo: Record<string, any[]> }>;
  }