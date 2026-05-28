import type { IStoreRepository } from "../../domain/interfaces/IStoreRepository";
import type { Category, Store, HeroBanner } from "../../domain/types/store.types";

const categories: Category[] = [
  { id: 1, name: "Comida Rápida", icon: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop", description: "Hamburguesas, papas y más" },
  { id: 2, name: "Pizza", icon: "🍕", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop", description: "Pizzas artesanales" },
  { id: 3, name: "Sushi", icon: "🍣", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=80&h=80&fit=crop", description: "Sushi fresco" },
  { id: 4, name: "Café", icon: "☕", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&h=80&fit=crop", description: "Café de especialidad" },
];

const recommendedStores: Store[] = [
  { id: 1, name: "Burger House", description: "Las mejores hamburguesas de la ciudad", rating: 4.8, deliveryTime: "20-30 min", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=280&fit=crop", lat: 1.1481, lng: -76.6475 },
  { id: 2, name: "Sushi Master", description: "Sushi fresco y delicioso", rating: 4.6, deliveryTime: "20-30 min", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=280&fit=crop", lat: 1.1502, lng: -76.6491 },
  { id: 3, name: "Pizzería Bella", description: "Pizza artesanal al horno de leña", rating: 4.7, deliveryTime: "20-30 min", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=280&fit=crop", lat: 1.1465, lng: -76.6458 },
  { id: 4, name: "Café Central", description: "Café de especialidad y repostería", rating: 4.5, deliveryTime: "20-30 min", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=280&fit=crop", lat: 1.1495, lng: -76.6483 },
];

const nearbyStores: Store[] = [
  { id: 5, name: "Taco Express", description: "Tacos y comida mexicana", rating: 4.7, deliveryTime: "15-25 min", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=250&fit=crop", lat: 1.1472, lng: -76.6469 },
  { id: 6, name: "Green Fresh", description: "Ensaladas y comida saludable", rating: 4.3, deliveryTime: "20-35 min", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop", lat: 1.1510, lng: -76.6502 },
  { id: 7, name: "Donut World", description: "Donuts artesanales y café", rating: 4.5, deliveryTime: "10-20 min", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=250&fit=crop", lat: 1.1450, lng: -76.6445 },
];

const heroBanner: HeroBanner = {
  title: "Entrega Rápida a Tu Puerta",
  subtitle: "Encuentra tus restaurantes favoritos cerca de ti",
  buttonText: "Explorar Tiendas",
};

export class MockStoreRepositoryImpl implements IStoreRepository {
  async getHeroBanner(): Promise<HeroBanner> {
    return heroBanner;
  }

  async getCategories(): Promise<Category[]> {
    return categories;
  }

  async getRecommendedStores(): Promise<Store[]> {
    return recommendedStores;
  }

  async getNearbyStores(): Promise<Store[]> {
    return nearbyStores;
  }
}
