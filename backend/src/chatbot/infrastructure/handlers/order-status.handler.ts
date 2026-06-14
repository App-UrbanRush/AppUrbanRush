import { Inject, Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';

const STATUS_LABEL: Record<string, string> = {
  PENDING:     '⏳ Pendiente de aceptación del negocio',
  ACCEPTED:    '✅ Aceptado por el restaurante',
  PREPARING:   '👨‍🍳 En preparación',
  READY:       '📦 Listo para recoger — buscando domiciliario',
  IN_DELIVERY: '🛵 En camino contigo',
  DELIVERED:   '🎉 Entregado',
  CANCELLED:   '❌ Cancelado',
};

@Injectable()
export class OrderStatusHandler extends BaseIntentHandler {
  readonly intent = 'order_status';
  protected readonly keywords = [
    'mi pedido', 'estado pedido', 'donde esta', 'cuanto falta',
    'cuando llega', 'mi orden', 'tracking', 'rastrear',
  ];
  protected readonly audiences: UserAudience[] = ['CUSTOMER'];

  constructor(
    @Inject('IOrderRepository') private readonly orders: IOrderRepository,
  ) {
    super();
  }

  protected async respond(msg: IncomingMessage): Promise<ChatResponse> {
    if (!msg.context.userId) {
      return {
        reply: 'Necesito que estés logueado para consultar el estado de tu pedido.',
        intent: this.intent,
        confidence: 0.7,
        actions: [{ label: 'Iniciar sesión', type: 'NAVIGATE', target: '/login' }],
      };
    }

    try {
      const all = await this.orders.findByUser(msg.context.userId);
      const active = all
        .filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status))
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];

      if (!active) {
        return {
          reply: 'No tenés pedidos activos. ¿Querés explorar tiendas?',
          intent: this.intent,
          confidence: 0.9,
          actions: [{ label: 'Ver tiendas', type: 'NAVIGATE', target: '/tiendas' }],
        };
      }

      const label = STATUS_LABEL[active.status] ?? active.status;
      return {
        reply: `Tu pedido #${String((active as any)._id).slice(-6).toUpperCase()} está: ${label}.`,
        intent: this.intent,
        confidence: 1,
        actions: [
          { label: 'Ver mis pedidos', type: 'NAVIGATE', target: '/mis-pedidos' },
        ],
      };
    } catch {
      return {
        reply: 'No pude consultar tus pedidos ahora. Probá desde la sección "Mis pedidos".',
        intent: this.intent,
        confidence: 0.5,
        actions: [{ label: 'Mis pedidos', type: 'NAVIGATE', target: '/mis-pedidos' }],
      };
    }
  }
}
