import { Injectable, Inject } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';

@Injectable()
export class GetPaymentsByUserUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(userId: number) {
    return this.paymentRepository.findByUserId(userId);
  }
}