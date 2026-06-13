import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock, Star, Eye, Package, Store } from "lucide-react";
import { vendorsApi, type VendorListItem, type VendorPhotoItem } from "../../../infrastructure/api/vendorsApi";
import { productApi } from "../../../infrastructure/api/productApi";
import type { Product } from "../../../domain/types/product.types";
import Loading from "../../components/Loading/Loading";
import ProductDetailModal from "../../components/ui/ProductDetailModal/ProductDetailModal";
import ImageViewer from "../../components/ui/ImageViewer/ImageViewer";
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

  useEffect(() => {
    loadStoreDetail();
  }, [storeId]);

  useEffect(() => {
    if (vendor) {
      loadPhotos();
      loadProducts();
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
      </div>

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
