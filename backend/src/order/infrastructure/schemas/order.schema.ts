import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

class OrderItemSchema {
  @Prop({ required: true }) product_id: string;
  @Prop({ required: true }) product_name: string;
  @Prop({ required: true }) quantity: number;
  @Prop({ required: true }) unit_price: number;
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
}

export const OrderSchema = SchemaFactory.createForClass(Order);
