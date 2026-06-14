import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from 'src/product/domain/repositories/product.repository.interface';

@Injectable()
export class OrderAutoCancelService {
  private readonly logger = new Logger(OrderAutoCancelService.name);

  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  @Cron('*/30 * * * * *')
  async autoCancelExpiredOrders() {
    const cancelCutoff = new Date(Date.now() - 1800000); // 30 minutos

    const toCancel = await this.orderRepository.findPendingOlderThan(cancelCutoff);

    for (const order of toCancel) {
      try {
        await this.orderRepository.updateStatus(order.order_id!, 'CANCELLED');

        for (const item of order.items) {
          const product = await this.productRepository.findById(item.product_id);
          if (product) {
            const restoredStock = product.stock + item.quantity;
            await this.productRepository.update(item.product_id, {
              stock: restoredStock,
              is_available: restoredStock > 0,
            });
          }
        }

        this.logger.log(`Order ${order.order_id} auto-cancelled (pending > 30min)`);
      } catch {
        // Si la transición falla, ignorar
      }
    }

    if (toCancel.length > 0) {
      this.logger.log(`Auto-cancelled ${toCancel.length} expired pending orders`);
    }
  }
}
