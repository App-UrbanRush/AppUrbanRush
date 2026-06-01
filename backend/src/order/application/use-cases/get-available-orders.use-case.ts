import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

@Injectable()
export class GetAvailableOrdersUseCase {
  constructor(@Inject('IOrderRepository') private readonly orderRepository: IOrderRepository) {}
  async execute() { return this.orderRepository.findAvailableForCourier(); }
}