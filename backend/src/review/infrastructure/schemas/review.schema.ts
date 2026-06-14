import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ required: true, index: true })
  vendor_id: number;

  @Prop({ required: true, index: true })
  user_id: number;

  @Prop({ type: String, default: null })
  order_id: string | null;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: [{ name: String, image_url: { type: String, default: null } }], default: [] })
  items: { name: string; image_url: string | null }[];

  @Prop({ default: 0 })
  total: number;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Índice compuesto para buscar reviews por vendor
ReviewSchema.index({ vendor_id: 1, created_at: -1 });