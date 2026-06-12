import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CartDrawerContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextType | null>(null);

export const CartDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  return (
    <CartDrawerContext.Provider value={{ isOpen, openCart, closeCart }}>
      {children}
    </CartDrawerContext.Provider>
  );
};

export const useCartDrawer = (): CartDrawerContextType => {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer debe usarse dentro de CartDrawerProvider");
  return ctx;
};
