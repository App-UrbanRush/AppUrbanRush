import type { ChatMessage } from "../types/chat.types";

/**
 * Contrato del transporte de chat en tiempo real.
 * Abstrae socket.io (namespace /chat). Implementado por ChatSocketGateway.
 */
export interface IChatGateway {
  connect(token: string): void;
  disconnect(): void;
  isConnected(): boolean;

  /** Unirse a la sala del pedido (el backend responde con el historial) */
  joinOrder(orderId: string): void;
  /** Enviar un mensaje de texto */
  sendMessage(orderId: string, content: string): void;
  /** Avisar que el usuario está escribiendo */
  sendTyping(orderId: string): void;
  /** Marcar como leídos los mensajes recibidos */
  markRead(orderId: string): void;

  onHistory(cb: (messages: ChatMessage[]) => void): void;
  onMessage(cb: (message: ChatMessage) => void): void;
  onTyping(cb: (data: { order_id: string; sender_id: number }) => void): void;
  onUnread(cb: (data: { order_id: string; sender_id: number }) => void): void;
  onClosed(cb: (data: { order_id: string; message: string }) => void): void;
  onError(cb: (data: { message: string }) => void): void;
  onConnectionChange(cb: (connected: boolean) => void): void;
}
