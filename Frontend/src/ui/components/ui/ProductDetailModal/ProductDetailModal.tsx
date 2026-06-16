import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Store, Package, ShoppingCart, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { vendorsApi, type VendorListItem } from "../../../../infrastructure/api/vendorsApi";
import type { Product } from "../../../../domain/types/product.types";
import { useCart } from "../../../context/CartContext";
import { useCartDrawer } from "../../../context/CartDrawerContext";
import ImageViewer from "../ImageViewer/ImageViewer";
import "./ProductDetailModal.css";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openCart } = useCartDrawer();
  const [vendor, setVendor] = useState<VendorListItem | null>(null);
  const [added, setAdded] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const hasNoStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  useEffect(() => {
    loadVendor();
  }, [product.vendor_id]);

  const loadVendor = async () => {
    try {
      const vendors = await vendorsApi.getAll();
      const found = vendors.find((v) => v.vendor_id === product.vendor_id);
      setVendor(found || null);
    } catch {
      setVendor(null);
    }
  };

  const handleAddToCart = useCallback(() => {
    addItem(product, 1);
    setAdded(true);
    toast.success(`${product.name} agregado al carrito`, { icon: "🛒" });
    setTimeout(() => setAdded(false), 1500);
  }, [addItem, product]);

  const handleBuyNow = useCallback(() => {
    addItem(product, 1);
    toast.success(`${product.name} agregado al carrito`, { icon: "🛒" });
    onClose();
    openCart();
  }, [addItem, product, onClose, openCart]);

  const handleGoToStore = useCallback(() => {
    onClose();
    navigate(`/store/${product.vendor_id}`);
  }, [onClose, navigate, product.vendor_id]);

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="product-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="product-modal-banner">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="product-modal-banner-img" onClick={() => setPreviewImage(product.image_url)} />
          ) : (
            <div className="product-modal-banner-placeholder">
              <Package size={48} />
            </div>
          )}
        </div>

        <div className="product-modal-content">
          <div className="product-modal-header">
            <div>
              <h2>{product.name}</h2>
              <span className="product-modal-category">{product.category}</span>
            </div>
            <span className="product-modal-price">${product.price.toLocaleString()}</span>
          </div>

          {product.description && (
            <div className="product-modal-section">
              <h3>Descripción</h3>
              <p className="product-modal-desc">{product.description}</p>
            </div>
          )}

          <div className="product-modal-section">
            <h3>Información del Producto</h3>
            <div className="product-modal-fields">
              {vendor && (
                <div className="product-modal-field product-modal-field--clickable" onClick={handleGoToStore}>
                  <Store size={16} />
                  <div>
                    <span className="product-modal-label">Negocio</span>
                    <span className="product-modal-value">{vendor.business_name}</span>
                  </div>
                </div>
              )}
              <div className="product-modal-field">
                <Package size={16} />
                <div>
                  <span className="product-modal-label">Stock</span>
                  <span className="product-modal-value" style={{ color: hasNoStock ? "#dc2626" : isLowStock ? "#ca8a04" : "#1f2937" }}>
                    {hasNoStock ? "Sin stock" : `${product.stock} unidad${product.stock !== 1 ? "es" : ""}`}
                  </span>
                </div>
              </div>
              <div className="product-modal-field">
                <div className={`product-modal-availability-dot ${!product.is_available || hasNoStock ? "unavailable" : "available"}`} />
                <div>
                  <span className="product-modal-label">Disponibilidad</span>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: hasNoStock ? "#dc2626" : isLowStock ? "#ca8a04" : "#22a44e" }}>
                    {hasNoStock ? "Sin disponibilidad" : isLowStock ? "Últimas unidades" : "Disponible"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="product-modal-actions">
            <button
              className={`product-modal-btn product-modal-btn--add ${added ? "added" : ""}`}
              onClick={handleAddToCart}
              disabled={!product.is_available || hasNoStock}
            >
              <ShoppingCart size={16} />
              {hasNoStock ? "Sin stock" : added ? "✓ Agregado" : "Agregar al carrito"}
            </button>
            <button
              className="product-modal-btn product-modal-btn--buy"
              onClick={handleBuyNow}
              disabled={!product.is_available || hasNoStock}
            >
              <CreditCard size={16} />
              {hasNoStock ? "Sin stock" : "Comprar ahora"}
            </button>
          </div>
        </div>
      </div>

      <ImageViewer imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
};

export default ProductDetailModal;
