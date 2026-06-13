import { useState, useEffect } from "react";
import { GetHomeDataUseCase } from "../../../application/use-cases/GetHomeDataUseCase";
import { MockStoreRepositoryImpl } from "../../../infrastructure/repositories/MockStoreRepositoryImpl";
import type { HomeData } from "../../../domain/types/store.types";
import HeroBanner from "../../components/sections/HeroBanner";
import RecommendedProducts from "../../components/sections/RecommendedProducts";
import NearbyStores from "../../components/sections/NearbyStores";
import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../context/useAuth";
import "./Home.css";

const getHomeDataUseCase = new GetHomeDataUseCase(new MockStoreRepositoryImpl());

const HomeNew = () => {
  const { logout } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const homeData = await getHomeDataUseCase.execute();
        setData(homeData);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar datos";
        console.error("Error al cargar datos del Home:", message);
        setError(message);
        if (err instanceof Error && err.message.includes("401")) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [logout]);

  if (loading) {
    return <Loading text="Cargando…" />;
  }

  if (error || !data) {
    return (
      <div className="home-loading" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        padding: '20px'
      }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          color: '#e8500a'
        }}>⚠️</div>
        <h2 style={{ fontSize: '18px', marginBottom: '8px', color: '#1a1a1a' }}>
          Error al cargar el menú
        </h2>
        <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
          {error || "No se pudieron cargar los productos"}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px',
            background: '#e8500a',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      <HeroBanner data={data.heroBanner} />
      <RecommendedProducts products={data.recommendedProducts} />
      <NearbyStores stores={data.nearbyStores} />
    </div>
  );
};

export default HomeNew;
