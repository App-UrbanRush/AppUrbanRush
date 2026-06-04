import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../schemas/audit-log.schema';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLogModel } from '../../domain/entities/audit-log.model';

@Injectable()
export class MongoAuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  async create(log: AuditLogModel): Promise<AuditLogModel> {
    const created = new this.auditModel({
      action: log.action,
      entity: log.entity,
      entity_id: String(log.entity_id),
      performed_by: log.performed_by,
      performed_by_email: log.performed_by_email,
      details: log.details,
    });
    const saved = await created.save();
    return this.toDomain(saved);
  }

  async findAll(limit = 100): Promise<AuditLogModel[]> {
    const docs = await this.auditModel.find().sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map(this.toDomain);
  }

  async findByPerformedBy(userId: number): Promise<AuditLogModel[]> {
    const docs = await this.auditModel.find({ performed_by: userId }).sort({ createdAt: -1 }).exec();
    return docs.map(this.toDomain);
  }

  private toDomain(doc: AuditLogDocument): AuditLogModel {
    return new AuditLogModel(
      doc._id.toString(),
      doc.action,
      doc.entity,
      doc.entity_id,
      doc.performed_by,
      doc.performed_by_email,
      doc.details,
      (doc as any).createdAt ?? null,
    );
  }
}
