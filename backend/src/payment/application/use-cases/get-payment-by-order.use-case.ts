import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { PaymentModel } from '../../domain/entities/payment.model';

@Injectable()
export class GetPaymentByOrderUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(orderId: string): Promise<PaymentModel> {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundException('No se encontró pago para este pedido');
    return payment;
  }
}
