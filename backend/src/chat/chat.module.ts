import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './infrastructure/schemas/message.schema';
import { MongoMessageRepository } from './infrastructure/repositories/mongo-message.repository';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetChatHistoryUseCase } from './application/use-cases/get-chat-history.use-case';
import { MarkMessagesReadUseCase } from './application/use-cases/mark-messages-read.use-case';
import { GetUnreadCountUseCase } from './application/use-cases/get-unread-count.use-case';
import { ChatGateway } from './infrastructure/gateways/chat.gateway';
import { ChatController } from './infrastructure/controllers/chat.controller';
import { OrderModule } from 'src/order/order.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    OrderModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [
    MongoMessageRepository,
    { provide: 'IMessageRepository', useClass: MongoMessageRepository },
    SendMessageUseCase,
    GetChatHistoryUseCase,
    MarkMessagesReadUseCase,
    GetUnreadCountUseCase,
    ChatGateway,
  ],
  exports: [ChatGateway],
})
export class ChatModule {}
