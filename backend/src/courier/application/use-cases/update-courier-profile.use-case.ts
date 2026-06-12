import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICourierRepository } from '../../domain/repositories/courier.repository';

@Injectable()
export class UpdateCourierProfileUseCase {
  constructor(
    @Inject('ICourierRepository')
    private readonly courierRepository: ICourierRepository,
  ) {}

  async execute(userId: number, data: { vehicle_type?: string; vehicle_plate?: string; soat_number?: string; photo_url?: string; status?: string }) {
    const courier = await this.courierRepository.findByUserId(userId);
    if (!courier) {
      throw new NotFoundException('Perfil de repartidor no encontrado');
    }
    return this.courierRepository.updateProfile(userId, data);
  }
}
