import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IVendorRepository } from '../../domain/repositories/vendor.repository';
import { UpdateVendorProfileDto } from '../dts/update-vendor-profile.dto';

@Injectable()
export class UpdateVendorProfileUseCase {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
  ) {}

  async execute(userId: number, dto: UpdateVendorProfileDto) {
    const vendor = await this.vendorRepository.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundException('Perfil de vendedor no encontrado');
    }

    const updated = await this.vendorRepository.save({
      ...vendor,
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.business_hours !== undefined && { business_hours: dto.business_hours }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.description !== undefined && { description: dto.description }),
    });

    return updated;
  }
}
