import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorApi } from "../../../infrastructure/api/vendorApi";
import type { Store } from "../../../domain/types/store.types";
import StoreCard from "../../components/ui/StoreCard/StoreCard";
import { Search } from "lucide-react";

function mapVendorToStore(v: any): Store {
  return {
    id: v.vendor_id,
    name: v.business_name ?? v.name ?? `Tienda ${v.vendor_id}`,
    description: v.description ?? '',
    rating: v.rating,
    deliveryTime: v.delivery_time,
    image: v.logo_url ?? v.storefront_image_url ?? v.image_url ?? '',
    lat: v.lat ?? 0,
    lng: v.lng ?? 0,
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

  const filteredStores = searchQuery
    ? stores.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : stores;

  if (loading) {
    return <div style={{ padding: '24px', color: '#666' }}>Cargando tiendas...</div>;
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
            <StoreCard key={store.id} store={store} variant="recommended" />
          ))}
        </div>
      )}
    </div>
  );
};

export default Stores;
