import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ProcessMessageUseCase } from '../../application/use-cases/process-message.use-case';
import { IncomingMessage } from '../../domain/entities/chat-message.model';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly processMessage: ProcessMessageUseCase) {}

  /**
   * Endpoint público: el chatbot Urby responde sin requerir auth, pero
   * el `context.audience` viene del cliente y dispara respuestas distintas.
   * Rate-limit dedicado para no abusar.
   */
  @Post('ask')
  @Throttle({ medium: { ttl: 60_000, limit: 60 } })
  @ApiOperation({ summary: 'Pregunta al chatbot Urby' })
  async ask(@Body() body: IncomingMessage) {
    return this.processMessage.execute(body);
  }
}
