import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthProvider from "./ui/context/AuthProvider";
import { CartProvider } from "./ui/context/CartContext";
import { CartDrawerProvider } from "./ui/context/CartDrawerContext";
import FavoritesProvider from "./ui/context/FavoritesProvider";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <CartDrawerProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </CartDrawerProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
