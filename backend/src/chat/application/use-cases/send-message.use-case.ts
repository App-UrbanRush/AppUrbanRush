import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { IMessageRepository } from '../../domain/repositories/message.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { MessageModel, MessageType } from '../../domain/entities/message.model';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject('IMessageRepository')
    private readonly messageRepo: IMessageRepository,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    senderId: number,
    senderRole: string,
    content: string,
    type: MessageType = MessageType.TEXT,
  ): Promise<MessageModel> {
    // Validar que el pedido existe
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new BadRequestException('Pedido no encontrado');

    // Solo permitir chat cuando está IN_DELIVERY
    if (order.status !== 'IN_DELIVERY') {
      throw new BadRequestException('El chat solo está disponible cuando el pedido está en estado IN_DELIVERY');
    }

    // Validar que el sender es parte del pedido (usuario o domiciliario)
    const isUser = order.user_id === senderId;
    const isCourier = order.courier_id === senderId;
    if (!isUser && !isCourier) {
      throw new ForbiddenException('No eres parte de este pedido');
    }

    const message = new MessageModel(
      null,
      orderId,
      senderId,
      senderRole,
      content,
      type,
      false,
      null,
    );

    return this.messageRepo.save(message);
  }
}
