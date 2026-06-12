import { Injectable, Inject } from '@nestjs/common';
import { IMessageRepository } from '../../domain/repositories/message.repository.interface';

@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    @Inject('IMessageRepository')
    private readonly messageRepo: IMessageRepository,
  ) {}

  async execute(orderId: string, readerId: number): Promise<{ unread: number }> {
    const unread = await this.messageRepo.countUnread(orderId, readerId);
    return { unread };
  }
}
