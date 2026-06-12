import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../../domain/types/product.types";
import ProductDetailModal from "../ui/ProductDetailModal/ProductDetailModal";

interface RecommendedProductsProps {
  products: Product[];
}

const RecommendedProducts = ({ products }: RecommendedProductsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section style={{ marginTop: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', margin: 0 }}>Recomendados para Ti</h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {["left", "right"].map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir as "left" | "right")}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                border: '1px solid #ddd', background: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', color: '#555', lineHeight: 1,
              }}
            >
              {dir === "left" ? "\u2039" : "\u203A"}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ color: '#666', fontSize: '14px' }}>No hay productos</div>
      ) : (
        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px' }}
        >
          {products.map((product) => (
            <div
              key={product.product_id}
              onClick={() => setSelectedProduct(product)}
              style={{
                flexShrink: 0,
                width: '220px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #f0f0f0',
                background: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '260px',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '100%', height: '130px', overflow: 'hidden' }}>
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=280&fit=crop'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div>
                  <h3 style={{ fontSize: '14px', margin: '0 0 4px', color: '#111' }}>{product.name}</h3>
                  <p style={{ fontSize: '12px', margin: 0, color: '#555', lineHeight: 1.4, minHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.description}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#e8500a' }}>${product.price.toLocaleString()}</span>
                  <span style={{ fontSize: '11px', color: product.is_available ? '#22a44e' : '#c53030' }}>
                    {product.is_available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {products.length > 4 && (
            <button
              type="button"
              onClick={() => navigate('/products')}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                width: '220px',
                borderRadius: '16px',
                border: '1px dashed #ccc',
                background: '#fff',
                color: '#333',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                minHeight: '260px',
                transition: 'background 0.18s ease',
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fafafa'; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
            >
              <span style={{ fontSize: '48px', lineHeight: '1' }}>+</span>
              <span>Ver más</span>
            </button>
          )}
        </div>
      )}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};

export default RecommendedProducts;
