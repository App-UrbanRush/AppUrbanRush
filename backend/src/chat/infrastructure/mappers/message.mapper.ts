import { MessageModel, MessageType } from '../../domain/entities/message.model';
import { MessageDocument } from '../schemas/message.schema';

export class MessageMapper {
  static toDomain(doc: MessageDocument): MessageModel {
    return new MessageModel(
      doc._id.toString(),
      doc.order_id,
      doc.sender_id,
      doc.sender_role,
      doc.content,
      doc.type as MessageType,
      doc.read,
      (doc as any).createdAt ?? null,
    );
  }
}
