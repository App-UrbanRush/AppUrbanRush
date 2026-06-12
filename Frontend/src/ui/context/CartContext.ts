import { createContext } from "react";
import type { CartItem } from "../../domain/types/cart.types";
import type { Product } from "../../domain/types/store.types";

export interface CartContextType {
  items: CartItem[];
  storeId: number | null;
  storeName: string | null;
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, store: { id: number; name: string }) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
