import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Store } from "../../../domain/types/store.types";
import DeliveryMap from "../DeliveryMap/DeliveryMap";
import MapModal from "../DeliveryMap/MapModal";
import "./NearbyStores.css";

interface NearbyStoresProps {
  stores: Store[];
}

const NearbyStores = ({ stores }: NearbyStoresProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const mapLocations = stores.map((s) => ({
    id: String(s.id),
    lat: s.lat,
    lng: s.lng,
    address: s.address || s.name,
    status: "pending" as const,
  }));

  return (
    <section style={{ marginTop: '28px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', margin: 0 }}>Tiendas Cerca de Ti</h2>
        <button
          onClick={() => navigate('/stores')}
          style={{
            border: '1px solid #e0e0e0',
            background: '#fff',
            color: '#333',
            borderRadius: '24px',
            padding: '9px 16px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '13px',
          }}
        >
          Explorar tiendas
        </button>
      </div>

      <div className="nearby-container" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div className="map-wrapper" style={{ flexShrink: 0, width: '220px' }}>
          <DeliveryMap
            center={[1.1481, -76.6475]}
            zoom={14}
            height="220px"
            locations={mapLocations}
            showMyLocation
          />
          <button
            className="map-expand-btn"
            onClick={() => setModalOpen(true)}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '6px 0',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#666',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background 0.18s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#f5f5f5'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
          >
            🔍 Ver mapa completo
          </button>
        </div>

        <div
          className="no-scrollbar"
          style={{ flex: 1, display: 'grid', gap: '14px', overflow: 'auto', maxHeight: '360px' }}
        >
          {stores.length === 0 ? (
            <div style={{ color: '#666', fontSize: '14px' }}>No hay tiendas cercanas disponibles.</div>
          ) : (
            stores.map((store) => (
              <div
                key={store.id}
                onClick={() => navigate(`/store/${store.id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.3fr',
                  gap: '12px',
                  background: '#fff',
                  borderRadius: '14px',
                  border: '1px solid #f0f0f0',
                  padding: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={store.logo_url || store.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=280&fit=crop'}
                      alt={store.name}
                      style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {store.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>{store.business_type || 'Restaurante'}</div>
                      <div style={{ fontSize: '13px', color: '#555' }}>{store.address || 'Dirección no disponible'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <MapModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        center={[1.1481, -76.6475]}
        zoom={14}
        locations={mapLocations}
      />
      <style>{`
        @media (max-width: 980px) {
          .nearby-container { flex-wrap: wrap !important; }
          .map-wrapper { width: 100% !important; }
          .no-scrollbar { max-height: none !important; }
          .nearby-container > div:last-child { width: 100%; }
        }
        @media (max-width: 640px) {
          .nearby-container { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
};

export default NearbyStores;
