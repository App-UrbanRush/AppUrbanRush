import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authLocalStorage } from "../../infrastructure/persistence/authLocalStorage";
import { ChatSocketGateway } from "../../infrastructure/socket/ChatSocketGateway";
import { chatApi } from "../../infrastructure/api/chatApi";
import type { ChatMessage, ChatConnectionState } from "../../domain/types/chat.types";

const TYPING_TIMEOUT = 2500; // ms

/**
 * Hook del chat usuario–domiciliario para un pedido.
 * Solo se conecta cuando `enabled` (pedido en IN_DELIVERY).
 * `isOpen` indica si la ventana está abierta (para marcar leídos vs sumar no leídos).
 */
export function useChat(
  orderId: string | undefined,
  enabled: boolean,
  currentUserId: number,
  isOpen: boolean,
) {
  const gateway = useMemo(() => new ChatSocketGateway(), []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ChatConnectionState>("idle");
  const [otherTyping, setOtherTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [closed, setClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markAllRead = useCallback(() => {
    if (!orderId) return;
    setUnreadCount(0);
    gateway.markRead(orderId);
    chatApi.markRead(orderId).catch(() => {});
  }, [orderId, gateway]);

  useEffect(() => {
    if (!orderId || !enabled) return;
    const token = authLocalStorage.getToken();
    if (!token) {
      setError("Sesión no encontrada");
      return;
    }

    setConnectionState("connecting");

    // Carga inicial por REST (historial + no leídos)
    chatApi.getHistory(orderId).then(setMessages).catch(() => {});
    chatApi.getUnreadCount(orderId).then(setUnreadCount).catch(() => {});

    gateway.connect(token);

    gateway.onConnectionChange((connected) => {
      setConnectionState(connected ? "connected" : "disconnected");
      if (connected) gateway.joinOrder(orderId);
    });
    gateway.onHistory((history) => setMessages(history));
    gateway.onMessage((msg) => {
      setMessages((prev) =>
        prev.some((m) => m.message_id === msg.message_id) ? prev : [...prev, msg],
      );
      if (msg.sender_id !== currentUserId) {
        if (isOpenRef.current) markAllRead();
        else setUnreadCount((n) => n + 1);
      }
    });
    gateway.onTyping((data) => {
      if (data.sender_id === currentUserId) return;
      setOtherTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setOtherTyping(false), TYPING_TIMEOUT);
    });
    gateway.onClosed(() => setClosed(true));
    gateway.onError((data) => setError(data.message));

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      gateway.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, enabled]);

  // Al abrir la ventana, marcar como leídos
  useEffect(() => {
    if (isOpen && enabled) markAllRead();
  }, [isOpen, enabled, markAllRead]);

  const sendMessage = useCallback(
    (content: string) => {
      const text = content.trim();
      if (!orderId || !text) return;
      gateway.sendMessage(orderId, text);
    },
    [orderId, gateway],
  );

  const sendTyping = useCallback(() => {
    if (orderId) gateway.sendTyping(orderId);
  }, [orderId, gateway]);

  return {
    messages,
    sendMessage,
    sendTyping,
    otherTyping,
    connectionState,
    unreadCount,
    closed,
    error,
    markAllRead,
  };
}
