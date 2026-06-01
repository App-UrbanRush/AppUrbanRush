import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:     ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:    ['PREPARING'],
  PREPARING:   ['READY'],
  READY:       ['IN_DELIVERY'],
  IN_DELIVERY: ['DELIVERED'],
};

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(@Inject('IOrderRepository') private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string, newStatus: string, courierId?: number) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Pedido no encontrado');

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`No se puede pasar de ${order.status} a ${newStatus}`);
    }

    return this.orderRepository.updateStatus(orderId, newStatus, courierId);
  }
}