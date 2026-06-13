import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderDocument } from '../../../order/infrastructure/schemas/order.schema';
import { CourierEntity } from '../../../courier/infrastructure/persistence/entities/courier.entity';
import { CourierVendorRequestEntity } from '../../../courier-vendor-request/infrastructure/persistence/entities/courier-vendor-request.entity';

@Injectable()
export class GetVendorDashboardStatsUseCase {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
    @InjectRepository(CourierVendorRequestEntity)
    private readonly requestRepo: Repository<CourierVendorRequestEntity>,
  ) {}

  async execute(vendorId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Ventas hoy (pedidos DELIVERED hoy)
    const todayOrders = await this.orderModel.find({
      vendor_id: vendorId,
      status: 'DELIVERED',
      updatedAt: { $gte: today },
    });
    const ventasHoy = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // 2. Pedidos totales
    const pedidosTotales = await this.orderModel.countDocuments({ vendor_id: vendorId });

    // 3. Calificación promedio (no implementado yet)
    const calificacionPromedio = 0;

    // 4. Domiciliarios activos
    const inDeliveryCourierIds = await this.orderModel.distinct('courier_id', {
      vendor_id: vendorId,
      status: 'IN_DELIVERY',
      courier_id: { $ne: null },
    });

    const acceptedRequests = await this.requestRepo.find({
      where: { vendor_id: vendorId, status: 'accepted' },
    });
    const requestCourierIds = acceptedRequests.map(r => r.courier_user_id);

    const allCourierIds = [...new Set([...inDeliveryCourierIds, ...requestCourierIds])];

    let domiciliariosActivos = 0;
    if (allCourierIds.length > 0) {
      const activeCouriers = await this.courierRepo.find({
        where: {
          user_id: In(allCourierIds),
          status: 'ACTIVE',
        },
      });
      domiciliariosActivos = activeCouriers.length;
    }

    return {
      ventasHoy: Math.round(ventasHoy),
      pedidosTotales,
      calificacionPromedio: Math.round(calificacionPromedio * 10) / 10,
      domiciliariosActivos,
    };
  }
}