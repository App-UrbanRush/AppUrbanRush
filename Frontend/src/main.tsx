import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthProvider from "./ui/context/AuthProvider";
import { CartProvider } from "./ui/context/CartContext";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);