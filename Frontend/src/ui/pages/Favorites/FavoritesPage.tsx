import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Layout from "../../components/layout/Layout/Layout";
import StoreCard from "../../components/ui/StoreCard/StoreCard";
import StoreDetailModal from "../../components/store/StoreDetailModal";
import { useFavorites } from "../../context/useFavorites";
import { MockStoreRepositoryImpl } from "../../../infrastructure/repositories/MockStoreRepositoryImpl";
import type { Store } from "../../../domain/types/store.types";
import "./FavoritesPage.css";

const repo = new MockStoreRepositoryImpl();

const FavoritesPage = () => {
  const { ids } = useFavorites();
  const [stores, setStores] = useState<Store[]>([]);
  const [selected, setSelected] = useState<Store | null>(null);

  useEffect(() => {
    Promise.all([repo.getRecommendedStores(), repo.getNearbyStores()]).then(([rec, near]) => {
      const map = new Map<number, Store>();
      [...rec, ...near].forEach((s) => map.set(s.id, s));
      setStores([...map.values()]);
    });
  }, []);

  const favorites = stores.filter((s) => ids.includes(s.id));

  return (
    <Layout>
      <div className="fav-page">
        <div className="fav-page-head">
          <h1><Heart size={22} fill="#ff3d6e" stroke="#ff3d6e" /> Mis Favoritos</h1>
          <p>{favorites.length} {favorites.length === 1 ? "tienda guardada" : "tiendas guardadas"}</p>
        </div>

        {favorites.length === 0 ? (
          <div className="fav-empty">
            <Heart size={54} />
            <h3>Aún no tienes favoritos</h3>
            <p>Toca el corazón de una tienda para guardarla aquí.</p>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map((s) => (
              <StoreCard key={s.id} store={s} variant="recommended" onClick={() => setSelected(s)} />
            ))}
          </div>
        )}
      </div>
      {selected && <StoreDetailModal store={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
};

export default FavoritesPage;
