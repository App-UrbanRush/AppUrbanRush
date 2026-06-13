import { Injectable, Inject, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { IProductRepository } from 'src/product/domain/repositories/product.repository.interface';
import { ProductModel } from 'src/product/domain/entities/product.model';
import { WompiService } from '../../infrastructure/services/wompi.service';
import { WompiWebhookDto } from '../dtos/wompi-webhook.dto';
import { RegisterVendorSaleUseCase } from 'src/liquidation/application/use-cases/register-vendor-sale.use-case';

const TERMINAL_STATUSES = ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'];

@Injectable()
export class ConfirmPaymentUseCase {
  private readonly logger = new Logger(ConfirmPaymentUseCase.name);

  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
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
    if (!payment) throw new NotFoundException('Pago no encontrado para esta referencia');

    return this.processPayment(payment, transaction.status);
  }

  async confirmByReference(reference: string): Promise<{ status: string }> {
    const payment = await this.paymentRepository.findByReference(reference);
    if (!payment) throw new NotFoundException('Pago no encontrado para esta referencia');

    return this.processPayment(payment, 'APPROVED');
  }

  private async processPayment(payment: any, newStatus: string): Promise<{ status: string }> {
    if (TERMINAL_STATUSES.includes(payment.status)) {
      return { status: payment.status };
    }

    if (newStatus === 'APPROVED') {
      try {
        const order = await this.orderRepository.findById(payment.order_id);
        if (order) {
          for (const item of order.items) {
            const product = await this.productRepository.findById(item.product_id);
            if (product) {
              const newStock = Math.max(0, product.stock - item.quantity);
              const updateData: Partial<ProductModel> = { stock: newStock };
              if (newStock === 0) updateData.is_available = false;
              await this.productRepository.update(item.product_id, updateData);
              this.logger.log(`Stock actualizado: ${item.product_id} → ${newStock}`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error al descontar stock: ${error.message}`, error.stack);
        throw error;
      }
    }

    await this.paymentRepository.updateStatus(payment.payment_id!, newStatus);

    if (newStatus === 'APPROVED') {
      await this.orderRepository.updateStatus(payment.order_id, 'ACCEPTED');
      await this.registerVendorSale.execute(payment.order_id);
    }

    return { status: newStatus };
  }
}
