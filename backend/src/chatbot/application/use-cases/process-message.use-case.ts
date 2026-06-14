import { Injectable } from '@nestjs/common';
import { IntentChain } from '../../domain/chain/intent-chain';
import { IncomingMessage } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

@Injectable()
export class ProcessMessageUseCase {
  constructor(private readonly chain: IntentChain) {}

  async execute(msg: IncomingMessage): Promise<ChatResponse> {
    const text = msg.text?.trim() ?? '';
    if (!text) {
      return {
        reply: 'Escribí algo y te ayudo 🙂',
        intent: 'empty',
        confidence: 0,
      };
    }
    return this.chain.resolve(msg);
  }
}
