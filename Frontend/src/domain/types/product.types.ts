export interface Product {
  product_id: string;
  vendor_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean;
  stock: number;
}

export const CATEGORIES = [
  "Todos",
  "Hamburguesas",
  "Pizzas",
  "Bebidas",
  "Postres",
  "Comida Rápida",
];