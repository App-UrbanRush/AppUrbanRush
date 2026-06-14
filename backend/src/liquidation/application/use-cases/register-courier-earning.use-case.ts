import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICourierEarningRepository } from '../../domain/repositories/courier-earning.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { CourierEarningModel } from '../../domain/entities/courier-earning.model';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';

@Injectable()
export class RegisterCourierEarningUseCase {
  constructor(
    @Inject('ICourierEarningRepository')
    private readonly earningRepo: ICourierEarningRepository,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
  ) {}

  async execute(orderId: string): Promise<CourierEarningModel | null> {
    const order = await this.orderRepo.findById(orderId);
    if (!order || !order.courier_id) return null;

    // Traducir user_id (order.courier_id) a couriers_id
    const courierEntity = await this.courierRepo.findOne({ where: { user_id: order.courier_id } });
    const couriersId = courierEntity?.couriers_id;
    if (!couriersId) return null;

    const existing = await this.earningRepo.findByOrderId(orderId);
    if (existing) return existing;

    const earning = new CourierEarningModel(
      null,
      couriersId,
      orderId,
      order.delivery_fee,
      'PENDING',
      null,
      null,
    );
    return this.earningRepo.create(earning);
  }
}
