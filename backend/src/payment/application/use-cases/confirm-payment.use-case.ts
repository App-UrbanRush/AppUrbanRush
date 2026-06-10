import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { WompiService } from '../../infrastructure/services/wompi.service';
import { WompiWebhookDto } from '../dtos/wompi-webhook.dto';
import { RegisterVendorSaleUseCase } from 'src/liquidation/application/use-cases/register-vendor-sale.use-case';

const TERMINAL_STATUSES = ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'];

@Injectable()
export class ConfirmPaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    private readonly wompiService: WompiService,
    private readonly registerVendorSale: RegisterVendorSaleUseCase,
  ) {}

  async execute(dto: WompiWebhookDto): Promise<{ status: string }> {
    const { transaction } = dto.data;

    const isValid = this.wompiService.validateSignature(
      dto.signature.properties,
      transaction as any,
      dto.timestamp,
      dto.signature.checksum,
    );
    if (!isValid) throw new BadRequestException('Firma del webhook inválida');

    const payment = await this.paymentRepository.findByReference(transaction.reference);
    if (!payment) throw new BadRequestException('Pago no encontrado para esta referencia');

    if (TERMINAL_STATUSES.includes(payment.status)) {
      return { status: payment.status };
    }

    await this.paymentRepository.updateStatus(payment.payment_id!, transaction.status);

    if (transaction.status === 'APPROVED') {
      await this.orderRepository.updateStatus(payment.order_id, 'ACCEPTED');
      await this.registerVendorSale.execute(payment.order_id);
    }

    return { status: transaction.status };
  }
}
