import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ required: true }) order_id: string;
  @Prop({ required: true }) wompi_transaction_id: string;
  @Prop({ required: true }) amount: number;
  @Prop({ default: 'COP' }) currency: string;
  @Prop({ default: 'PENDING' }) status: string;
  @Prop({ required: true }) payment_method: string;
  @Prop({ required: true, unique: true }) reference: string;
  @Prop({ required: true }) customer_email: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
