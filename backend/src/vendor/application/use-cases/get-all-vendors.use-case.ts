import { Inject, Injectable } from '@nestjs/common';
import { IVendorRepository } from '../../domain/repositories/vendor.repository';

@Injectable()
export class GetAllVendorsUseCase {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
  ) {}

  async execute() {
    return this.vendorRepository.findAll();
  }
}
