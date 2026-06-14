import { IncomingMessage } from '../entities/chat-message.model';
import { ChatResponse } from '../entities/chat-response.model';

/**
 * Patrón Chain of Responsibility: cada handler decide si "le toca"
 * responder. Si su score supera el umbral del IntentChain, gana;
 * si no, el chain pasa al siguiente.
 */
export interface IIntentHandler {
  /** Nombre legible (útil para logs y la UI). */
  readonly intent: string;

  /**
   * Devuelve un score 0..1 indicando qué tan seguro está el handler
   * de poder responder el mensaje. El IntentChain elige el de score
   * más alto (con desempate por orden de registro).
   */
  matches(msg: IncomingMessage): number;

  /** Genera la respuesta (asíncrono porque puede consultar BD). */
  handle(msg: IncomingMessage): Promise<ChatResponse>;
}
