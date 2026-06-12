import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { CartContext } from "./CartContext";
import CartDrawer from "../components/cart/CartDrawer";
import type { CartItem, Cart } from "../../domain/types/cart.types";
import type { Product } from "../../domain/types/store.types";

const STORAGE_KEY = "ur_cart";

const loadCart = (): Cart => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Cart;
  } catch { /* ignore */ }
  return { storeId: null, storeName: null, items: [] };
};

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((product: Product, store: { id: number; name: string }) => {
    setCart((prev) => {
      // Carrito de una sola tienda: si es otra, se reemplaza
      if (prev.storeId !== null && prev.storeId !== store.id) {
        toast("Vaciamos tu carrito para esta nueva tienda 🛒", { icon: "🔄" });
        return { storeId: store.id, storeName: store.name, items: [{ product, quantity: 1 }] };
      }
      const existing = prev.items.find((i) => i.product.id === product.id);
      const items: CartItem[] = existing
        ? prev.items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev.items, { product, quantity: 1 }];
      return { storeId: store.id, storeName: store.name, items };
    });
    toast.success(`${product.name} agregado al carrito 🛒`);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.product.id !== productId);
      return items.length === 0
        ? { storeId: null, storeName: null, items: [] }
        : { ...prev, items };
    });
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i),
    }));
  }, [removeItem]);

  const clear = useCallback(() => setCart({ storeId: null, storeName: null, items: [] }), []);

  const count = useMemo(() => cart.items.reduce((s, i) => s + i.quantity, 0), [cart.items]);
  const subtotal = useMemo(() => cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0), [cart.items]);

  const value = {
    items: cart.items,
    storeId: cart.storeId,
    storeName: cart.storeName,
    count,
    subtotal,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    updateQty,
    clear,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
};

export default CartProvider;
