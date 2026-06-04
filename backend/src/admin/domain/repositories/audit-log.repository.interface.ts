import { AuditLogModel } from '../entities/audit-log.model';

export interface IAuditLogRepository {
  create(log: AuditLogModel): Promise<AuditLogModel>;
  findAll(limit?: number): Promise<AuditLogModel[]>;
  findByPerformedBy(userId: number): Promise<AuditLogModel[]>;
}
