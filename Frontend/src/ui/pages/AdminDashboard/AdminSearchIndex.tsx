import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, RefreshCw, Database, Clock, Hash } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout/AdminLayout";
import { searchApi, type SearchEntry } from "../../../infrastructure/api/searchApi";
import "./AdminCommon.css";

const AdminSearchIndex = () => {
  const [stats, setStats] = useState<{ size: number; lastBuildAt: string | null } | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [busy, setBusy] = useState(false);

  const loadStats = async () => {
    try {
      const s = await searchApi.stats();
      setStats(s);
    } catch {
      toast.error("No se pudieron cargar las estadísticas");
    }
  };

  useEffect(() => { loadStats(); }, []);

  // Debounce 250ms — consulta al AVL.
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await searchApi.search(q, 30);
        setResults(data);
      } catch {
        // silent
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const rebuild = async () => {
    setBusy(true);
    try {
      const r = await searchApi.rebuild();
      toast.success(`Índice reconstruido: ${r.size} entradas en ${r.ms} ms`);
      await loadStats();
    } catch {
      toast.error("No se pudo reconstruir el índice");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title"><Database size={26} /> Índice de búsqueda</h1>
            <p className="admin-page-subtitle">
              Árbol AVL en memoria con tiendas y productos. Búsqueda O(log n + k).
            </p>
          </div>
          <button className="admin-files-upload-btn" onClick={rebuild} disabled={busy}>
            <RefreshCw size={16} className={busy ? "spin" : ""} /> Reconstruir
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div className="admin-files-upload-card" style={{ background: "linear-gradient(135deg, #f0f9ff, #fff)" }}>
            <div className="admin-files-upload-icon" style={{ background: "#1565c0" }}><Hash size={24} /></div>
            <div className="admin-files-upload-info">
              <h3>{stats?.size ?? "—"}</h3>
              <p>Entradas en el árbol</p>
            </div>
          </div>
          <div className="admin-files-upload-card" style={{ background: "linear-gradient(135deg, #f0fdf4, #fff)" }}>
            <div className="admin-files-upload-icon" style={{ background: "#22c55e" }}><Clock size={24} /></div>
            <div className="admin-files-upload-info">
              <h3>{stats?.lastBuildAt ? new Date(stats.lastBuildAt).toLocaleTimeString("es-CO") : "—"}</h3>
              <p>Última reconstrucción</p>
            </div>
          </div>
        </div>

        <div className="admin-files-list-card">
          <div className="admin-files-list-header">
            <h2><Search size={18} style={{ verticalAlign: "middle" }} /> Probar búsqueda</h2>
          </div>
          <input
            type="text"
            placeholder="Escribe nombre de tienda o producto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e0e0e0",
              fontSize: 14,
              marginBottom: 14,
            }}
          />

          {!query.trim() ? (
            <div className="admin-files-empty">
              <Search size={32} />
              <p>Empieza a escribir</p>
              <span>Los resultados aparecen al consultar el AVL.</span>
            </div>
          ) : results.length === 0 ? (
            <div className="admin-files-empty">
              <p>Sin coincidencias para "{query}"</p>
            </div>
          ) : (
            <div className="admin-files-table">
              {results.map((r) => (
                <div key={`${r.type}-${r.id}`} className="admin-files-row">
                  <div className="admin-files-row-icon"><Hash size={16} /></div>
                  <div className="admin-files-row-info">
                    <span className="admin-files-row-name">{r.name}</span>
                    <span className="admin-files-row-meta">
                      <span className="admin-files-badge">{r.type === "VENDOR" ? "Tienda" : "Producto"}</span>
                      · id={String(r.id)}{r.vendorId ? ` · vendor=${r.vendorId}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSearchIndex;
