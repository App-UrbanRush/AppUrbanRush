import { useRef, useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { useNotifications, type LiveNotification } from "../../hooks/useNotifications";
import "./NotificationBell.css";

const levelColor: Record<LiveNotification["level"], string> = {
  INFO: "#5b8def",
  WARN: "#ff9800",
  CRITICAL: "#e53935",
  SUCCESS: "#22c55e",
};

const NotificationBell = () => {
  const { notifications, unreadCount, connected, markAllRead, clearOne } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) setTimeout(markAllRead, 800);
  };

  return (
    <div className="notification-bell-wrapper" ref={ref}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={toggle}
        title={connected ? "Notificaciones en vivo" : "Sin conexión"}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
        <span
          className={`notification-bell-status ${connected ? "online" : "offline"}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="notification-bell-panel">
          <div className="notification-bell-head">
            <strong>Notificaciones</strong>
            <button onClick={markAllRead} className="notification-bell-mark">
              <Check size={14} /> Marcar leídas
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="notification-bell-empty">
              <Bell size={28} />
              <p>Sin notificaciones aún</p>
            </div>
          ) : (
            <ul className="notification-bell-list">
              {notifications.map((n) => (
                <li key={n.id} className={`notification-bell-item ${n.read ? "" : "unread"}`}>
                  <span
                    className="notification-bell-dot"
                    style={{ background: levelColor[n.level] }}
                  />
                  <div className="notification-bell-content">
                    <div className="notification-bell-title">{n.title}</div>
                    <p className="notification-bell-body">{n.body}</p>
                    <span className="notification-bell-time">
                      {new Date(n.createdAt).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => clearOne(n.id)}
                    className="notification-bell-close"
                    aria-label="Quitar"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
