import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

class OrderItemSchema {
  @Prop({ required: true }) product_id: string;
  @Prop({ required: true }) product_name: string;
  @Prop({ required: true }) quantity: number;
  @Prop({ required: true }) unit_price: number;
  @Prop({ type: String, default: null }) image_url: string | null;
}

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true }) user_id: number;
  @Prop({ required: true }) vendor_id: number;
  @Prop({ type: Number, default: null }) courier_id: number | null;
  @Prop({ default: 'PENDING' }) status: string;
  @Prop({ required: true }) delivery_address: string;
  @Prop({ required: true }) subtotal: number;
  @Prop({ required: true }) delivery_fee: number;
  @Prop({ required: true }) platform_commission: number;
  @Prop({ required: true }) total: number;
  @Prop({ type: [OrderItemSchema], default: [] }) items: OrderItemSchema[];

  // Código de confirmación de entrega (4 dígitos)
  @Prop({ type: String, default: null }) delivery_code: string | null;
  @Prop({ default: 0 }) delivery_attempts: number;
  @Prop({ default: false }) delivery_blocked: boolean;

  // Coordenadas de entrega
  @Prop({ type: Number, default: null }) customer_lat: number | null;
  @Prop({ type: Number, default: null }) customer_lng: number | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
