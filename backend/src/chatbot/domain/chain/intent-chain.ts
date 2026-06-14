import { Injectable } from '@nestjs/common';
import { IncomingMessage } from '../entities/chat-message.model';
import { ChatResponse } from '../entities/chat-response.model';
import { IIntentHandler } from '../interfaces/intent-handler.interface';

/**
 * Orquestador del patrón Chain of Responsibility.
 *
 * Recorre todos los handlers registrados EN PARALELO (Promise.all + async),
 * elige el de mayor score y delega. Si nadie supera el umbral, cae al
 * fallback registrado al final.
 *
 * Es Singleton (@Injectable) y se registra en el módulo.
 */
@Injectable()
export class IntentChain {
  private readonly handlers: IIntentHandler[] = [];
  private fallback: IIntentHandler | null = null;
  private static readonly MATCH_THRESHOLD = 0.15;

  register(handler: IIntentHandler): this {
    this.handlers.push(handler);
    return this;
  }

  setFallback(handler: IIntentHandler): this {
    this.fallback = handler;
    return this;
  }

  async resolve(msg: IncomingMessage): Promise<ChatResponse> {
    // Score en paralelo — cada handler es independiente.
    const scored = await Promise.all(
      this.handlers.map(async (h) => ({ handler: h, score: h.matches(msg) })),
    );

    const best = scored
      .filter((s) => s.score >= IntentChain.MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score)[0];

    if (best) {
      const reply = await best.handler.handle(msg);
      return { ...reply, confidence: best.score };
    }

    if (this.fallback) return this.fallback.handle(msg);

    return {
      reply: 'Lo siento, no entendí. ¿Podés reformular?',
      intent: 'unknown',
      confidence: 0,
    };
  }
}
