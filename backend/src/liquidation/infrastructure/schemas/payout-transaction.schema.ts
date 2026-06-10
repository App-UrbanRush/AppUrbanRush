import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayoutTransactionDocument = PayoutTransaction & Document;

class BankAccountSnapshot {
  @Prop({ required: true }) bank_name: string;
  @Prop({ required: true }) account_type: string;
  @Prop({ required: true }) account_number_masked: string;
  @Prop({ required: true }) holder_name: string;
}

@Schema({ timestamps: true, collection: 'payout_transactions' })
export class PayoutTransaction {
  @Prop({ required: true }) user_id: number;
  @Prop({ required: true }) beneficiary_type: string;
  @Prop({ required: true }) bank_account_id: number;
  @Prop({ type: BankAccountSnapshot, required: true }) bank_account_snapshot: BankAccountSnapshot;
  @Prop({ required: true }) amount: number;
  @Prop({ default: 'COP' }) currency: string;
  @Prop({ default: 'PENDING' }) status: string;
  @Prop({ type: String, default: null }) wompi_transaction_id: string | null;
  @Prop({ required: true }) reference: string;
  @Prop({ type: String, default: null }) failure_reason: string | null;
  @Prop({ type: [String], default: [] }) earning_ids: string[];
  @Prop({ type: Date, default: null }) completed_at: Date | null;
}

export const PayoutTransactionSchema = SchemaFactory.createForClass(PayoutTransaction);
