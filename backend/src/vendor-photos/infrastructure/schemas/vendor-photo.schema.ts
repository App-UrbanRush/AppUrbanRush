import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VendorPhotoDocument = VendorPhoto & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, collection: 'vendor_photos' })
export class VendorPhoto {
  @Prop({ required: true })
  vendor_id: number;

  @Prop({ required: true })
  image_url: string;

  @Prop({ required: true })
  public_id: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 'storefront' })
  type: string;
}

export const VendorPhotoSchema = SchemaFactory.createForClass(VendorPhoto);
