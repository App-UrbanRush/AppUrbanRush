export interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
  description: string;
}

import type { Product } from "./product.types";

export interface Store {
  id: number;
  name: string;
  description: string;
  rating?: number;
  deliveryTime?: string;
  image: string;
  lat: number;
  lng: number;
  address?: string;
  products?: Product[];
  business_type?: string;
  logo_url?: string | null;
  storefront_image_url?: string | null;
  business_hours?: string | null;
  averageRating?: number;
  productCount?: number;
}

export interface HeroBanner {
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface HomeData {
  heroBanner: HeroBanner;
  categories: Category[];
  recommendedStores: Store[];
  nearbyStores: Store[];
  recommendedProducts: Product[];
}
