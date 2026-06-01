import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';

@Injectable()
export class GetOrdersByVendorUseCase {
  constructor(@Inject('IOrderRepository') private readonly orderRepository: IOrderRepository) {}
  async execute(vendorId: number) { return this.orderRepository.findByVendor(vendorId); }
}