import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock, Star, Eye, Package, Store, Send, Loader2, Trash2 } from "lucide-react";
import { vendorsApi, type VendorListItem, type VendorPhotoItem } from "../../../infrastructure/api/vendorsApi";
import { productApi } from "../../../infrastructure/api/productApi";
import { reviewApi } from "../../../infrastructure/api/reviewApi";
import { ordersApi } from "../../../infrastructure/api/ordersApi";
import { authLocalStorage } from "../../../infrastructure/persistence/authLocalStorage";
import type { Product } from "../../../domain/types/product.types";
import type { Review, ReviewStats } from "../../../domain/types/review.types";
import type { OrderDetail } from "../../../infrastructure/api/ordersApi";
import Loading from "../../components/Loading/Loading";
import ProductDetailModal from "../../components/ui/ProductDetailModal/ProductDetailModal";
import ReviewModal from "../../components/store/ReviewModal/ReviewModal";
import ImageViewer from "../../components/ui/ImageViewer/ImageViewer";
import toast from "react-hot-toast";
import "./StoreDetail.css";

const StoreDetail = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorListItem | null>(null);
  const [photos, setPhotos] = useState<VendorPhotoItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewImages, setPreviewImages] = useState<{ images: string[]; index: number } | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [deliveredOrders, setDeliveredOrders] = useState<OrderDetail[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const isAuthenticated = !!authLocalStorage.getToken();
  const tokenPayload = isAuthenticated ? JSON.parse(atob(authLocalStorage.getToken()!.split('.')[1])) : null;
  const myUserId = tokenPayload?.user_id;

  useEffect(() => {
    loadStoreDetail();
  }, [storeId]);

  useEffect(() => {
    if (vendor) {
      loadPhotos();
      loadProducts();
      refreshReviewsAndOrders();
    }
  }, [vendor]);

  const loadStoreDetail = async () => {
    try {
      setLoading(true);
      const vendors = await vendorsApi.getAll();
      const foundVendor = vendors.find((v) => v.vendor_id === parseInt(storeId || "0"));
      if (foundVendor) {
        setVendor(foundVendor);
      } else {
        navigate("/stores");
      }
    } catch {
      navigate("/stores");
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    if (!vendor) return;
    try {
      const data = await vendorsApi.getPhotos(vendor.vendor_id);
      setPhotos(data);
    } catch {
      // silently fail
    }
  };

  const loadProducts = async () => {
    if (!vendor) return;
    setLoadingProducts(true);
    try {
      const data = await productApi.getProductsByVendor(vendor.vendor_id);
      setProducts(data);
    } catch {
      // silently fail
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadReviews = async (): Promise<Review[]> => {
    if (!vendor) return [];
    try {
      const [reviewList, stats] = await Promise.all([
        reviewApi.getByStore(vendor.vendor_id),
        reviewApi.getStatsByStore(vendor.vendor_id),
      ]);
      setReviews(reviewList);
      setReviewStats(stats);
      return reviewList;
    } catch {
      return [];
    }
  };

  const loadDeliveredOrders = async (currentReviews: Review[]) => {
    if (!vendor) return;
    setLoadingOrders(true);
    try {
      const token = authLocalStorage.getToken();
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.user_id;
      const allOrders = await ordersApi.getByUser(userId);
      const filtered = allOrders.filter(
        (o) => o.vendor_id === vendor.vendor_id && o.status === 'DELIVERED',
      );
      const reviewedOrderIds = new Set(
        currentReviews.filter((r) => r.order_id).map((r) => r.order_id),
      );
      const unreviewed = filtered.filter((o) => !reviewedOrderIds.has(o.order_id));
      setDeliveredOrders(unreviewed);
    } catch {
      // silently fail
    } finally {
      setLoadingOrders(false);
    }
  };

  const refreshReviewsAndOrders = async () => {
    const reviewList = await loadReviews();
    if (isAuthenticated) {
      await loadDeliveredOrders(reviewList);
    }
  };

  const handleReviewSubmitted = async () => {
    await refreshReviewsAndOrders();
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewApi.remove(reviewId);
      toast.success("Reseña eliminada");
      await refreshReviewsAndOrders();
    } catch {
      toast.error("Error al eliminar la reseña");
    }
  };

  if (loading) {
    return (
      <div className="sd-loading-wrapper">
        <Loading text="Cargando tienda…" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="sd-loading-wrapper">
        <div className="sd-error">
          <Store size={48} strokeWidth={1.5} />
          <h2>Tienda no encontrada</h2>
          <button className="sd-error-btn" onClick={() => navigate("/stores")}>
            Explorar tiendas
          </button>
        </div>
      </div>
    );
  }

  const coverImage = vendor.storefront_image_url || vendor.logo_url;

  return (
    <div className="sd dark-mode-wrapper">
      <button className="sd-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="sd-hero">
        {coverImage ? (
          <img src={coverImage} alt="" className="sd-hero-cover" />
        ) : (
          <div className="sd-hero-cover sd-hero-cover--gradient" />
        )}
        <div className="sd-hero-overlay" />
        <div className="sd-hero-content">
          {vendor.logo_url && (
            <img src={vendor.logo_url} alt="" className="sd-hero-logo" onClick={() => setPreviewImages({ images: [vendor.logo_url!], index: 0 })} />
          )}
          <div className="sd-hero-text">
            <h1 className="sd-hero-name">{vendor.business_name}</h1>
            <p className="sd-hero-type">{vendor.business_type}</p>
          </div>
        </div>
      </div>

      <div className="sd-body">
        <div className="sd-info-grid">
          <div className="sd-info-card">
            <span className="sd-info-icon" style={{ background: "#fff0e6", color: "#e8500a" }}>
              <MapPin size={16} />
            </span>
            <div>
              <span className="sd-info-label">Dirección</span>
              <span className="sd-info-value">{vendor.address}</span>
            </div>
          </div>
          <div className="sd-info-card">
            <span className="sd-info-icon" style={{ background: "#e6f0ff", color: "#3b82f6" }}>
              <Phone size={16} />
            </span>
            <div>
              <span className="sd-info-label">Teléfono</span>
              <span className="sd-info-value">{vendor.phone}</span>
            </div>
          </div>
          {vendor.business_hours && (
            <div className="sd-info-card">
              <span className="sd-info-icon" style={{ background: "#e6ffe6", color: "#10b981" }}>
                <Clock size={16} />
              </span>
              <div>
                <span className="sd-info-label">Horario</span>
                <span className="sd-info-value">{vendor.business_hours}</span>
              </div>
            </div>
          )}
        </div>

        {vendor.description && (
          <div className="sd-section">
            <h3 className="sd-section-title">Acerca de</h3>
            <p className="sd-desc">{vendor.description}</p>
          </div>
        )}

        {photos.length > 0 && (
          <div className="sd-section">
            <h3 className="sd-section-title">
              <Store size={18} />
              Fotos del local
              <span className="sd-section-count">{photos.length} foto{photos.length !== 1 ? "s" : ""}</span>
            </h3>
            <div className="sd-photos-grid">
              {photos.slice(0, 4).map((photo, idx) => {
                const isLast = idx === 3 && photos.length > 4;
                const remaining = photos.length - 4;
                const allUrls = photos.map((p) => p.image_url);
                return (
                  <div key={photo.photo_id} className={`sd-photo-item ${isLast ? "sd-photo-item--more" : ""}`}>
                    <img src={photo.image_url} alt="Foto del local" className="sd-photo-img" onClick={() => setPreviewImages({ images: allUrls, index: idx })} />
                    {isLast && (
                      <div className="sd-photo-more" onClick={() => setPreviewImages({ images: allUrls, index: idx })}>
                        <span className="sd-photo-more-count">+{remaining}</span>
                        <span className="sd-photo-more-label">Ver todas</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="sd-section">
          <div className="sd-section-head">
            <h3 className="sd-section-title">
              <Package size={18} />
              Menú
            </h3>
            {!loadingProducts && (
              <span className="sd-section-count">{products.length} producto{products.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          {loadingProducts ? (
            <div className="sd-products-loading">
              <Loading size="sm" text="Cargando productos…" />
            </div>
          ) : products.length === 0 ? (
            <p className="sd-empty">No hay productos disponibles</p>
          ) : (
            <div className="sd-products-grid">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="sd-product-card"
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="sd-product-img-wrap">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="sd-product-img" />
                    ) : (
                      <div className="sd-product-img-placeholder">
                        <Package size={24} />
                      </div>
                    )}
                    <span className="sd-product-price">${product.price.toLocaleString()}</span>
                    {product.stock === 0 && (
                      <span className="sd-product-badge sd-product-badge--out">Sin stock</span>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="sd-product-badge sd-product-badge--low">Últimas</span>
                    )}
                  </div>
                  <div className="sd-product-body">
                    <h4 className="sd-product-name">{product.name}</h4>
                    <p className="sd-product-desc">{product.description}</p>
                  </div>
                  <button className="sd-product-btn" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}>
                    <Eye size={14} />
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reseñas */}
        <div className="sd-section">
          <div className="sd-section-head">
            <h3 className="sd-section-title">
              <Star size={18} />
              Reseñas
            </h3>
            {reviewStats && (
              <span className="sd-section-count">
                {reviewStats.average_rating > 0 ? (
                  <>
                    <span style={{ color: '#f59e0b' }}>
                      {"\u2605".repeat(Math.round(reviewStats.average_rating))}
                      {"\u2606".repeat(5 - Math.round(reviewStats.average_rating))}
                    </span>
                    {" "}{reviewStats.average_rating.toFixed(1)} ({reviewStats.total_reviews})
                  </>
                ) : (
                  "Sin reseñas"
                )}
              </span>
            )}
            {isAuthenticated && deliveredOrders.length > 0 && (
              <button className="sd-add-review-btn" onClick={() => setShowReviewModal(true)}>
                ✍️ Agregar reseña
              </button>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="sd-reviews-list">
              {reviews.map((review) => (
                <div key={review.review_id} className="sd-review-card">
                  <div className="sd-review-header">
                    <div className="sd-review-avatar">
                      {review.user_avatar ? (
                        <img src={review.user_avatar} alt="" className="sd-review-avatar-img" />
                      ) : (
                        <span className="sd-review-avatar-letter">
                          {review.user_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="sd-review-meta">
                      <span className="sd-review-name">{review.user_name}</span>
                      <span className="sd-review-stars" style={{ color: '#f59e0b', fontSize: '13px' }}>
                        {"\u2605".repeat(review.rating)}
                        {"\u2606".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <span className="sd-review-date">{review.time_ago}</span>
                  </div>
                  {review.items && review.items.length > 0 && (
                    <div className="sd-review-items">
                      {(typeof review.items[0] === 'string'
                        ? (review.items as string[]).map((name) => ({ name, image_url: null }))
                        : review.items as { name: string; image_url: string | null }[]
                      ).map((item, i) => (
                        <button
                          key={i}
                          className="sd-review-item"
                          onClick={() => {
                            const product = products.find((p) => p.name === item.name);
                            if (product) setSelectedProduct(product);
                          }}
                        >
                          {item.image_url && (
                            <img src={item.image_url} alt="" className="sd-review-item-img" />
                          )}
                          {item.name}
                        </button>
                      ))}
                      {review.total > 0 && (
                        <span className="sd-review-total">${review.total.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                  {review.comment && (
                    <p className="sd-review-comment">{review.comment}</p>
                  )}
                  {myUserId === review.user_id && (
                    <button
                      className="sd-review-delete"
                      onClick={() => handleDeleteReview(review.review_id)}
                      title="Eliminar reseña"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {reviews.length === 0 && (
            <p className="sd-empty">No hay reseñas aún. ¡Sé el primero en calificar!</p>
          )}

          {isAuthenticated && !loadingOrders && deliveredOrders.length === 0 && (
            <p className="sd-empty" style={{ fontSize: '13px', marginTop: '8px' }}>
              No tienes pedidos entregados pendientes por calificar.
            </p>
          )}
        </div>
      </div>

      {showReviewModal && vendor && (
        <ReviewModal
          open={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
          deliveredOrders={deliveredOrders}
          vendorId={vendor.vendor_id}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <ImageViewer
        images={previewImages?.images ?? null}
        initialIndex={previewImages?.index ?? 0}
        imageUrl={null}
        onClose={() => setPreviewImages(null)}
      />
    </div>
  );
};

export default StoreDetail;
