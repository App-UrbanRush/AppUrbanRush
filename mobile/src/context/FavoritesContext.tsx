import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ur_favs_v1";

interface FavoritesContextType {
  ids: number[];
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => { if (raw) try { setIds(JSON.parse(raw)); } catch {} });
  }, []);
  useEffect(() => { AsyncStorage.setItem(KEY, JSON.stringify(ids)); }, [ids]);

  const isFavorite = useCallback((id: number) => ids.includes(id), [ids]);
  const toggle = useCallback((id: number) => {
    setIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  return (
    <FavoritesContext.Provider value={{ ids, isFavorite, toggle, count: ids.length }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites fuera de FavoritesProvider");
  return ctx;
};
