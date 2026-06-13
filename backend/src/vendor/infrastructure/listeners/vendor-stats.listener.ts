import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourierVendorRequestEntity } from '../../../courier-vendor-request/infrastructure/persistence/entities/courier-vendor-request.entity';
import { CourierEntity } from '../../../courier/infrastructure/persistence/entities/courier.entity';
import { Order, OrderDocument } from '../../../order/infrastructure/schemas/order.schema';
import { GPSGateway } from '../../../tracking/infrastructure/gateways/gps.gateway';

export class CourierStatusChangedEvent {
  constructor(
    public readonly courierUserId: number,
    public readonly newStatus: string,
  ) {}
}

@Injectable()
export class VendorStatsListener {
  private readonly logger = new Logger(VendorStatsListener.name);

  constructor(
    @InjectRepository(CourierVendorRequestEntity)
    private readonly requestRepo: Repository<CourierVendorRequestEntity>,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly gpsGateway: GPSGateway,
  ) {}

  @OnEvent('courier.status.changed')
  async handleCourierStatusChanged(event: CourierStatusChangedEvent) {
    try {
      const vendorIds = await this.findAssociatedVendorIds(event.courierUserId);
      if (!vendorIds.length) return;

      for (const vendorId of vendorIds) {
        const stats = await this.computeVendorStats(vendorId);
        this.gpsGateway.emitVendorStatsUpdate(vendorId, stats);
      }
    } catch (error) {
      this.logger.error(`Error procesando cambio de status: ${error.message}`);
    }
  }

  private async findAssociatedVendorIds(courierUserId: number): Promise<number[]> {
    const requests = await this.requestRepo.find({
      where: { courier_user_id: courierUserId, status: 'accepted' },
    });
    const vendorIdsFromRequests = requests.map(r => r.vendor_id);

    const vendorIdsFromOrders = await this.orderModel.distinct('vendor_id', {
      courier_id: courierUserId,
    });

    return [...new Set([...vendorIdsFromRequests, ...vendorIdsFromOrders])];
  }

  private async computeVendorStats(vendorId: number): Promise<{ domiciliariosActivos: number }> {
    const activeCourierIds = await this.orderModel.distinct('courier_id', {
      vendor_id: vendorId,
      status: 'IN_DELIVERY',
      courier_id: { $ne: null },
    });

    const acceptedRequests = await this.requestRepo.find({
      where: { vendor_id: vendorId, status: 'accepted' },
    });
    const requestCourierIds = acceptedRequests.map(r => r.courier_user_id);

    const allCandidateIds = [...new Set([...activeCourierIds, ...requestCourierIds])];

    let domiciliariosActivos = 0;
    if (allCandidateIds.length > 0) {
      const activeCouriers = await this.courierRepo.find({
        where: {
          user_id: In(allCandidateIds),
          status: 'ACTIVE',
        },
      });
      domiciliariosActivos = activeCouriers.length;
    }

    return { domiciliariosActivos };
  }
}
