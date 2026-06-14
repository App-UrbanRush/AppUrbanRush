import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

@Injectable()
export class GreetingHandler extends BaseIntentHandler {
  readonly intent = 'greeting';
  protected readonly keywords = [
    'hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes',
    'buenas noches', 'hey', 'que tal', 'saludos',
  ];
  protected readonly audiences: UserAudience[] = ['GUEST', 'CUSTOMER', 'COURIER', 'VENDOR', 'ADMIN'];

  protected async respond(msg: IncomingMessage): Promise<ChatResponse> {
    const name = msg.context.userName?.split(' ')[0];
    const greet = name ? `¡Hola ${name}!` : '¡Hola!';

    const byRole: Record<UserAudience, { reply: string; quick: string[] }> = {
      GUEST: {
        reply: `${greet} Soy Urby, el asistente de UrbanRush 🛵. Puedo ayudarte a explorar tiendas, crear tu cuenta o entender cómo pedir.`,
        quick: ['Ver tiendas', 'Cómo registrarme', '¿Cuánto cuesta el envío?'],
      },
      CUSTOMER: {
        reply: `${greet} ¿En qué te ayudo hoy? Puedo darte el estado de tu pedido o ayudarte a encontrar algo rico.`,
        quick: ['Estado de mi pedido', 'Buscar tienda', '¿Cómo pago?'],
      },
      COURIER: {
        reply: `${greet} Listo para repartir. ¿Necesitás info sobre liquidaciones, cómo aceptar un pedido o el código de entrega?`,
        quick: ['Liquidaciones', 'Código de entrega', 'Cómo aceptar pedido'],
      },
      VENDOR: {
        reply: `${greet} ¿Querés ver pedidos pendientes, gestionar productos o consultar tu liquidación?`,
        quick: ['Pedidos pendientes', 'Agregar producto', 'Mis ventas'],
      },
      ADMIN: {
        reply: `${greet} Panel admin: usuarios, archivos cifrados, backups o reportes. ¿Qué necesitás?`,
        quick: ['Ir a usuarios', 'Backups', 'Reportes'],
      },
    };

    const { reply, quick } = byRole[msg.context.audience];
    return {
      reply,
      intent: this.intent,
      confidence: 1,
      quickReplies: quick.map((q) => ({ label: q, value: q })),
    };
  }
}
