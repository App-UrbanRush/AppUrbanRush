import { IncomingMessage, UserAudience } from '../entities/chat-message.model';
import { ChatResponse } from '../entities/chat-response.model';
import { IIntentHandler } from '../interfaces/intent-handler.interface';

/**
 * Template Method para handlers: define cómo se calcula el match
 * (palabras clave + multiplicador por audiencia) y deja a la subclase
 * solo los datos (keywords, audiencias permitidas) y el `respond()`.
 */
export abstract class BaseIntentHandler implements IIntentHandler {
  abstract readonly intent: string;
  protected abstract readonly keywords: string[];
  protected abstract readonly audiences: UserAudience[];

  /** Template method — orquesta el cálculo de score. */
  matches(msg: IncomingMessage): number {
    if (!this.audiences.includes(msg.context.audience)) return 0;
    const text = this.normalize(msg.text);
    const tokens = text.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return 0;

    let hits = 0;
    for (const kw of this.keywords) {
      const nkw = this.normalize(kw);
      if (text.includes(nkw)) hits += nkw.includes(' ') ? 2 : 1;
    }
    if (hits === 0) return 0;

    // Score 0..1 escalado: con 2 keywords ya queda alto.
    return Math.min(1, hits / 3);
  }

  /** Subclase implementa solo la respuesta. */
  async handle(msg: IncomingMessage): Promise<ChatResponse> {
    return this.respond(msg);
  }

  protected abstract respond(msg: IncomingMessage): Promise<ChatResponse>;

  protected normalize(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[¿?¡!.,;:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
