import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStoreVerificationRepository } from '../../domain/repositories/store-verification.repository.interface';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';
import { StoreVerificationModel } from '../../domain/entities/store-verification.model';

@Injectable()
export class GetVerificationHistoryUseCase {
  constructor(
    @Inject('IStoreVerificationRepository')
    private readonly verificationRepo: IStoreVerificationRepository,
    @Inject('IVendorRepository')
    private readonly vendorRepo: IVendorRepository,
  ) {}

  async execute(vendorUserId: number): Promise<StoreVerificationModel[]> {
    const vendor = await this.vendorRepo.findByUserId(vendorUserId);
    if (!vendor || !vendor.vendor_id) throw new NotFoundException('Vendor no encontrado');

    return this.verificationRepo.findByVendorId(vendor.vendor_id);
  }
}
