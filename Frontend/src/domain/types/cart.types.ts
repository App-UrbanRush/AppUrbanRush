import type { Product } from "./store.types";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  storeId: number | null;
  storeName: string | null;
  items: CartItem[];
}
