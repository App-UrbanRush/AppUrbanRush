import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { IMessageRepository } from '../../domain/repositories/message.repository.interface';
import { MessageModel } from '../../domain/entities/message.model';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class MongoMessageRepository implements IMessageRepository {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async save(message: MessageModel): Promise<MessageModel> {
    const created = new this.messageModel({
      order_id: message.order_id,
      sender_id: message.sender_id,
      sender_role: message.sender_role,
      content: message.content,
      type: message.type,
      read: message.read,
    });
    const saved = await created.save();
    return MessageMapper.toDomain(saved);
  }

  async findByOrder(orderId: string): Promise<MessageModel[]> {
    const docs = await this.messageModel
      .find({ order_id: orderId })
      .sort({ createdAt: 1 })
      .exec();
    return docs.map(MessageMapper.toDomain);
  }

  async markAsRead(orderId: string, readerId: number): Promise<void> {
    await this.messageModel.updateMany(
      { order_id: orderId, sender_id: { $ne: readerId }, read: false },
      { $set: { read: true } },
    ).exec();
  }

  async countUnread(orderId: string, readerId: number): Promise<number> {
    return this.messageModel.countDocuments({
      order_id: orderId,
      sender_id: { $ne: readerId },
      read: false,
    }).exec();
  }
}
