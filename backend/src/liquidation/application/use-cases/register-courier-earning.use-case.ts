import { Injectable, Inject } from '@nestjs/common';
import { ICourierEarningRepository } from '../../domain/repositories/courier-earning.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { CourierEarningModel } from '../../domain/entities/courier-earning.model';

@Injectable()
export class RegisterCourierEarningUseCase {
  constructor(
    @Inject('ICourierEarningRepository')
    private readonly earningRepo: ICourierEarningRepository,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string): Promise<CourierEarningModel | null> {
    const order = await this.orderRepo.findById(orderId);
    if (!order || !order.courier_id) return null;

    const existing = await this.earningRepo.findByOrderId(orderId);
    if (existing) return existing;

    const earning = new CourierEarningModel(
      null,
      order.courier_id,
      orderId,
      order.delivery_fee,
      'PENDING',
      null,
      null,
    );
    return this.earningRepo.create(earning);
  }
}
