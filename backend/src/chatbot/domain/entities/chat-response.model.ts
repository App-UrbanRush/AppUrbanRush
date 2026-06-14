/**
 * Respuesta del chatbot. Soporta texto + sugerencias rápidas (quick
 * replies) + acciones (links a páginas/acciones del frontend).
 */
export interface QuickReply {
  label: string;
  /** Si el cliente la elige, este texto vuelve como `text` del próximo turno. */
  value: string;
}

export interface ChatAction {
  label: string;
  type: 'NAVIGATE' | 'OPEN_MODAL';
  target: string; // path o nombre del modal
}

export interface ChatResponse {
  reply: string;
  intent: string;
  confidence: number; // 0..1
  quickReplies?: QuickReply[];
  actions?: ChatAction[];
  data?: Record<string, unknown>;
}
