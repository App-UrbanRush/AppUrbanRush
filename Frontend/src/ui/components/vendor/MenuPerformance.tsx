import "./MenuPerformance.css";

const MenuPerformance = () => {
  return (
    <div className="menu-performance-section">
      <div className="menu-performance-header">
        <h2>Rendimiento del Menú</h2>
        <button className="view-all-btn" disabled>
          Ver todos →
        </button>
      </div>

      <div className="menu-performance-empty">
        <h3>No hay ventas en los últimos 7 días</h3>
        <p>Los productos más vendidos aparecerán aquí</p>
      </div>
    </div>
  );
};

export default MenuPerformance;