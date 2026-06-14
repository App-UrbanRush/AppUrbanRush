import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

@Injectable()
export class HelpHandler extends BaseIntentHandler {
  readonly intent = 'help';
  protected readonly keywords = [
    'ayuda', 'help', 'soporte', 'no entiendo', 'que podes hacer',
    'que sabes', 'opciones', 'menu',
  ];
  protected readonly audiences: UserAudience[] = ['GUEST', 'CUSTOMER', 'COURIER', 'VENDOR', 'ADMIN'];

  protected async respond(msg: IncomingMessage): Promise<ChatResponse> {
    const common = [
      { label: 'Cómo pedir', value: '¿Cómo pido?' },
      { label: 'Pagos', value: '¿Cómo pago?' },
      { label: 'Buscar tienda', value: 'busco pizza' },
    ];
    const extra: Record<UserAudience, { label: string; value: string }[]> = {
      GUEST:    [{ label: 'Registrarme', value: 'Quiero registrarme' }],
      CUSTOMER: [{ label: 'Mi pedido', value: 'Estado de mi pedido' }],
      COURIER:  [{ label: 'Liquidaciones', value: 'Liquidaciones' }],
      VENDOR:   [{ label: 'Pedidos pendientes', value: 'Pedidos pendientes' }],
      ADMIN:    [{ label: 'Backups', value: 'Backups' }],
    };

    return {
      reply: 'Puedo ayudarte con: hacer pedidos, buscar tiendas, registrarte, info para domiciliarios/negocios y consultar tu pedido (si estás logueado).',
      intent: this.intent,
      confidence: 0.95,
      quickReplies: [...extra[msg.context.audience], ...common],
    };
  }
}
