import { Injectable, Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IMessageRepository } from '../../domain/repositories/message.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { MessageModel } from '../../domain/entities/message.model';

@Injectable()
export class GetChatHistoryUseCase {
  constructor(
    @Inject('IMessageRepository')
    private readonly messageRepo: IMessageRepository,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string, userId: number): Promise<MessageModel[]> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new BadRequestException('Pedido no encontrado');

    // Solo participantes del pedido pueden ver el historial
    const isUser = order.user_id === userId;
    const isCourier = order.courier_id === userId;
    if (!isUser && !isCourier) {
      throw new ForbiddenException('No eres parte de este pedido');
    }

    return this.messageRepo.findByOrder(orderId);
  }
}
