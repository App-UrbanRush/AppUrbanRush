import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from 'src/product/domain/repositories/product.repository.interface';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrderModel, OrderItemModel } from '../../domain/entities/order.model';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderModel> {
    let total = 0;
    const items: OrderItemModel[] = [];

    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.product_id);
      if (!product) throw new NotFoundException(`Producto ${item.product_id} no encontrado`);

      total += product.price * item.quantity;
      items.push(new OrderItemModel(item.product_id, product.name, item.quantity, product.price));
    }

    const order = new OrderModel(null, dto.user_id, dto.vendor_id, null, 'PENDING', dto.delivery_address, total, items, null);
    return this.orderRepository.create(order);
  }
}