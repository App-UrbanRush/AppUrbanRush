import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

/**
 * Último eslabón de la cadena. Acepta cualquier mensaje (score base
 * mínimo) y responde con sugerencias contextuales.
 */
@Injectable()
export class FallbackHandler extends BaseIntentHandler {
  readonly intent = 'fallback';
  protected readonly keywords = []; // no se invoca por keyword
  protected readonly audiences: UserAudience[] = ['GUEST', 'CUSTOMER', 'COURIER', 'VENDOR', 'ADMIN'];

  matches(_msg: IncomingMessage): number {
    return 0; // nunca compite por match — sólo se usa como fallback explícito
  }

  protected async respond(msg: IncomingMessage): Promise<ChatResponse> {
    const examples: Record<UserAudience, string[]> = {
      GUEST:    ['¿Cómo pido?', '¿Cómo me registro?', 'busco pizza'],
      CUSTOMER: ['Estado de mi pedido', '¿Cómo pago?', 'busco hamburguesa'],
      COURIER:  ['Liquidaciones', 'Código de entrega', 'Cómo aceptar pedido'],
      VENDOR:   ['Pedidos pendientes', 'Agregar producto', 'Mis ventas'],
      ADMIN:    ['Backups', 'Reportes', 'Ir a usuarios'],
    };
    const ex = examples[msg.context.audience];

    return {
      reply: 'No te entendí del todo 🤔. Probá con algo como:',
      intent: this.intent,
      confidence: 0.1,
      quickReplies: ex.map((e) => ({ label: e, value: e })),
    };
  }
}
