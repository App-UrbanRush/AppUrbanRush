import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

@Injectable()
export class CourierInfoHandler extends BaseIntentHandler {
  readonly intent = 'courier_info';
  protected readonly keywords = [
    'domiciliario', 'repartidor', 'ser domiciliario', 'aceptar pedido',
    'liquidacion', 'liquidaciones', 'ganancia', 'pago domiciliario',
    'codigo entrega', 'codigo de entrega', 'como confirmar',
  ];
  protected readonly audiences: UserAudience[] = ['GUEST', 'COURIER'];

  protected async respond(msg: IncomingMessage): Promise<ChatResponse> {
    if (msg.context.audience === 'GUEST') {
      return {
        reply: [
          '🛵 ¿Querés ser domiciliario UrbanRush?',
          '• Registrate como Domiciliario',
          '• Subí tus documentos (los guardamos cifrados)',
          '• Una vez aprobado, vas a recibir pedidos en tu panel',
          '• Cobramos por entrega completada, con liquidación quincenal',
        ].join('\n'),
        intent: this.intent,
        confidence: 1,
        actions: [{ label: 'Registrarme', type: 'NAVIGATE', target: '/register-select' }],
      };
    }

    return {
      reply: [
        '📋 Para domiciliarios:',
        '• Los pedidos disponibles aparecen en el panel cuando están en estado READY',
        '• Aceptás → se pone IN_DELIVERY → vas al local → llevás al cliente',
        '• Para confirmar entrega, pedile al cliente el código de 4 dígitos',
        '• Las liquidaciones se calculan automáticamente cada periodo',
      ].join('\n'),
      intent: this.intent,
      confidence: 1,
      actions: [
        { label: 'Mi panel', type: 'NAVIGATE', target: '/courier/dashboard' },
        { label: 'Liquidaciones', type: 'NAVIGATE', target: '/courier/liquidations' },
      ],
    };
  }
}
