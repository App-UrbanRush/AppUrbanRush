import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ICourierVendorRequestRepository } from '../../domain/repositories/courier-vendor-request.repository';

@Injectable()
export class SendCourierVendorRequestUseCase {
  constructor(
    @Inject('ICourierVendorRequestRepository')
    private readonly requestRepo: ICourierVendorRequestRepository,
  ) {}

  async execute(courierUserId: number, vendorId: number) {
    const existing = await this.requestRepo.findByCourierAndVendor(courierUserId, vendorId);
    if (existing) {
      if (existing.status === 'rejected') {
        await this.requestRepo.delete(existing.id!);
      } else {
        throw new BadRequestException('Ya enviaste una solicitud a este negocio');
      }
    }
    return this.requestRepo.create(courierUserId, vendorId);
  }
}
