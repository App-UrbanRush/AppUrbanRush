import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreVerificationDocument = StoreVerification & Document;

@Schema({ timestamps: true, collection: 'store_verifications' })
export class StoreVerification {
  @Prop({ required: true }) vendor_id: number;
  @Prop({ required: true }) business_name: string;
  @Prop({ required: true }) result: string;
  @Prop({ required: true }) confidence: number;
  @Prop({ default: '' }) detected_text: string;
  @Prop({ default: false }) is_real_sign: boolean;
  @Prop({ default: false }) name_matches: boolean;
  @Prop({ type: [String], default: [] }) reasons: string[];
  @Prop({ type: String, default: null }) image_url: string | null;
}

export const StoreVerificationSchema = SchemaFactory.createForClass(StoreVerification);
