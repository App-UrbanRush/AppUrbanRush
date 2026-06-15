import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProductListItem } from "../api/nestApi";

const KEY = "ur_cart_v1";

export interface CartItem { product: ProductListItem; quantity: number; }
export interface CartState {
  vendorId: number | null;
  vendorName: string | null;
  items: CartItem[];
}

interface CartContextType {
  state: CartState;
  addItem: (product: ProductListItem, vendor: { id: number; name: string }, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const empty: CartState = { vendorId: null, vendorName: null, items: [] };
const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CartState>(empty);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) try { setState(JSON.parse(raw)); } catch {}
    });
  }, []);

  useEffect(() => { AsyncStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  const addItem = useCallback((product: ProductListItem, vendor: { id: number; name: string }, qty = 1) => {
    setState((prev) => {
      // Si es de otra tienda, reemplazo el carrito.
      if (prev.vendorId && prev.vendorId !== vendor.id) {
        return { vendorId: vendor.id, vendorName: vendor.name, items: [{ product, quantity: qty }] };
      }
      const existing = prev.items.find((i) => i.product.product_id === product.product_id);
      const items = existing
        ? prev.items.map((i) => i.product.product_id === product.product_id ? { ...i, quantity: i.quantity + qty } : i)
        : [...prev.items, { product, quantity: qty }];
      return { vendorId: vendor.id, vendorName: vendor.name, items };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setState((prev) => {
      const items = prev.items.filter((i) => i.product.product_id !== productId);
      return items.length === 0 ? empty : { ...prev, items };
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty < 1) return removeItem(productId);
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => i.product.product_id === productId ? { ...i, quantity: qty } : i),
    }));
  }, [removeItem]);

  const clear = useCallback(() => setState(empty), []);

  const total = useMemo(() => state.items.reduce((s, i) => s + i.product.price * i.quantity, 0), [state.items]);
  const count = useMemo(() => state.items.reduce((s, i) => s + i.quantity, 0), [state.items]);

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart fuera de CartProvider");
  return ctx;
};
