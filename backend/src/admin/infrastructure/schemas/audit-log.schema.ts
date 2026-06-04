import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true }) action: string;
  @Prop({ required: true }) entity: string;
  @Prop({ required: true }) entity_id: string;
  @Prop({ required: true }) performed_by: number;
  @Prop({ required: true }) performed_by_email: string;
  @Prop({ type: Object, default: {} }) details: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
