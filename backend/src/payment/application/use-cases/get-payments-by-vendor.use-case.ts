import { Injectable, Inject } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';

@Injectable()
export class GetPaymentsByVendorUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(vendorId: number) {
    return this.paymentRepository.findByVendorId(vendorId);
  }
}