import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VendorLiquidationDocument = VendorLiquidation & Document;

@Schema({ timestamps: true, collection: 'vendor_liquidations' })
export class VendorLiquidation {
  @Prop({ required: true }) vendor_id: number;
  @Prop({ required: true }) order_id: string;
  @Prop({ required: true }) subtotal: number;
  @Prop({ required: true }) platform_commission: number;
  @Prop({ required: true }) vendor_net: number;
  @Prop({ default: 'PENDING' }) status: string;
  @Prop({ type: Date, default: null }) paid_at: Date | null;
}

export const VendorLiquidationSchema = SchemaFactory.createForClass(VendorLiquidation);
