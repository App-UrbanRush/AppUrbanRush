import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Clock, Star, Plus, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../context/useCart";
import { useFavorites } from "../../context/useFavorites";
import { useAuth } from "../../context/useAuth";
import { storeReviews, type StoreReview } from "../../../infrastructure/persistence/storeReviews";
import MapModal from "../DeliveryMap/MapModal";
import type { Store, Product } from "../../../domain/types/store.types";
import "./StoreDetailModal.css";

const money = (n: number) => `$${n.toLocaleString("es-CO")}`;
const stars = (n: number) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

interface StoreDetailModalProps {
  store: Store;
  onClose: () => void;
}

const StoreDetailModal = ({ store, onClose }: StoreDetailModalProps) => {
  const { addItem } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { myProfile } = useAuth();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);

  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const photos = store.photos?.length ? store.photos : [store.image];
  const prev = () => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setPhotoIdx((i) => (i + 1) % photos.length);
  const fav = isFavorite(store.id);

  useEffect(() => {
    setReviews(storeReviews.getByStore(store.id));
  }, [store.id]);

  // Auto-avance del carrusel (las flechas/puntos siguen funcionando manualmente)
  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => setPhotoIdx((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(id);
  }, [photos.length]);

  const handleAdd = (product: Product) => {
    addItem(product, { id: store.id, name: store.name });
  };

  const avg = storeReviews.average(store.id, store.rating);

  const submitReview = () => {
    const comment = newComment.trim();
    if (!comment) {
      toast.error("Escribe un comentario para tu reseña");
      return;
    }
    const author = myProfile ? `${myProfile.firstName} ${myProfile.firstLastName}`.trim() : "Invitado";
    storeReviews.add({ storeId: store.id, rating: newRating, comment, author });
    setReviews(storeReviews.getByStore(store.id));
    setNewComment("");
    setNewRating(5);
    toast.success("¡Gracias por tu reseña!");
  };

  return (
    <div className="store-modal-overlay" onClick={onClose}>
      <div className="store-modal" onClick={(e) => e.stopPropagation()}>
        <button className="store-modal-fav" onClick={() => toggle(store.id, store.name)} title="Favorito">
          <Heart size={18} fill={fav ? "#ff3d6e" : "none"} stroke={fav ? "#ff3d6e" : "#fff"} />
        </button>
        <button className="store-modal-close" onClick={onClose}><X size={20} /></button>

        {/* Carrusel de fotos del local */}
        <div className="store-modal-carousel">
          {photos.map((src, i) => (
            <img key={src} src={src} alt={store.name} className={`store-modal-photo ${i === photoIdx ? "active" : ""}`} />
          ))}
          {photos.length > 1 && (
            <>
              <button className="store-modal-nav left" onClick={prev}><ChevronLeft size={22} /></button>
              <button className="store-modal-nav right" onClick={next}><ChevronRight size={22} /></button>
              <div className="store-modal-dots">
                {photos.map((src, i) => (
                  <button key={src} className={`store-modal-dot ${i === photoIdx ? "active" : ""}`} onClick={() => setPhotoIdx(i)} aria-label={`Foto ${i + 1}`} />
                ))}
              </div>
            </>
          )}
          <span className="store-modal-rating-badge">
            <Star size={13} fill="#ffb300" stroke="#ffb300" /> {avg}
          </span>
        </div>

        {/* Info */}
        <div className="store-modal-body">
          <h2 className="store-modal-name">{store.name}</h2>
          <p className="store-modal-desc">{store.description}</p>

          <div className="store-modal-meta">
            <span><MapPin size={15} /> {store.address}</span>
            <span><Clock size={15} /> {store.deliveryTime}</span>
          </div>

          <h3 className="store-modal-menu-title">Menú</h3>
          <div className="store-modal-menu">
            {store.products?.map((p) => (
              <div className="store-menu-item" key={p.id}>
                <img src={p.image} alt={p.name} />
                <div className="store-menu-item-info">
                  <span className="store-menu-item-name">{p.name}</span>
                  <span className="store-menu-item-price">{money(p.price)}</span>
                </div>
                <button className="store-menu-add" onClick={() => handleAdd(p)} aria-label={`Agregar ${p.name}`}>
                  <Plus size={16} /> Agregar
                </button>
              </div>
            ))}
          </div>

          {/* Reseñas */}
          <h3 className="store-modal-menu-title">
            Reseñas
            <span className="store-reviews-avg">
              <Star size={14} fill="#ffb300" stroke="#ffb300" /> {avg} · {reviews.length}
            </span>
          </h3>

          <div className="store-review-form">
            <div className="store-review-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setNewRating(n)} className={`store-review-star ${n <= newRating ? "on" : ""}`}>★</button>
              ))}
            </div>
            <textarea
              className="store-review-input"
              placeholder="Cuéntanos tu experiencia con este negocio…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
            />
            <button className="store-review-submit" onClick={submitReview}>Publicar reseña</button>
          </div>

          {reviews.length > 0 && (
            <div className="store-review-list">
              {reviews.map((r) => (
                <div className="store-review-item" key={r.id}>
                  <div className="store-review-head">
                    <span className="store-review-author">{r.author}</span>
                    <span className="store-review-rating">{stars(r.rating)}</span>
                  </div>
                  <p className="store-review-comment">{r.comment}</p>
                  <span className="store-review-date">{new Date(r.date).toLocaleDateString("es-CO")}</span>
                </div>
              ))}
            </div>
          )}

          <button className="store-modal-btn location" onClick={() => setMapOpen(true)}>
            <MapPin size={17} /> Ver ubicación
          </button>
        </div>
      </div>

      <MapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        center={[store.lat, store.lng]}
        zoom={15}
        locations={[{ id: String(store.id), lat: store.lat, lng: store.lng, address: store.name, status: "pending" }]}
      />
    </div>
  );
};

export default StoreDetailModal;
