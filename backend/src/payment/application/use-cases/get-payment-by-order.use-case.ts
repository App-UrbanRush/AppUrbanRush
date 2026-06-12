import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { WompiService } from '../../infrastructure/services/wompi.service';
import { PaymentModel } from '../../domain/entities/payment.model';

@Injectable()
export class GetPaymentByOrderUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    private readonly wompiService: WompiService,
  ) {}

  async execute(orderId: string): Promise<PaymentModel> {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundException('No se encontró pago para este pedido');

    // Si está PENDING, consultar Wompi para ver si ya cambió el estado
    if (payment.status === 'PENDING' && payment.wompi_transaction_id) {
      try {
        const wompiStatus = await this.wompiService.getTransactionStatus(
          payment.wompi_transaction_id,
        );

        if (wompiStatus !== 'PENDING' && wompiStatus !== payment.status) {
          await this.paymentRepository.updateStatus(payment.payment_id!, wompiStatus);

          if (wompiStatus === 'APPROVED') {
            await this.orderRepository.updateStatus(payment.order_id, 'ACCEPTED');
          }

          payment.status = wompiStatus;
        }
      } catch {
        // Si falla la consulta a Wompi, devolver estado actual sin cambios
      }
    }

    return payment;
  }
}
