import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { IProductRepository } from 'src/product/domain/repositories/product.repository.interface';

@Injectable()
export class RetryPaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(orderId: string, userId: number): Promise<{ success: boolean; status: string }> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.user_id !== userId) throw new ForbiddenException('No tienes acceso a este pedido');

    if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
      throw new BadRequestException('El pedido no puede ser reactivado');
    }

    // If order was cancelled, reactivate it
    if (order.status === 'CANCELLED') {
      for (const item of order.items) {
        const product = await this.productRepository.findById(item.product_id);
        if (product) {
          const newStock = product.stock - item.quantity;
          await this.productRepository.update(item.product_id, {
            stock: newStock,
            is_available: newStock > 0,
          });
        }
      }
      await this.orderRepository.updateStatus(orderId, 'PENDING');
      await this.orderRepository.resetCreatedAt(orderId);
    }

    // Void any existing non-APPROVED payment so a new one can be created
    const existingPayment = await this.paymentRepository.findByOrderId(orderId);
    if (existingPayment && existingPayment.status !== 'APPROVED') {
      await this.paymentRepository.updateStatus(existingPayment.payment_id!, 'VOIDED');
    }

    return { success: true, status: 'PENDING' };
  }
}
