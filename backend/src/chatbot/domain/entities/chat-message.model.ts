/**
 * Mensaje entrante al chatbot Urby. El contexto viaja con cada turno
 * porque el bot es stateless en el servidor (la conversación la mantiene
 * el cliente; el servidor solo procesa un turno a la vez).
 */
export type UserAudience = 'GUEST' | 'CUSTOMER' | 'COURIER' | 'VENDOR' | 'ADMIN';

export interface ChatContext {
  audience: UserAudience;
  userId?: number;
  userName?: string;
  activeOrderId?: string;
  /** Lista corta del historial reciente, útil para handlers contextuales. */
  recentMessages?: { from: 'user' | 'bot'; text: string }[];
}

export interface IncomingMessage {
  text: string;
  context: ChatContext;
}
