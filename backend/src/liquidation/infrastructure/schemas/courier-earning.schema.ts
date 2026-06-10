import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourierEarningDocument = CourierEarning & Document;

@Schema({ timestamps: true, collection: 'courier_earnings' })
export class CourierEarning {
  @Prop({ required: true }) courier_id: number;
  @Prop({ required: true }) order_id: string;
  @Prop({ required: true }) delivery_fee: number;
  @Prop({ default: 'PENDING' }) status: string;
  @Prop({ type: Date, default: null }) paid_at: Date | null;
}

export const CourierEarningSchema = SchemaFactory.createForClass(CourierEarning);
