import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

@Injectable()
export class HowToOrderHandler extends BaseIntentHandler {
  readonly intent = 'how_to_order';
  protected readonly keywords = [
    'como pedir', 'como pido', 'hacer pedido', 'comprar', 'ordenar',
    'pasos pedido', 'como ordenar', 'pedir comida', 'como funciona',
  ];
  protected readonly audiences: UserAudience[] = ['GUEST', 'CUSTOMER'];

  protected async respond(_msg: IncomingMessage): Promise<ChatResponse> {
    return {
      reply: [
        '📋 Pedir es fácil:',
        '1. Explorá la lista de tiendas',
        '2. Abrí el local y agregá productos al carrito',
        '3. Tocá "Pagar ahora" en el carrito',
        '4. Confirmá tu dirección y pagás (modo demo)',
        '5. Te llega el código de 4 dígitos para entregarle al domiciliario',
      ].join('\n'),
      intent: this.intent,
      confidence: 1,
      quickReplies: [
        { label: 'Ver tiendas', value: 'Ver tiendas' },
        { label: '¿Cómo pago?', value: '¿Cómo pago?' },
      ],
      actions: [
        { label: 'Ir a tiendas', type: 'NAVIGATE', target: '/stores' },
      ],
    };
  }
}
