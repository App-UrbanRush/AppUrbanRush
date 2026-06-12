export interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export interface Store {
  id: number;
  name: string;
  description: string;
  rating: number;
  deliveryTime: string;
  image: string;
  lat: number;
  lng: number;
  address: string;
  photos: string[];
  products: Product[];
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
}
