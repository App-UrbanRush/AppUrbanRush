import { createContext } from "react";

export interface FavoritesContextType {
  ids: number[];
  count: number;
  isFavorite: (id: number) => boolean;
  toggle: (id: number, name?: string) => void;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
