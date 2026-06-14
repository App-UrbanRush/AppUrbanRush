import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
  ) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Si la orden tiene coordenadas del checkout, usarlas directamente
    if (order.customer_lat != null && order.customer_lng != null) {
      return order;
    }

    // Fallback: coordenadas del registro del cliente (pedidos viejos)
    const customer = await this.peopleRepo.findOne({ where: { user_id: order.user_id } });
    return {
      ...order,
      customer_lat: customer?.latitude || null,
      customer_lng: customer?.longitude || null,
    };
  }
}
