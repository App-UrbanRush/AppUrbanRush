import { MessageModel } from '../entities/message.model';

export interface IMessageRepository {
  save(message: MessageModel): Promise<MessageModel>;
  findByOrder(orderId: string): Promise<MessageModel[]>;
  markAsRead(orderId: string, readerId: number): Promise<void>;
}
