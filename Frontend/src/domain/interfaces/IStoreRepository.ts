import type { Category, Store, HeroBanner } from "../types/store.types";

export interface IStoreRepository {
  getHeroBanner(): Promise<HeroBanner>;
  getCategories(): Promise<Category[]>;
  getRecommendedStores(): Promise<Store[]>;
  getNearbyStores(): Promise<Store[]>;
}
