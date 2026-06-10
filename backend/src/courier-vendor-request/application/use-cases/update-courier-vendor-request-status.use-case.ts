import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICourierVendorRequestRepository } from '../../domain/repositories/courier-vendor-request.repository';

@Injectable()
export class UpdateCourierVendorRequestStatusUseCase {
  constructor(
    @Inject('ICourierVendorRequestRepository')
    private readonly requestRepo: ICourierVendorRequestRepository,
  ) {}

  async execute(requestId: number, status: string) {
    const found = await this.requestRepo.findById(requestId);
    if (!found) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    await this.requestRepo.updateStatus(requestId, status);
    return { message: `Solicitud ${status}` };
  }
}
