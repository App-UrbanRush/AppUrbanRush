import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import {
  DB_HOST, DB_PORT, DB_USER,
  DB_PASSWORD, DB_DATABASE
} from 'src/config/constants';
import { IBackupRepository, BackupFile } from '../../domain/repositories/backup.repository.interface';

@Injectable()
export class LocalBackupRepository implements IBackupRepository {
  private readonly logger = new Logger(LocalBackupRepository.name);

  constructor(private readonly configService: ConfigService) {}

  async backupPostgres(backupPath: string, timestamp: string): Promise<string> {
    const pool = new Pool({
      host:     this.configService.get<string>(DB_HOST),
      port:     Number(this.configService.get<string>(DB_PORT) ?? 5432),
      user:     this.configService.get<string>(DB_USER),
      password: this.configService.get<string>(DB_PASSWORD),
      database: this.configService.get<string>(DB_DATABASE),
    });

    const fileName = `postgres_${timestamp}.json`;
    const filePath = path.join(backupPath, fileName);
    const backup: Record<string, any[]> = {};

    try {
      // Obtener todas las tablas
      const tablesResult = await pool.query(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
      `);

      // Por cada tabla exportar todos los datos
      for (const row of tablesResult.rows) {
        const table = row.tablename;
        const data = await pool.query(`SELECT * FROM "${table}"`);
        backup[table] = data.rows;
      }

      fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
      this.logger.log(`PostgreSQL backup generado: ${fileName}`);
      return fileName;

    } finally {
      await pool.end();
    }
  }

  async backupMongo(backupPath: string, timestamp: string): Promise<string> {
    const mongoUri = this.configService.get<string>('MONGO_URI') ?? '';
    const client = new MongoClient(mongoUri);
    const fileName = `mongo_${timestamp}.json`;
    const filePath = path.join(backupPath, fileName);
    const backup: Record<string, any[]> = {};

    try {
      await client.connect();
      const db = client.db();

      // Obtener todas las colecciones
      const collections = await db.listCollections().toArray();

      // Por cada colección exportar todos los documentos
      for (const col of collections) {
        const docs = await db.collection(col.name).find({}).toArray();
        backup[col.name] = docs;
      }

      fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
      this.logger.log(`MongoDB backup generado: ${fileName}`);
      return fileName;

    } finally {
      await client.close();
    }
  }

  async cleanOldBackups(backupPath: string, retentionDays: number): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const files = fs.readdirSync(backupPath);
    let deleted = 0;

    for (const file of files) {
      const filePath = path.join(backupPath, file);
      const stat = fs.statSync(filePath);
      if (stat.mtime < cutoff) {
        stat.isDirectory()
          ? fs.rmSync(filePath, { recursive: true })
          : fs.unlinkSync(filePath);
        deleted++;
      }
    }

    if (deleted > 0) this.logger.log(`🗑️ ${deleted} backups antiguos eliminados`);
  }

  // Vuelca ambas bases en memoria (sin depender de archivos) para descarga directa
  async dumpDatabases(): Promise<{ generated_at: string; postgres: Record<string, any[]>; mongo: Record<string, any[]> }> {
    const pool = new Pool({
      host:     this.configService.get<string>(DB_HOST),
      port:     Number(this.configService.get<string>(DB_PORT) ?? 5432),
      user:     this.configService.get<string>(DB_USER),
      password: this.configService.get<string>(DB_PASSWORD),
      database: this.configService.get<string>(DB_DATABASE),
    });
    const postgres: Record<string, any[]> = {};
    try {
      const tables = await pool.query(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
      );
      for (const row of tables.rows) {
        const table = row.tablename;
        const data = await pool.query(`SELECT * FROM "${table}"`);
        postgres[table] = data.rows;
      }
    } finally {
      await pool.end();
    }

    const mongoUri = this.configService.get<string>('MONGO_URI') ?? '';
    const client = new MongoClient(mongoUri);
    const mongo: Record<string, any[]> = {};
    try {
      await client.connect();
      const db = client.db();
      const collections = await db.listCollections().toArray();
      for (const col of collections) {
        mongo[col.name] = await db.collection(col.name).find({}).toArray();
      }
    } finally {
      await client.close();
    }

    return { generated_at: new Date().toISOString(), postgres, mongo };
  }

  resolveBackupFile(backupPath: string, name: string): string | null {
    // Sanitiza: solo el nombre base, nunca rutas relativas (anti path traversal)
    const safeName = path.basename(name);
    const baseDir = path.resolve(backupPath);
    const fullPath = path.resolve(baseDir, safeName);

    if (!fullPath.startsWith(baseDir + path.sep)) return null;
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return null;
    return fullPath;
  }

  listBackups(backupPath: string): BackupFile[] {
    if (!fs.existsSync(backupPath)) return [];

    return fs.readdirSync(backupPath).map(file => {
      const stat = fs.statSync(path.join(backupPath, file));
      return {
        name: file,
        size: `${(stat.size / 1024).toFixed(2)} KB`,
        date: stat.mtime.toLocaleString('es-CO'),
      };
    }).sort((a, b) => b.date.localeCompare(a.date));
  }
}