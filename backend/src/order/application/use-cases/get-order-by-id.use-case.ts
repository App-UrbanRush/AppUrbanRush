import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';
import { VendorEntity } from '../../../vendor/infrastructure/persistence/entities/vendor.entity';
import { CourierEntity } from '../../../courier/infrastructure/persistence/entities/courier.entity';

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
    @InjectRepository(VendorEntity)
    private readonly vendorRepo: Repository<VendorEntity>,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
  ) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Coordenadas del cliente
    let customerLat = order.customer_lat;
    let customerLng = order.customer_lng;
    if (customerLat == null || customerLng == null) {
      const customer = await this.peopleRepo.findOne({ where: { user_id: order.user_id } });
      customerLat = customer?.latitude || null;
      customerLng = customer?.longitude || null;
    }

    // Datos del vendor
    const vendor = await this.vendorRepo.findOne({ where: { vendor_id: order.vendor_id } });

    // Datos del cliente (nombre, celular)
    const customerPeople = await this.peopleRepo.findOne({ where: { user_id: order.user_id } });
    const customerName = customerPeople
      ? `${customerPeople.firstName} ${customerPeople.firstLastName}`
      : null;

    // Datos del courier (si está asignado)
    let courierName: string | null = null;
    let courierPhone: string | null = null;
    let courierVehicleType: string | null = null;
    let courierAvatar: string | null = null;
    if (order.courier_id) {
      const courierEntity = await this.courierRepo.findOne({ where: { couriers_id: order.courier_id } });
      if (courierEntity) {
        const courierPeople = await this.peopleRepo.findOne({ where: { user_id: courierEntity.user_id } });
        courierName = courierPeople ? `${courierPeople.firstName} ${courierPeople.firstLastName}` : null;
        courierPhone = courierPeople?.cellphone || null;
        courierVehicleType = courierEntity.vehicle_type || null;
        courierAvatar = courierEntity.photo_url || null;
      }
    }

    return {
      ...order,
      customer_lat: customerLat,
      customer_lng: customerLng,
      customer_name: customerName,
      customer_phone: customerPeople?.cellphone || null,
      customer_avatar: customerPeople?.avatar_url || null,
      vendor_lat: vendor?.latitude ? Number(vendor.latitude) : null,
      vendor_lng: vendor?.longitude ? Number(vendor.longitude) : null,
      vendor_name: vendor?.business_name || null,
      vendor_address: vendor?.address || null,
      vendor_logo: vendor?.logo_url || null,
      courier_name: courierName,
      courier_phone: courierPhone,
      courier_avatar: courierAvatar,
      courier_vehicle_type: courierVehicleType,
    };
  }
}
