import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import toast from "react-hot-toast";
import type { Product } from "../../domain/types/product.types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "urbanrush_cart";

const loadCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (product.stock <= 0 || !product.is_available) {
      toast.error(`${product.name} no está disponible`);
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.product.product_id === product.product_id);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + quantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidad${product.stock !== 1 ? "es" : ""} disponible${product.stock !== 1 ? "s" : ""}`);
        return prev;
      }
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) =>
          i.product.product_id === product.product_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        updated = [...prev, { product, quantity }];
      }
      saveCart(updated);
      return updated;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.product.product_id !== productId);
      saveCart(updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const updated = prev.filter((i) => i.product.product_id !== productId);
        saveCart(updated);
        return updated;
      });
      return;
    }
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.product.product_id === productId ? { ...i, quantity } : i
      );
      saveCart(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
};
