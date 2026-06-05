import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true }) vendor_id: number;
  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) image_url: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
