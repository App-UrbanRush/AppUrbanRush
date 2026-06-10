import { Inject, Injectable } from '@nestjs/common';
import { ICourierVendorRequestRepository } from '../../domain/repositories/courier-vendor-request.repository';

@Injectable()
export class GetMyCourierVendorRequestsUseCase {
  constructor(
    @Inject('ICourierVendorRequestRepository')
    private readonly requestRepo: ICourierVendorRequestRepository,
  ) {}

  async execute(courierUserId: number) {
    return this.requestRepo.findByCourierUserId(courierUserId);
  }
}
