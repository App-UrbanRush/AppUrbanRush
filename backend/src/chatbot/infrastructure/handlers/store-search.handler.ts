import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';
import { SearchIndexService } from 'src/notifications/infrastructure/services/search-index.service';

/**
 * Aprovecha el árbol AVL del SearchIndexService para sugerir tiendas
 * o productos cuando el usuario menciona algo específico (pizza, hamburguesa,
 * el nombre de un local, etc.).
 */
@Injectable()
export class StoreSearchHandler extends BaseIntentHandler {
  readonly intent = 'store_search';
  protected readonly keywords = [
    'buscar', 'busco', 'tienda', 'tiendas', 'restaurante', 'restaurantes',
    'pizza', 'hamburguesa', 'hamburguesas', 'sushi', 'comida', 'pollo',
    'cafe', 'desayuno', 'almuerzo', 'cena', 'recomienda', 'recomiendas',
    'donde compro', 'donde puedo',
  ];
  protected readonly audiences: UserAudience[] = ['GUEST', 'CUSTOMER'];

  constructor(private readonly index: SearchIndexService) {
    super();
  }

  protected async respond(msg: IncomingMessage): Promise<ChatResponse> {
    // Extraer términos relevantes (palabras de 4+ letras que no estén en stopwords)
    const stop = new Set([
      'busco', 'buscar', 'donde', 'puedo', 'compro', 'tienda', 'tiendas',
      'algun', 'algo', 'recomienda', 'recomiendas', 'quiero', 'comer',
      'restaurante', 'restaurantes',
    ]);
    const tokens = this.normalize(msg.text)
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !stop.has(t));

    if (tokens.length === 0) {
      return {
        reply: '🔍 ¿Qué estás buscando? Decime "pizza", "hamburguesa" o el nombre de una tienda.',
        intent: this.intent,
        confidence: 0.5,
        quickReplies: [
          { label: 'Pizza', value: 'busco pizza' },
          { label: 'Hamburguesa', value: 'busco hamburguesa' },
          { label: 'Sushi', value: 'busco sushi' },
        ],
      };
    }

    // Consulta AVL en paralelo para cada token y unión de resultados.
    const all = await Promise.all(tokens.map((t) => this.index.search(t, 5)));
    const seen = new Set<string>();
    const merged = all.flat().filter((r) => {
      const key = `${r.type}-${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);

    if (merged.length === 0) {
      return {
        reply: `No encontré coincidencias para "${tokens.join(' ')}". ¿Probás otra palabra?`,
        intent: this.intent,
        confidence: 0.4,
        actions: [{ label: 'Ver todas las tiendas', type: 'NAVIGATE', target: '/stores' }],
      };
    }

    const list = merged
      .map((r) => `• ${r.name} ${r.type === 'PRODUCT' ? '(producto)' : ''}`)
      .join('\n');

    return {
      reply: `Encontré esto para vos:\n${list}`,
      intent: this.intent,
      confidence: 0.9,
      actions: [{ label: 'Ver tiendas', type: 'NAVIGATE', target: '/stores' }],
      data: { results: merged },
    };
  }
}
