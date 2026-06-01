import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

@Injectable()
export class GetOrdersByUserUseCase {
  constructor(@Inject('IOrderRepository') private readonly orderRepository: IOrderRepository) {}
  async execute(userId: number) { return this.orderRepository.findByUser(userId); }
}