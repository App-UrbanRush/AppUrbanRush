import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) price: number;
  @Prop({ type: String, default: null }) image_url: string | null; 
  @Prop({ required: true }) category: string;
  @Prop({ default: true }) is_available: boolean;
  @Prop({ default: 0 }) stock: number;
  @Prop({ required: true }) vendor_id: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);