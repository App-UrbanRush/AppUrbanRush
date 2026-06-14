import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import Layout from "../../components/layout/Layout/Layout";
import StoreCard from "../../components/ui/StoreCard/StoreCard";
import StoreDetailModal from "../../components/store/StoreDetailModal";
import DeliveryMap from "../../components/DeliveryMap/DeliveryMap";
import { MockStoreRepositoryImpl } from "../../../infrastructure/repositories/MockStoreRepositoryImpl";
import type { Store } from "../../../domain/types/store.types";
import "./StoresPage.css";

const repo = new MockStoreRepositoryImpl();

const StoresPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim().toLowerCase() ?? "";

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Store | null>(null);

  useEffect(() => {
    Promise.all([repo.getRecommendedStores(), repo.getNearbyStores()])
      .then(([rec, near]) => {
        const map = new Map<number, Store>();
        [...rec, ...near].forEach((s) => map.set(s.id, s));
        setStores([...map.values()]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return stores;
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query),
    );
  }, [stores, query]);

  const mapLocations = filtered.map((s) => ({
    id: String(s.id),
    lat: s.lat,
    lng: s.lng,
    address: s.name,
    status: "pending" as const,
  }));

  return (
    <Layout>
      <div className="stores-page">
        <div className="stores-page-head">
          <h1>
            {query ? (
              <><Search size={22} /> Resultados para “{query}”</>
            ) : (
              <><MapPin size={22} /> Tiendas cerca de ti</>
            )}
          </h1>
          <p>{filtered.length} {filtered.length === 1 ? "tienda encontrada" : "tiendas encontradas"}</p>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="stores-page-map">
            <DeliveryMap center={[1.1481, -76.6475]} zoom={14} height="260px" locations={mapLocations} showMyLocation />
          </div>
        )}

        {loading ? (
          <div className="stores-page-empty">Cargando tiendas…</div>
        ) : filtered.length === 0 ? (
          <div className="stores-page-empty">
            No encontramos tiendas{query ? ` para “${query}”` : ""}. Prueba con otra búsqueda.
          </div>
        ) : (
          <div className="stores-page-grid">
            {filtered.map((store) => (
              <StoreCard key={store.id} store={store} variant="recommended" onClick={() => setSelected(store)} />
            ))}
          </div>
        )}
      </div>

      {selected && <StoreDetailModal store={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
};

export default StoresPage;
