import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

@Injectable()
export class VendorInfoHandler extends BaseIntentHandler {
  readonly intent = 'vendor_info';
  protected readonly keywords = [
    'negocio', 'mi local', 'mi tienda', 'agregar producto', 'gestionar productos',
    'mis ventas', 'pedidos pendientes', 'liquidacion negocio', 'vender',
  ];
  protected readonly audiences: UserAudience[] = ['GUEST', 'VENDOR'];

  protected async respond(msg: IncomingMessage): Promise<ChatResponse> {
    if (msg.context.audience === 'GUEST') {
      return {
        reply: [
          '🏪 ¿Querés vender en UrbanRush?',
          '• Registrate como Negocio',
          '• Cargá info del local, fotos y productos',
          '• Aprobamos tu registro y empezás a recibir pedidos',
        ].join('\n'),
        intent: this.intent,
        confidence: 1,
        actions: [{ label: 'Registrar negocio', type: 'NAVIGATE', target: '/register-select' }],
      };
    }

    return {
      reply: [
        '🏪 Panel de tu negocio:',
        '• Ver pedidos entrantes (PENDING → ACCEPT → PREPARING → READY)',
        '• Gestionar productos en el menú',
        '• Consultar liquidación y rendimiento',
      ].join('\n'),
      intent: this.intent,
      confidence: 1,
      actions: [
        { label: 'Mi panel', type: 'NAVIGATE', target: '/vendor/dashboard' },
        { label: 'Mis productos', type: 'NAVIGATE', target: '/vendor/products' },
      ],
    };
  }
}
