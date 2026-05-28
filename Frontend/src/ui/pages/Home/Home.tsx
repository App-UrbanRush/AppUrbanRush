import { useState, useEffect } from "react";
import { GetHomeDataUseCase } from "../../../application/use-cases/GetHomeDataUseCase";
import { MockStoreRepositoryImpl } from "../../../infrastructure/repositories/MockStoreRepositoryImpl";
import type { HomeData } from "../../../domain/types/store.types";
import HeroBanner from "../../components/sections/HeroBanner";
import PopularCategories from "../../components/sections/PopularCategories";
import RecommendedStores from "../../components/sections/RecommendedStores";
import NearbyStores from "../../components/sections/NearbyStores";
import "./Home.css";

const getHomeDataUseCase = new GetHomeDataUseCase(new MockStoreRepositoryImpl());

const Home = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const homeData = await getHomeDataUseCase.execute();
        setData(homeData);
      } catch {
        console.error("Error al cargar datos del Home");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="home-loading">Cargando...</div>;
  }

  if (!data) {
    return <div className="home-loading">Error al cargar la pagina</div>;
  }

  return (
    <div className="home">
      <HeroBanner data={data.heroBanner} />
      <PopularCategories categories={data.categories} />
      <RecommendedStores stores={data.recommendedStores} />
      <NearbyStores stores={data.nearbyStores} />
    </div>
  );
};

export default Home;
