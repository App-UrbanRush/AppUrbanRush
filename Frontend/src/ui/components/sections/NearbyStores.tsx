import { useState } from "react";
import type { Store } from "../../../domain/types/store.types";
import StoreCard from "../ui/StoreCard/StoreCard";
import StoreDetailModal from "../store/StoreDetailModal";
import DeliveryMap from "../DeliveryMap/DeliveryMap";
import MapModal from "../DeliveryMap/MapModal";
import "./NearbyStores.css";

interface NearbyStoresProps {
  stores: Store[];
}

const NearbyStores = ({ stores }: NearbyStoresProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Store | null>(null);

  const mapLocations = stores.map((s) => ({
    id: String(s.id),
    lat: s.lat,
    lng: s.lng,
    address: s.name,
    status: "pending" as const,
  }));

  return (
    <section style={{ marginTop: '28px', marginBottom: '32px' }}>
      <h2 className="home-section-title" style={{ marginBottom: '16px' }}>Tiendas Cerca de Ti</h2>
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
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'auto', maxHeight: '230px' }}
        >
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} variant="nearby" onClick={() => setSelected(store)} />
          ))}
        </div>
      </div>
      {selected && <StoreDetailModal store={selected} onClose={() => setSelected(null)} />}
      <MapModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        center={[1.1481, -76.6475]}
        zoom={14}
        locations={mapLocations}
      />
      <style>{`
        @media (max-width: 768px) {
          .nearby-container { flex-wrap: wrap !important; }
          .map-wrapper { width: 100% !important; }
          .no-scrollbar { max-height: none !important; }
        }
      `}</style>
    </section>
  );
};

export default NearbyStores;
