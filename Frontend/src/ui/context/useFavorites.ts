import { useContext } from "react";
import { FavoritesContext } from "./FavoritesContext";

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
};
