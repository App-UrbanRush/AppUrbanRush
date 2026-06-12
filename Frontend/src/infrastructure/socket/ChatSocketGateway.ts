import { io, type Socket } from "socket.io-client";
import type { IChatGateway } from "../../domain/interfaces/IChatGateway";
import type { ChatMessage } from "../../domain/types/chat.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * INFRASTRUCTURE - Adaptador de socket.io-client al contrato IChatGateway.
 * Se conecta al namespace /chat del backend.
 */
export class ChatSocketGateway implements IChatGateway {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(`${API_URL}/chat`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  joinOrder(orderId: string): void {
    this.socket?.emit("chat:join", { order_id: orderId });
  }

  sendMessage(orderId: string, content: string): void {
    this.socket?.emit("chat:message", { order_id: orderId, content, type: "TEXT" });
  }

  sendTyping(orderId: string): void {
    this.socket?.emit("chat:typing", { order_id: orderId });
  }

  markRead(orderId: string): void {
    this.socket?.emit("chat:read", { order_id: orderId });
  }

  onHistory(cb: (messages: ChatMessage[]) => void): void {
    this.socket?.on("chat:history", cb);
  }

  onMessage(cb: (message: ChatMessage) => void): void {
    this.socket?.on("chat:message", cb);
  }

  onTyping(cb: (data: { order_id: string; sender_id: number }) => void): void {
    this.socket?.on("chat:typing", cb);
  }

  onUnread(cb: (data: { order_id: string; sender_id: number }) => void): void {
    this.socket?.on("chat:unread", cb);
  }

  onClosed(cb: (data: { order_id: string; message: string }) => void): void {
    this.socket?.on("chat:closed", cb);
  }

  onError(cb: (data: { message: string }) => void): void {
    this.socket?.on("error", cb);
  }

  onConnectionChange(cb: (connected: boolean) => void): void {
    this.socket?.on("connect", () => cb(true));
    this.socket?.on("disconnect", () => cb(false));
  }
}
