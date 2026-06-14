import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  chatbotApi,
  type ChatContext,
  type ChatResponse,
  type UserAudience,
} from "../../../infrastructure/api/chatbotApi";
import "./ChatbotWidget.css";

interface ChatTurn {
  id: string;
  from: "user" | "bot";
  text: string;
  quickReplies?: { label: string; value: string }[];
  actions?: { label: string; type: "NAVIGATE" | "OPEN_MODAL"; target: string }[];
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const audienceFromRole = (role?: string, isAuth?: boolean): UserAudience => {
  if (!isAuth) return "GUEST";
  switch (role) {
    case "Domiciliario": return "COURIER";
    case "Negocio":      return "VENDOR";
    case "Administrador":
    case "SuperAdmin":   return "ADMIN";
    default:             return "CUSTOMER";
  }
};

const ChatbotWidget = () => {
  const { isAuthenticated, user, myProfile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const audience = useMemo<UserAudience>(
    () => audienceFromRole(user?.role, isAuthenticated),
    [user?.role, isAuthenticated],
  );

  // Saludo inicial al abrir por primera vez.
  useEffect(() => {
    if (!open || turns.length > 0) return;
    setTurns([{
      id: newId(),
      from: "bot",
      text: "¡Hola! Soy Urby 🛵, el asistente de UrbanRush. ¿En qué te ayudo?",
      quickReplies: [
        { label: "¿Cómo pido?", value: "¿Cómo pido?" },
        { label: "Buscar tienda", value: "busco pizza" },
        ...(isAuthenticated
          ? [{ label: "Estado de mi pedido", value: "Estado de mi pedido" }]
          : [{ label: "Cómo registrarme", value: "Cómo me registro" }]),
      ],
    }]);
  }, [open, turns.length, isAuthenticated]);

  // Auto-scroll al fondo en cada mensaje nuevo.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;

    setTurns((prev) => [...prev, { id: newId(), from: "user", text: clean }]);
    setInput("");
    setBusy(true);

    const context: ChatContext = {
      audience,
      userId: user?.id ? Number(user.id) : undefined,
      userName: myProfile ? `${myProfile.firstName} ${myProfile.firstLastName}` : undefined,
      recentMessages: turns.slice(-6).map((t) => ({ from: t.from, text: t.text })),
    };

    try {
      const res: ChatResponse = await chatbotApi.ask(clean, context);
      setTurns((prev) => [...prev, {
        id: newId(),
        from: "bot",
        text: res.reply,
        quickReplies: res.quickReplies,
        actions: res.actions,
      }]);
    } catch {
      setTurns((prev) => [...prev, {
        id: newId(),
        from: "bot",
        text: "Uy, no pude responder ahora. Intentá de nuevo en un momento.",
      }]);
    } finally {
      setBusy(false);
    }
  };

  const handleAction = (target: string, type: "NAVIGATE" | "OPEN_MODAL") => {
    if (type === "NAVIGATE") {
      setOpen(false);
      navigate(target);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-fab ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chatbot"
        title="Asistente Urby"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Asistente Urby">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🛵</div>
            <div>
              <strong>Urby</strong>
              <span className="chatbot-status">Asistente UrbanRush · en línea</span>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages" ref={listRef}>
            {turns.map((t) => (
              <div key={t.id} className={`chatbot-msg ${t.from}`}>
                <div className="chatbot-bubble">
                  {t.text.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                {t.actions && t.actions.length > 0 && (
                  <div className="chatbot-actions">
                    {t.actions.map((a, i) => (
                      <button
                        key={i}
                        type="button"
                        className="chatbot-action-btn"
                        onClick={() => handleAction(a.target, a.type)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
                {t.quickReplies && t.quickReplies.length > 0 && (
                  <div className="chatbot-quick">
                    {t.quickReplies.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        className="chatbot-quick-btn"
                        onClick={() => send(q.value)}
                        disabled={busy}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="chatbot-msg bot">
                <div className="chatbot-bubble chatbot-typing">
                  <Loader2 size={14} className="spin" /> Urby está escribiendo...
                </div>
              </div>
            )}
          </div>

          <form
            className="chatbot-input"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <input
              type="text"
              placeholder="Escribí tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              maxLength={300}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
