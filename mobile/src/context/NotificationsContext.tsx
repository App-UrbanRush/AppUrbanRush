import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { NEST_API } from "../config/env";
import { useAuth } from "../auth/AuthContext";

export interface LiveNotification {
  id: string;
  title: string;
  body: string;
  level: "INFO" | "WARN" | "CRITICAL" | "SUCCESS";
  data?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

interface NotificationsContextType {
  notifications: LiveNotification[];
  unreadCount: number;
  connected: boolean;
  markAllRead: () => void;
  clearOne: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    const socket = io(`${NEST_API}/notifications`, { transports: ["websocket"], reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("register", { userId: user.id });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("notification", (payload: Omit<LiveNotification, "id" | "read">) => {
      setNotifications((prev) => [
        { ...payload, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, read: false },
        ...prev,
      ].slice(0, 50));
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user, token]);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearOne = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, connected, markAllRead, clearOne }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications fuera de NotificationsProvider");
  return ctx;
};
