import type { IStoreRepository } from "../../domain/interfaces/IStoreRepository";
import type { Category, Store, HeroBanner } from "../../domain/types/store.types";

const categories: Category[] = [
  { id: 1, name: "Comida Rápida", icon: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop", description: "Hamburguesas, papas y más" },
  { id: 2, name: "Pizza", icon: "🍕", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop", description: "Pizzas artesanales" },
  { id: 3, name: "Sushi", icon: "🍣", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=80&h=80&fit=crop", description: "Sushi fresco" },
  { id: 4, name: "Café", icon: "☕", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&h=80&fit=crop", description: "Café de especialidad" },
];

const P = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&h=560&fit=crop&q=80`;
const F = (id: string) => `https://images.unsplash.com/photo-${id}?w=200&h=200&fit=crop&q=80`;

const recommendedStores: Store[] = [
  { id: 1, name: "Burger House", description: "Las mejores hamburguesas de la ciudad", rating: 4.8, deliveryTime: "20-30 min", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=280&fit=crop", lat: 1.1481, lng: -76.6475, address: "Calle 7 # 5-20, Mocoa", photos: [P("1568901346375-23c9450c58cd"), P("1550547660-d9450f859349"), P("1571091718767-18b5b1457add")], products: [{ id: 101, name: "Hamburguesa Clásica", price: 18000, image: F("1568901346375-23c9450c58cd") }, { id: 102, name: "Hamburguesa Doble", price: 24000, image: F("1550547660-d9450f859349") }, { id: 103, name: "Papas a la Francesa", price: 9000, image: F("1571091718767-18b5b1457add") }, { id: 104, name: "Gaseosa 400ml", price: 5000, image: F("1581636625402-29b2a704ef13") }] },
  { id: 2, name: "Sushi Master", description: "Sushi fresco y delicioso", rating: 4.6, deliveryTime: "20-30 min", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=280&fit=crop", lat: 1.1502, lng: -76.6491, address: "Carrera 6 # 8-45, Mocoa", photos: [P("1579584425555-c3ce17fd4351"), P("1611143669185-af224c5e3252"), P("1617196034796-73dfa7b1fd56")], products: [{ id: 201, name: "Roll California", price: 22000, image: F("1579584425555-c3ce17fd4351") }, { id: 202, name: "Nigiri de Salmón", price: 16000, image: F("1611143669185-af224c5e3252") }, { id: 203, name: "Tempura de Camarón", price: 19000, image: F("1617196034796-73dfa7b1fd56") }, { id: 204, name: "Té Verde", price: 4000, image: F("1556679343-c7306c1976bc") }] },
  { id: 3, name: "Pizzería Bella", description: "Pizza artesanal al horno de leña", rating: 4.7, deliveryTime: "20-30 min", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=280&fit=crop", lat: 1.1465, lng: -76.6458, address: "Calle 10 # 4-12, Mocoa", photos: [P("1565299624946-b28f40a0ae38"), P("1513104890138-7c749659a591"), P("1604382354936-07c5d9983bd3")], products: [{ id: 301, name: "Pizza Margarita", price: 28000, image: F("1565299624946-b28f40a0ae38") }, { id: 302, name: "Pizza Pepperoni", price: 32000, image: F("1513104890138-7c749659a591") }, { id: 303, name: "Pizza Hawaiana", price: 30000, image: F("1604382354936-07c5d9983bd3") }, { id: 304, name: "Gaseosa 1.5L", price: 7000, image: F("1581636625402-29b2a704ef13") }] },
  { id: 4, name: "Café Central", description: "Café de especialidad y repostería", rating: 4.5, deliveryTime: "20-30 min", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=280&fit=crop", lat: 1.1495, lng: -76.6483, address: "Carrera 8 # 9-30, Mocoa", photos: [P("1495474472287-4d71bcdd2085"), P("1554118811-1e0d58224f24"), P("1453614512568-c4024d13c247")], products: [{ id: 401, name: "Cappuccino", price: 8000, image: F("1495474472287-4d71bcdd2085") }, { id: 402, name: "Latte", price: 8500, image: F("1554118811-1e0d58224f24") }, { id: 403, name: "Croissant", price: 6000, image: F("1453614512568-c4024d13c247") }, { id: 404, name: "Cheesecake", price: 11000, image: F("1533134242443-d4fd215305ad") }] },
];

const nearbyStores: Store[] = [
  { id: 5, name: "Taco Express", description: "Tacos y comida mexicana", rating: 4.7, deliveryTime: "15-25 min", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=250&fit=crop", lat: 1.1472, lng: -76.6469, address: "Calle 5 # 6-18, Mocoa", photos: [P("1565299585323-38d6b0865b47"), P("1551504734-5ee1c4a1479b"), P("1599974579688-8dbdd335c77f")], products: [{ id: 501, name: "Tacos al Pastor (3)", price: 15000, image: F("1565299585323-38d6b0865b47") }, { id: 502, name: "Burrito Grande", price: 17000, image: F("1551504734-5ee1c4a1479b") }, { id: 503, name: "Nachos con Queso", price: 12000, image: F("1599974579688-8dbdd335c77f") }, { id: 504, name: "Agua Fresca", price: 5000, image: F("1621263764928-df1444c5e859") }] },
  { id: 6, name: "Green Fresh", description: "Ensaladas y comida saludable", rating: 4.3, deliveryTime: "20-35 min", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop", lat: 1.1510, lng: -76.6502, address: "Carrera 9 # 11-05, Mocoa", photos: [P("1512621776951-a57141f2eefd"), P("1540420773420-3366772f4999"), P("1546069901-ba9599a7e63c")], products: [{ id: 601, name: "Ensalada César", price: 16000, image: F("1512621776951-a57141f2eefd") }, { id: 602, name: "Bowl Saludable", price: 18000, image: F("1540420773420-3366772f4999") }, { id: 603, name: "Wrap de Pollo", price: 14000, image: F("1546069901-ba9599a7e63c") }, { id: 604, name: "Jugo Verde", price: 7000, image: F("1622597467836-f3285f2131b8") }] },
  { id: 7, name: "Donut World", description: "Donuts artesanales y café", rating: 4.5, deliveryTime: "10-20 min", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=250&fit=crop", lat: 1.1450, lng: -76.6445, address: "Calle 8 # 3-22, Mocoa", photos: [P("1551024601-bec78aea704b"), P("1514517604298-cf80e0fb7f1e"), P("1438480478735-3234e63615bb")], products: [{ id: 701, name: "Donut Glaseado", price: 5000, image: F("1551024601-bec78aea704b") }, { id: 702, name: "Donut de Chocolate", price: 5500, image: F("1514517604298-cf80e0fb7f1e") }, { id: 703, name: "Café Americano", price: 6000, image: F("1438480478735-3234e63615bb") }, { id: 704, name: "Combo 6 Donuts", price: 26000, image: F("1551024601-bec78aea704b") }] },
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
