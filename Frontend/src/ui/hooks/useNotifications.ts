import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { authLocalStorage } from "../../infrastructure/persistence/authLocalStorage";
import { decodeJwt } from "../../infrastructure/utils/jwtDecoder";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type NotificationLevel = "INFO" | "WARN" | "CRITICAL" | "SUCCESS";

export interface LiveNotification {
  id: string;
  title: string;
  body: string;
  level: NotificationLevel;
  data?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

/**
 * Hook que se suscribe al namespace `/notifications` y mantiene una
 * cola local de notificaciones. Observer pattern del lado cliente.
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = authLocalStorage.getToken();
    if (!token) return;
    const payload = decodeJwt(token);
    if (!payload?.user_id) return;

    const socket = io(`${API_URL}/notifications`, {
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("register", { userId: payload.user_id });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("notification", (payload: Omit<LiveNotification, "id" | "read">) => {
      setNotifications((prev) => [
        {
          ...payload,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          read: false,
        },
        ...prev,
      ].slice(0, 50));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearOne = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, connected, markAllRead, clearOne };
};
