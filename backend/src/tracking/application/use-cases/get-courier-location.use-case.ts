import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IGPSRepository } from '../../domain/repositories/gps.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { CourierLocationModel } from '../../domain/entities/courier-location.model';

@Injectable()
export class GetCourierLocationUseCase {
  constructor(
    @Inject('IGPSRepository')
    private readonly gpsRepo: IGPSRepository,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
  ) {}

  async executeByOrder(orderId: string, requesterUserId: number, requesterRolIds: number[]): Promise<{
    order_id: string;
    courier_id: number | null;
    status: string;
    location: CourierLocationModel | null;
  }> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundException('Pedido no encontrado');

    const isAdmin = requesterRolIds.includes(1) || requesterRolIds.includes(5);
    const isOwner = order.user_id === requesterUserId;
    const isAssignedCourier =
      requesterRolIds.includes(3) && order.courier_id !== null;
    const isBusiness = requesterRolIds.includes(4);

    if (!isOwner && !isAssignedCourier && !isAdmin && !isBusiness) {
      throw new ForbiddenException('No autorizado a ver el tracking de este pedido');
    }

    if (order.courier_id === null) {
      return { order_id: orderId, courier_id: null, status: order.status, location: null };
    }

    const location = await this.gpsRepo.getLocation(order.courier_id);
    return {
      order_id: orderId,
      courier_id: order.courier_id,
      status: order.status,
      location,
    };
  }

  async executeByCourier(courierId: number): Promise<CourierLocationModel | null> {
    return this.gpsRepo.getLocation(courierId);
  }
}
