import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { IReviewRepository } from '../../domain/repositories/review.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { CreateReviewDto } from '../dtos/create-review.dto';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(userId: number, dto: CreateReviewDto) {
    const { vendor_id, rating, comment } = dto;

    let items: { name: string; image_url: string | null }[] = [];
    let total = 0;

    if (dto.order_id) {
      const order = await this.orderRepository.findById(dto.order_id);
      if (!order) {
        throw new BadRequestException('La orden no existe');
      }

      if (order.vendor_id !== vendor_id) {
        throw new BadRequestException('La orden no pertenece a este negocio');
      }

      if (order.user_id !== userId) {
        throw new ForbiddenException('No puedes calificar una orden que no te pertenece');
      }

      if (order.status !== 'DELIVERED') {
        throw new BadRequestException('Solo puedes calificar órdenes entregadas');
      }

      const existing = await this.reviewRepository.findByOrderId(dto.order_id);
      if (existing) {
        throw new BadRequestException('Ya calificaste esta orden');
      }

      items = order.items.map((i) => ({ name: i.product_name, image_url: i.image_url }));
      total = order.total;
    }

    return this.reviewRepository.create({
      vendor_id,
      user_id: userId,
      order_id: dto.order_id || null,
      rating,
      comment: comment || '',
      items,
      total,
    });
  }
}
