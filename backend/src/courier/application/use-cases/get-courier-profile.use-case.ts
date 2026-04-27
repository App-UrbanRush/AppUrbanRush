import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICourierRepository } from '../../domain/repositories/courier.repository';

@Injectable()
export class GetCourierProfileUseCase {
  constructor(
    @Inject('ICourierRepository')
    private readonly courierRepository: ICourierRepository,
  ) {}

  async execute(userId: number) {
    const courier = await this.courierRepository.findByUserId(userId);
    if (!courier) {
      throw new NotFoundException('Perfil de repartidor no encontrado');
    }
    return courier;
  }
}