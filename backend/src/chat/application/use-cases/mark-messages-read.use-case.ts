import { Injectable, Inject } from '@nestjs/common';
import { IMessageRepository } from '../../domain/repositories/message.repository.interface';

@Injectable()
export class MarkMessagesReadUseCase {
  constructor(
    @Inject('IMessageRepository')
    private readonly messageRepo: IMessageRepository,
  ) {}

  async execute(orderId: string, readerId: number): Promise<void> {
    await this.messageRepo.markAsRead(orderId, readerId);
  }
}
