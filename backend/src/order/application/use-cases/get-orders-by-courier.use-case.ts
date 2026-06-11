import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

@Injectable()
export class GetOrdersByCourierUseCase {
  constructor(@Inject('IOrderRepository') private readonly orderRepository: IOrderRepository) {}
  async execute(courierId: number) { return this.orderRepository.findByCourier(courierId); }
}
