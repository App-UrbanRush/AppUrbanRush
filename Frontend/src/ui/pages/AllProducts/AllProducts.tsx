import { useState, useEffect } from "react";
import { productApi } from "../../../infrastructure/api/productApi";
import { vendorsApi, type VendorListItem } from "../../../infrastructure/api/vendorsApi";
import type { Product } from "../../../domain/types/product.types";
import ProductDetailModal from "../../components/ui/ProductDetailModal/ProductDetailModal";
import { Package, Search } from "lucide-react";
import "./AllProducts.css";

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, vendorsData] = await Promise.all([
        productApi.getAll(),
        vendorsApi.getAll(),
      ]);
      setProducts(productsData);
      setVendors(vendorsData);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Todos", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const getVendorName = (vendorId: number): string | null => {
    const vendor = vendors.find((v) => v.vendor_id === vendorId);
    return vendor?.business_name || null;
  };

  const filteredProducts = products.filter((p) => {
    if (activeCategory !== "Todos" && p.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="all-products-container">
      <div className="all-products-header">
        <h1>Todos los Productos</h1>
        <p className="all-products-subtitle">{products.length} productos disponibles</p>
      </div>

      <div className="all-products-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="all-products-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`all-products-cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="all-products-loading">Cargando productos...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="all-products-empty">
          <Package size={48} />
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <div className="all-products-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.product_id}
              className="all-products-card"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="all-products-card-img">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="all-products-card-img-placeholder">
                    <Package size={32} />
                  </div>
                )}
                {!product.is_available && (
                  <span className="all-products-card-badge">No disponible</span>
                )}
                {product.is_available && product.stock === 0 && (
                  <span className="all-products-card-badge all-products-card-badge--out">Sin stock</span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="all-products-card-badge all-products-card-badge--low">Últimas</span>
                )}
              </div>
              <div className="all-products-card-body">
                {getVendorName(product.vendor_id) && (
                  <span className="all-products-card-vendor">{getVendorName(product.vendor_id)}</span>
                )}
                <h3>{product.name}</h3>
                {product.description && <p>{product.description}</p>}
                <div className="all-products-card-footer">
                  <span className="all-products-card-price">${product.price.toLocaleString()}</span>
                  <span className="all-products-card-category">{product.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default AllProducts;
