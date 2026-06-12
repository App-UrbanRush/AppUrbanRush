import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICourierVendorRequestRepository } from '../../domain/repositories/courier-vendor-request.repository';

@Injectable()
export class DeleteCourierVendorRequestUseCase {
  constructor(
    @Inject('ICourierVendorRequestRepository')
    private readonly requestRepo: ICourierVendorRequestRepository,
  ) {}

  async execute(requestId: number) {
    const found = await this.requestRepo.findById(requestId);
    if (!found) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    await this.requestRepo.delete(requestId);
    return { message: 'Solicitud eliminada' };
  }
}
