import type { Product } from "../../../domain/types/product.types";
import { Pencil, Trash2 } from "lucide-react";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const hasImage = product.image_url && product.image_url.trim() !== "";

  return (
    <div className="product-card">
      <div className="product-price-row">
        <span className="product-price">${product.price.toLocaleString()}</span>
        <span className="product-stock">Stock: {product.stock}</span>
      </div>
      
      <div className={`product-image-container ${!hasImage ? "no-image" : ""}`}>
        {hasImage ? (
          <img src={product.image_url || undefined} alt={product.name} className="product-image" />
        ) : (
          <div className="product-image-placeholder"></div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
      </div>

      <div className="product-actions">
        <button className="product-action-btn edit-btn" onClick={() => onEdit?.(product)}>
          <Pencil size={16} />
        </button>
        <button className="product-action-btn delete-btn" onClick={() => onDelete?.(product)}>
          <Trash2 size={16} />
        </button>
      </div>

      {!product.is_available && (
        <div className="product-unavailable-badge">No disponible</div>
      )}
    </div>
  );
};

export default ProductCard;