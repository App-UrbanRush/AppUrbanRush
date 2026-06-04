import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({ required: true }) order_id: string;
  @Prop({ required: true }) sender_id: number;
  @Prop({ required: true }) sender_role: string;
  @Prop({ required: true }) content: string;
  @Prop({ default: 'TEXT' }) type: string;
  @Prop({ default: false }) read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
