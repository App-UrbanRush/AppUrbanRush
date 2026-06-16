import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { WompiService } from '../../infrastructure/services/wompi.service';
import { FastApiService } from 'src/shared/services/fastapi.service';
import { RegisterVendorSaleUseCase } from 'src/liquidation/application/use-cases/register-vendor-sale.use-case';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentModel } from '../../domain/entities/payment.model';
import { randomUUID } from 'crypto';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    private readonly wompiService: WompiService,
    private readonly fastApiService: FastApiService,
    private readonly registerVendorSale: RegisterVendorSaleUseCase,
  ) {}

  async execute(dto: CreatePaymentDto, userId: number): Promise<PaymentModel> {
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.status !== 'PENDING') {
      throw new BadRequestException(`El pedido no está en estado PENDING (estado actual: ${order.status}). Reactiva el pedido antes de pagar.`);
    }

    const existing = await this.paymentRepository.findByOrderId(dto.order_id);
    if (existing && existing.status === 'PENDING') {
      throw new BadRequestException('Ya existe un pago pendiente para este pedido');
    }

    const amountInCents = Math.round(order.total * 100);

    // Si ya viene un transaction_id del WidgetCheckout, saltar Wompi API
    if (dto.transaction_id) {
      const reference = dto.reference || `urbanrush-${dto.order_id}-${randomUUID()}`;
      const initialStatus = dto.status || 'PENDING';
      const payment = new PaymentModel(
        null,
        dto.order_id,
        userId,
        order.vendor_id,
        dto.transaction_id,
        amountInCents,
        'COP',
        initialStatus,
        dto.payment_method.type ?? 'CARD',
        reference,
        dto.customer_email,
        null,
        null,
      );
      const created = await this.paymentRepository.create(payment);

      if (initialStatus === 'APPROVED') {
        await this.orderRepository.updateStatus(dto.order_id, 'ACCEPTED');
        await this.registerVendorSale.execute(dto.order_id);
      }

      return created;
    }

    // Análisis de fraude — bloquea si es sospechoso
    const fraudResult = await this.fastApiService.analyzeFraud({
      user_id: userId,
      order_id: dto.order_id,
      amount: amountInCents,
      payment_method: dto.payment_method.type ?? 'UNKNOWN',
      delivery_address: order.delivery_address,
    });

    if (fraudResult.is_suspicious && fraudResult.risk_score >= 0.8) {
      throw new BadRequestException(
        `Pago bloqueado por seguridad. Razones: ${fraudResult.reasons.join(', ')}`
      );
    }

    const reference = `urbanrush-${dto.order_id}-${randomUUID()}`;

    const wompiResponse = await this.wompiService.createTransaction(
      amountInCents,
      'COP',
      dto.customer_email,
      dto.payment_method,
      reference,
    );

    const transaction = wompiResponse.data;

    const payment = new PaymentModel(
      null,
      dto.order_id,
      userId,
      order.vendor_id,
      transaction.id,
      amountInCents,
      'COP',
      'PENDING',
      dto.payment_method.type ?? 'UNKNOWN',
      reference,
      dto.customer_email,
      null,
      null,
    );

    return this.paymentRepository.create(payment);
  }
}