import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IVendorRepository } from '../../domain/repositories/vendor.repository';

@Injectable()
export class GetVendorProfileUseCase {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
  ) {}

  async execute(userId: number) {
    const vendor = await this.vendorRepository.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundException('Perfil de vendedor no encontrado');
    }
    return vendor;
  }
}