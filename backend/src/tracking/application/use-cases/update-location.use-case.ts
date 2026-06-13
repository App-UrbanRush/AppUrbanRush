import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IGPSRepository } from '../../domain/repositories/gps.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { CourierLocationModel } from '../../domain/entities/courier-location.model';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';
import { UpdateLocationDto } from '../dtos/update-location.dto';

export const GPS_TTL_SECONDS = 30;

@Injectable()
export class UpdateLocationUseCase {
  constructor(
    @Inject('IGPSRepository')
    private readonly gpsRepo: IGPSRepository,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
  ) {}

  async execute(userId: number, dto: UpdateLocationDto): Promise<CourierLocationModel> {
    const courier = await this.courierRepo.findOne({ where: { user_id: userId } });
    if (!courier) {
      throw new ForbiddenException('El usuario no es un domiciliario');
    }

    const order = await this.orderRepo.findById(dto.order_id);
    if (!order) throw new NotFoundException('Pedido no encontrado');

    if (order.courier_id !== courier.couriers_id) {
      throw new ForbiddenException('Este pedido no está asignado a ti');
    }

    if (order.status !== 'IN_DELIVERY') {
      throw new BadRequestException(`El pedido debe estar IN_DELIVERY (actual: ${order.status})`);
    }

    const location = new CourierLocationModel(
      userId,
      dto.order_id,
      dto.lat,
      dto.lng,
      dto.accuracy ?? null,
      dto.speed ?? null,
      dto.heading ?? null,
      new Date(),
    );

    await this.gpsRepo.saveLocation(location, GPS_TTL_SECONDS);
    return location;
  }
}
