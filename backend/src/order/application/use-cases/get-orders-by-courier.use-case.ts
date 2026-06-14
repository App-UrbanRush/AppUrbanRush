import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PeopleEntity } from '../../../people/infrastructure/persistence/entities/people.entity';

@Injectable()
export class GetOrdersByCourierUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @InjectRepository(PeopleEntity)
    private readonly peopleRepo: Repository<PeopleEntity>,
  ) {}
  
  async execute(courierId: number) {
    const orders = await this.orderRepository.findByCourier(courierId);
    
    return Promise.all(
      orders.map(async (order) => {
        const customer = await this.peopleRepo.findOne({ where: { user_id: order.user_id } });
        
        return {
          ...order,
          customer_lat: order.customer_lat ?? customer?.latitude ?? null,
          customer_lng: order.customer_lng ?? customer?.longitude ?? null,
          customer_name: customer ? `${customer.firstName} ${customer.firstLastName}` : 'Cliente',
          customer_phone: customer?.cellphone || null,
        };
      })
    );
  }
}
