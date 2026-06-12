import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useChat } from "../../hooks/useChat";
import "./ChatWindow.css";

interface ChatWindowProps {
  orderId: string;
  /** true cuando el pedido está en IN_DELIVERY */
  enabled: boolean;
  currentUserId: number;
}

const formatTime = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow = ({ orderId, enabled, currentUserId }: ChatWindowProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    sendTyping,
    otherTyping,
    connectionState,
    unreadCount,
    closed,
  } = useChat(orderId, enabled, currentUserId, open);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping, open]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !enabled || closed) return;
    sendMessage(text);
    setDraft("");
  };

  const inputDisabled = !enabled || closed;
  const placeholder = closed
    ? "El pedido fue entregado — chat cerrado"
    : !enabled
      ? "El chat se habilita cuando el domiciliario esté en camino"
      : "Escribe un mensaje…";

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <MessageCircle size={18} />
              <div>
                <span className="chat-header-title">Chat del pedido</span>
                <span className={`chat-header-status ${connectionState}`}>
                  {connectionState === "connected" ? "En línea" : "Conectando…"}
                </span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chat-body">
            {messages.length === 0 ? (
              <p className="chat-empty">Aún no hay mensajes. ¡Saluda! 👋</p>
            ) : (
              messages.map((m) => {
                const mine = m.sender_id === currentUserId;
                return (
                  <div key={m.message_id} className={`chat-bubble-row ${mine ? "mine" : "other"}`}>
                    <div className="chat-bubble">
                      <span className="chat-bubble-text">{m.content}</span>
                      <span className="chat-bubble-time">{formatTime(m.created_at)}</span>
                    </div>
                  </div>
                );
              })
            )}
            {otherTyping && (
              <div className="chat-bubble-row other">
                <div className="chat-bubble chat-typing">
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              value={draft}
              disabled={inputDisabled}
              placeholder={placeholder}
              onChange={(e) => {
                setDraft(e.target.value);
                if (enabled && !closed) sendTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="chat-send" onClick={handleSend} disabled={inputDisabled || !draft.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button className="chat-launcher" onClick={() => setOpen((o) => !o)}>
        <MessageCircle size={24} />
        {!open && unreadCount > 0 && (
          <span className="chat-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>
    </div>
  );
};

export default ChatWindow;
