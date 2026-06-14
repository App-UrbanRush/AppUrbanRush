import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorApi } from "../../../infrastructure/api/vendorApi";
import { searchApi } from "../../../infrastructure/api/searchApi";
import type { Store } from "../../../domain/types/store.types";
import StoreCard from "../../components/ui/StoreCard/StoreCard";
import { Search } from "lucide-react";
import Loading from "../../components/Loading/Loading";

function mapVendorToStore(v: any): Store {
  return {
    id: v.vendor_id,
    name: v.business_name ?? v.name ?? `Tienda ${v.vendor_id}`,
    description: v.description ?? '',
    rating: v.rating,
    deliveryTime: v.delivery_time,
    image: v.logo_url ?? v.storefront_image_url ?? v.image_url ?? '',
    lat: v.latitude ?? v.lat ?? 0,
    lng: v.longitude ?? v.lng ?? 0,
    address: v.address ?? '',
    products: [],
    business_type: v.business_type ?? '',
    logo_url: v.logo_url ?? null,
    storefront_image_url: v.storefront_image_url ?? null,
    business_hours: v.business_hours ?? null,
  };
}

const Stores = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [avlVendorIds, setAvlVendorIds] = useState<Set<number> | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await vendorApi.getAll();
        setStores(data.map(mapVendorToStore));
      } catch (error) {
        console.error("Error al cargar tiendas", error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  // Búsqueda contra el índice AVL del backend (debounce 250ms).
  // Si falla por red/auth, dejamos avlVendorIds = null y el filtro local actúa como fallback.
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setAvlVendorIds(null); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await searchApi.search(q, 50);
        const ids = new Set<number>();
        results.forEach((r) => {
          if (r.type === "VENDOR" && typeof r.id === "number") ids.add(r.id);
          if (r.type === "PRODUCT" && typeof r.vendorId === "number") ids.add(r.vendorId);
        });
        setAvlVendorIds(ids);
      } catch {
        setAvlVendorIds(null); // fallback al filtro local
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return stores;
    if (avlVendorIds && avlVendorIds.size > 0) {
      return stores.filter((s) => avlVendorIds.has(s.id));
    }
    // Fallback local si AVL no respondió
    return stores.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  }, [stores, searchQuery, avlVendorIds]);

  if (loading) {
    return <Loading text="Cargando tiendas…" />;
  }

  return (
    <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto', padding: '24px 16px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#666',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Atrás
      </button>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1a1a1a' }}>Explorar tiendas</h1>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#9ca3af',
        }}
      >
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar tiendas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: '#1f2937',
            background: 'transparent',
          }}
        />
      </div>
      {filteredStores.length === 0 ? (
        <p style={{ color: '#666', fontSize: '14px' }}>No hay tiendas para mostrar.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '18px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            justifyItems: 'center',
          }}
        >
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} variant="recommended" onClick={() => navigate(`/store/${store.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Stores;
