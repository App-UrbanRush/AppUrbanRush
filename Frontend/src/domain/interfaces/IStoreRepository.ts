import type { Category, Store, HeroBanner } from "../types/store.types";
import type { Product } from "../types/product.types";

export interface IStoreRepository {
  getHeroBanner(): Promise<HeroBanner>;
  getCategories(): Promise<Category[]>;
  getRecommendedStores(): Promise<Store[]>;
  getNearbyStores(): Promise<Store[]>;
  getRecommendedProducts(): Promise<Product[]>;
  getAllStores(): Promise<Store[]>;
}
