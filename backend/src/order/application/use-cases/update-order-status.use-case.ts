import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { RegisterCourierEarningUseCase } from 'src/liquidation/application/use-cases/register-courier-earning.use-case';
import { IGPSRepository } from 'src/tracking/domain/repositories/gps.repository.interface';
import { GPSGateway } from 'src/tracking/infrastructure/gateways/gps.gateway';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:     ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:    ['PREPARING'],
  PREPARING:   ['READY'],
  READY:       ['IN_DELIVERY'],
  IN_DELIVERY: ['DELIVERED'],
};

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly registerCourierEarning: RegisterCourierEarningUseCase,
    @Inject('IGPSRepository') private readonly gpsRepo: IGPSRepository,
    private readonly gpsGateway: GPSGateway,
  ) {}

  async execute(orderId: string, newStatus: string, courierId?: number) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Pedido no encontrado');

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`No se puede pasar de ${order.status} a ${newStatus}`);
    }

    const updated = await this.orderRepository.updateStatus(orderId, newStatus, courierId);

    if (newStatus === 'DELIVERED') {
      await this.registerCourierEarning.execute(orderId);

      const finalCourierId = courierId ?? order.courier_id;
      if (finalCourierId !== null && finalCourierId !== undefined) {
        await this.gpsRepo.deleteLocation(finalCourierId);
      }
      this.gpsGateway.closeTrackingRoom(orderId);
    }

    return updated;
  }
}