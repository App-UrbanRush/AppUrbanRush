import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }
}
