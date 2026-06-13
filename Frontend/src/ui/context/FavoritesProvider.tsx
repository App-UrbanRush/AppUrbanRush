import { useCallback, useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { FavoritesContext } from "./FavoritesContext";

const STORAGE_KEY = "ur_favorites";

const load = (): number[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as number[];
  } catch { /* ignore */ }
  return [];
};

const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<number[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const isFavorite = useCallback((id: number) => ids.includes(id), [ids]);

  const toggle = useCallback((id: number, name?: string) => {
    setIds((prev) => {
      if (prev.includes(id)) {
        toast(`${name ?? "Tienda"} quitada de favoritos`, { icon: "💔" });
        return prev.filter((x) => x !== id);
      }
      toast.success(`${name ?? "Tienda"} guardada en favoritos`);
      return [...prev, id];
    });
  }, []);

  return (
    <FavoritesContext.Provider value={{ ids, count: ids.length, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;
