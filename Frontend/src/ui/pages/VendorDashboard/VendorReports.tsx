import { useState, useEffect } from "react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { BarChart3, Download, Loader2, Calendar, DollarSign, Package, TrendingUp, XCircle } from "lucide-react";
import { vendorReportsApi, type VendorReportData } from "../../../infrastructure/api/vendorReportsApi";
import "./VendorReports.css";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  PREPARING: "Preparando",
  READY: "Listo",
  IN_DELIVERY: "En Camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  ACCEPTED: "#3b82f6",
  PREPARING: "#8b5cf6",
  READY: "#06b6d4",
  IN_DELIVERY: "#f97316",
  DELIVERED: "#22c55e",
  CANCELLED: "#ef4444",
};

const VendorReports = () => {
  const [data, setData] = useState<VendorReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingSummary, setExportingSummary] = useState(false);

  useEffect(() => {
    loadData();
  }, [from, to]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await vendorReportsApi.getData(from || undefined, to || undefined);
      setData(result);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await vendorReportsApi.downloadPdf(from || undefined, to || undefined);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await vendorReportsApi.downloadExcel(from || undefined, to || undefined);
    } catch (error) {
      console.error("Error exporting Excel:", error);
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportSummary = async () => {
    setExportingSummary(true);
    try {
      await vendorReportsApi.downloadSummaryPdf();
    } catch (error) {
      console.error("Error exporting summary PDF:", error);
    } finally {
      setExportingSummary(false);
    }
  };

  const clearFilters = () => {
    setFrom("");
    setTo("");
  };

  const maxDayCount = data ? Math.max(...data.orders_by_day.map(d => d.count), 1) : 1;

  return (
    <VendorLayout>
      <div className="vendor-reports">
        <div className="reports-header">
          <div className="reports-header-left">
            <h1>Reportes</h1>
          </div>
          <div className="reports-actions">
            <button
              className="export-btn summary"
              onClick={handleExportSummary}
              disabled={exportingSummary || loading}
            >
              {exportingSummary ? <Loader2 size={18} className="spinner" /> : <Download size={18} />}
              Resumen PDF
            </button>
            <button
              className="export-btn pdf"
              onClick={handleExportPdf}
              disabled={exportingPdf || loading}
            >
              {exportingPdf ? <Loader2 size={18} className="spinner" /> : <Download size={18} />}
              Pedidos PDF
            </button>
            <button
              className="export-btn excel"
              onClick={handleExportExcel}
              disabled={exportingExcel || loading}
            >
              {exportingExcel ? <Loader2 size={18} className="spinner" /> : <Download size={18} />}
              Pedidos Excel
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="reports-filters">
          <Calendar size={18} />
          <label>
            Desde
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            Hasta
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          {(from || to) && (
            <button className="clear-filters" onClick={clearFilters}>
              <XCircle size={16} />
              Limpiar
            </button>
          )}
        </div>

        {loading ? (
          <div className="reports-loading">
            <Loader2 size={40} className="spinner" />
            <p>Cargando reportes...</p>
          </div>
        ) : !data ? (
          <div className="reports-empty">
            <BarChart3 size={48} />
            <p>Error al cargar los datos</p>
          </div>
        ) : (
          <>
            {/* Tarjetas resumen */}
            <div className="reports-summary">
              <div className="summary-card">
                <div className="summary-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                  <Package size={24} />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{data.total_orders}</span>
                  <span className="summary-label">Total Pedidos</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon" style={{ background: "#d1fae5", color: "#059669" }}>
                  <DollarSign size={24} />
                </div>
                <div className="summary-info">
                  <span className="summary-value">${data.total_revenue.toLocaleString("es-CO")}</span>
                  <span className="summary-label">Ingresos Totales</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                  <TrendingUp size={24} />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{data.delivered_orders}</span>
                  <span className="summary-label">Entregados</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
                  <XCircle size={24} />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{data.cancelled_orders}</span>
                  <span className="summary-label">Cancelados</span>
                </div>
              </div>
            </div>

            <div className="reports-charts">
              {/* Pedidos por estado */}
              <div className="chart-card">
                <h2>Pedidos por Estado</h2>
                <div className="status-bars">
                  {Object.entries(data.orders_by_status).map(([status, count]) => (
                    <div key={status} className="status-bar-row">
                      <span className="status-name">{STATUS_LABELS[status] || status}</span>
                      <div className="status-bar-track">
                        <div
                          className="status-bar-fill"
                          style={{
                            width: `${(count / data.total_orders) * 100}%`,
                            background: STATUS_COLORS[status] || "#888",
                          }}
                        />
                      </div>
                      <span className="status-count">{count}</span>
                    </div>
                  ))}
                  {Object.keys(data.orders_by_status).length === 0 && (
                    <p className="no-data">Sin datos</p>
                  )}
                </div>
              </div>

              {/* Pedidos por dia */}
              <div className="chart-card">
                <h2>Pedidos por Dia</h2>
                <div className="day-chart">
                  {data.orders_by_day.slice(-14).map((day) => (
                    <div key={day.date} className="day-column">
                      <div className="day-bar-container">
                        <div
                          className="day-bar"
                          style={{ height: `${(day.count / maxDayCount) * 100}%` }}
                          title={`${day.count} pedidos - $${day.revenue.toLocaleString("es-CO")}`}
                        />
                      </div>
                      <span className="day-label">
                        {new Date(day.date + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  ))}
                  {data.orders_by_day.length === 0 && (
                    <p className="no-data">Sin datos</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top productos */}
            {data.top_products.length > 0 && (
              <div className="chart-card top-products">
                <h2>Top Productos Mas Vendidos</h2>
                <div className="products-table">
                  <div className="products-header">
                    <span>#</span>
                    <span>Producto</span>
                    <span>Cantidad</span>
                    <span>Ingresos</span>
                  </div>
                  {data.top_products.map((product, i) => (
                    <div key={product.product_name} className="products-row">
                      <span className="product-rank">{i + 1}</span>
                      <span className="product-name">{product.product_name}</span>
                      <span className="product-qty">{product.total_quantity}</span>
                      <span className="product-revenue">
                        ${product.total_revenue.toLocaleString("es-CO")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorReports;
