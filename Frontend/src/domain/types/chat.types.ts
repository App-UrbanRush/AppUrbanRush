export interface ChatMessage {
  message_id: string;
  order_id: string;
  sender_id: number;
  sender_role: string;
  content: string;
  type: string;
  read: boolean;
  created_at: string | null;
}

export type ChatConnectionState = "idle" | "connecting" | "connected" | "disconnected";
