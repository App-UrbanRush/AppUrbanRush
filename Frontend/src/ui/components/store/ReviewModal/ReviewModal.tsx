import { useState, useEffect } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { reviewApi } from "../../../../infrastructure/api/reviewApi";
import { intelligenceApi } from "../../../../infrastructure/api/intelligenceApi";
import type { OrderDetail } from "../../../infrastructure/api/ordersApi";
import toast from "react-hot-toast";
import "./ReviewModal.css";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
  deliveredOrders: OrderDetail[];
  vendorId: number;
}

const ReviewModal = ({ open, onClose, onReviewSubmitted, deliveredOrders, vendorId }: ReviewModalProps) => {
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingCongruence, setCheckingCongruence] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setReviewedIds(new Set());
      setSelectedOrderId("");
      setRating(0);
      setComment("");
      return;
    }
    const load = async () => {
      try {
        const reviews = await reviewApi.getByStore(vendorId);
        const ids = new Set(reviews.filter((r) => r.order_id).map((r) => r.order_id));
        setReviewedIds(ids);
        const firstUnreviewed = deliveredOrders.find((o) => !ids.has(o.order_id));
        setSelectedOrderId(firstUnreviewed?.order_id || "");
      } catch {
        setReviewedIds(new Set());
      }
    };
    load();
  }, [open, vendorId, deliveredOrders]);

  const selectedOrder = deliveredOrders.find((o) => o.order_id === selectedOrderId);
  const allReviewed = !submitting && deliveredOrders.length > 0 && deliveredOrders.every((o) => reviewedIds.has(o.order_id));

  const handleSubmit = async () => {
    if (!selectedOrderId || rating === 0 || reviewedIds.has(selectedOrderId)) return;
    setCheckingCongruence(true);
    try {
      const result = await intelligenceApi.checkCongruence(rating, comment);
      if (!result.congruent) {
        toast.error(`Tu comentario no coincide con la calificación. Se detectó como "${result.text_sentiment}" pero ${rating} estrellas corresponde a "${result.rating_sentiment}".`);
        return;
      }
    } catch {
      toast.error("No se pudo validar la reseña. Intenta de nuevo.");
      return;
    } finally {
      setCheckingCongruence(false);
    }
    setSubmitting(true);
    try {
      await reviewApi.create({
        vendor_id: selectedOrder!.vendor_id,
        order_id: selectedOrderId,
        rating,
        comment,
      });
      toast.success("Reseña enviada con éxito");
      setRating(0);
      setComment("");
      setSelectedOrderId("");
      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al enviar la reseña";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div className="rm-overlay" onClick={handleOverlayClick}>
      <div className="rm-modal">
        <div className="rm-header">
          <h3>Calificar pedido</h3>
          <button className="rm-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="rm-body">
          {allReviewed ? (
            <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
              Ya calificaste todos tus pedidos.
            </p>
          ) : (
            <>
              <label className="rm-label">Selecciona tu pedido:</label>
              <select
                className="rm-select"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
              >
                {deliveredOrders.map((order) => {
                  const isReviewed = reviewedIds.has(order.order_id);
                  return (
                    <option key={order.order_id} value={order.order_id || ""} disabled={isReviewed}>
                      Pedido #{order.order_id?.slice(-6)} — ${order.total.toLocaleString()} ({order.items.length} p.)
                      {isReviewed ? " (✓ Ya reseñado)" : ""}
                    </option>
                  );
                })}
              </select>

              {selectedOrder && (
                <div className="rm-items">
                  {selectedOrder.items.map((item, i) => (
                    <span key={i} className="rm-item-chip">
                      {item.product_name}
                      {item.quantity > 1 && ` x${item.quantity}`}
                    </span>
                  ))}
                </div>
              )}

              <label className="rm-label">Calificación:</label>
              <div className="rm-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`rm-star-btn ${star <= rating ? "rm-star-btn--active" : ""}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label className="rm-label">Comentario:</label>
              <textarea
                className="rm-textarea"
                placeholder="Escribe tu comentario..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </>
          )}
        </div>

        <div className="rm-actions">
          <button className="rm-btn rm-btn--cancel" onClick={onClose}>
            Cancelar
          </button>
          {!allReviewed && (
            <button
              className="rm-btn rm-btn--submit"
              onClick={handleSubmit}
              disabled={rating === 0 || !selectedOrderId || reviewedIds.has(selectedOrderId) || !comment.trim() || submitting || checkingCongruence}
            >
              {checkingCongruence ? (
                <><Loader2 size={16} className="rm-spinner" /> Validando...</>
              ) : submitting ? (
                <><Loader2 size={16} className="rm-spinner" /> Enviando...</>
              ) : (
                <><Send size={16} /> Enviar reseña</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
