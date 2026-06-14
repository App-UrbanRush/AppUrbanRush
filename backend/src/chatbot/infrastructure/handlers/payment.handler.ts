import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

@Injectable()
export class PaymentHandler extends BaseIntentHandler {
  readonly intent = 'payment_info';
  protected readonly keywords = [
    'pago', 'pagar', 'pagos', 'metodo pago', 'como pago', 'wompi',
    'tarjeta', 'efectivo', 'cobran', 'precio envio', 'costo envio',
  ];
  protected readonly audiences: UserAudience[] = ['GUEST', 'CUSTOMER'];

  protected async respond(_msg: IncomingMessage): Promise<ChatResponse> {
    return {
      reply: [
        '💳 Pagos en UrbanRush:',
        '• Aceptamos tarjeta vía Wompi (modo demo en desarrollo)',
        '• El costo de envío depende de la distancia',
        '• El total final se muestra antes de confirmar el pedido',
      ].join('\n'),
      intent: this.intent,
      confidence: 1,
      quickReplies: [
        { label: 'Ver tiendas', value: 'Ver tiendas' },
        { label: '¿Cómo pido?', value: '¿Cómo pido?' },
      ],
    };
  }
}
