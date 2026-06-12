import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from 'src/product/domain/repositories/product.repository.interface';
import { FastApiService } from 'src/shared/services/fastapi.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrderModel, OrderItemModel } from '../../domain/entities/order.model';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly fastApiService: FastApiService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderModel & { estimated_delivery?: any }> {
    let subtotal = 0;
    const items: OrderItemModel[] = [];

    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.product_id);
      if (!product) throw new NotFoundException(`Producto ${item.product_id} no encontrado`);

      subtotal += product.price * item.quantity;
      items.push(new OrderItemModel(item.product_id, product.name, item.quantity, product.price));
    }

    const deliveryFee = Number(this.configService.get<string>('DELIVERY_FEE') ?? 3000);
    const commissionRate = Number(this.configService.get<string>('PLATFORM_COMMISSION') ?? 0.15);
    const platformCommission = Math.round(subtotal * commissionRate);
    const total = subtotal + deliveryFee + platformCommission;

    // Código de entrega: 4 dígitos criptográficamente seguros (1000–9999)
    const deliveryCode = randomInt(1000, 10000).toString();

    const order = new OrderModel(
      null,
      dto.user_id,
      dto.vendor_id,
      null,
      'PENDING',
      dto.delivery_address,
      subtotal,
      deliveryFee,
      platformCommission,
      total,
      items,
      null,
      deliveryCode,
      0,
      false,
    );

    const savedOrder = await this.orderRepository.create(order);

    const estimated_delivery = await this.fastApiService.estimateDelivery({
      order_id: savedOrder.order_id!,
      vendor_id: dto.vendor_id,
      delivery_address: dto.delivery_address,
      total_items: items.reduce((sum, i) => sum + i.quantity, 0),
    });

    return { ...savedOrder, estimated_delivery };
  }
}
