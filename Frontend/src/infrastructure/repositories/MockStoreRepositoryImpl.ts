import type { IStoreRepository } from "../../domain/interfaces/IStoreRepository";
import type { Category, Store, HeroBanner } from "../../domain/types/store.types";
import type { Product } from "../../domain/types/product.types";
import { vendorApi } from "../api/vendorApi";
import { productApi } from "../api/productApi";

const heroBanner: HeroBanner = {
  title: "Entrega Rápida a Tu Puerta",
  subtitle: "Encuentra tus restaurantes favoritos cerca de ti",
  buttonText: "Explorar Tiendas",
};

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

export class MockStoreRepositoryImpl implements IStoreRepository {
  async getHeroBanner(): Promise<HeroBanner> {
    return heroBanner;
  }

  async getCategories(): Promise<Category[]> {
    try {
      const products = await productApi.getAll();
      const cats = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
      return cats.map((c, i) => ({ id: i + 1, name: c, icon: '📦', image: '', description: c }));
    } catch (e) {
      return [];
    }
  }

  async getRecommendedStores(): Promise<Store[]> {
    try {
      const vendors = await vendorApi.getAll();
      return vendors.slice(0, 6).map(mapVendorToStore);
    } catch (e) {
      return [];
    }
  }

  async getNearbyStores(): Promise<Store[]> {
    try {
      const vendors = await vendorApi.getAll();
      return vendors.slice(0, 6).map(mapVendorToStore);
    } catch (e) {
      return [];
    }
  }

  async getRecommendedProducts(): Promise<Product[]> {
    try {
      const products = await productApi.getAll();
      return products.slice(0, 8);
    } catch (e) {
      return [];
    }
  }

  async getAllStores(): Promise<Store[]> {
    try {
      const vendors = await vendorApi.getAll();
      return vendors.map(mapVendorToStore);
    } catch (e) {
      return [];
    }
  }
}
