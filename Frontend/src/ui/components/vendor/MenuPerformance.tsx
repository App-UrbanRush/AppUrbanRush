import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { productPerformanceApi } from "../../../infrastructure/api/productPerformanceApi";
import type { ProductPerformance } from "../../../domain/types/product-performance.types";
import "./MenuPerformance.css";

const MenuPerformance = () => {
  const navigate = useNavigate();
  const { vendorProfile } = useAuth();
  const [items, setItems] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorProfile) return;
    fetchPerformance();
  }, [vendorProfile]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!vendorProfile?.vendor_id) {
        setItems([]);
        return;
      }
      const data = await productPerformanceApi.getProductPerformance(vendorProfile.vendor_id, 5, 7);
      setItems(data);
    } catch (err) {
      console.error("Error loading menu performance:", err);
      setError("No se pudieron cargar los datos de rendimiento");
    } finally {
      setLoading(false);
    }
  };

  const maxSold = items.length > 0 ? Math.max(...items.map(i => i.total_sold)) : 1;

  return (
    <div className="menu-performance-section">
      <div className="menu-performance-header">
        <h2>Rendimiento del Menú</h2>
        <button className="view-all-btn" onClick={() => navigate("/vendor/dashboard/menu/catalogo")}>
          Ver todos →
        </button>
      </div>

      {loading && (
        <div className="menu-performance-loading">
          <p>Cargando rendimiento...</p>
        </div>
      )}

      {error && (
        <div className="menu-performance-empty">
          <h3>{error}</h3>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="menu-performance-empty">
          <h3>No hay ventas en los últimos 7 días</h3>
          <p>Los productos más vendidos aparecerán aquí</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="menu-performance-list">
          {items.map((item) => (
            <div key={item.product_id} className="menu-performance-card">
              <div className="menu-performance-card-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <div className="menu-performance-image-placeholder" />
                )}
              </div>
              <div className="menu-performance-card-body">
                <h4 className="menu-performance-card-name">{item.name}</h4>
                <div className="menu-performance-bar-container">
                  <div
                    className="menu-performance-bar-fill"
                    style={{ width: `${(item.total_sold / maxSold) * 100}%` }}
                  />
                </div>
              </div>
              <div className="menu-performance-card-count">
                <span className="menu-performance-count-number">{item.total_sold}</span>
                <span className="menu-performance-count-label">vendidos</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPerformance;
