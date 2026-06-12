import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CreditCard, Banknote, MapPin, CheckCircle2, ShoppingBag } from "lucide-react";
import Layout from "../../components/layout/Layout/Layout";
import { useAuth } from "../../context/useAuth";
import { useCart } from "../../context/useCart";
import type { CartItem } from "../../../domain/types/cart.types";
import "./CheckoutPage.css";

const DELIVERY_FEE = 3000;
const money = (n: number) => `$${n.toLocaleString("es-CO")}`;

interface PlacedOrder {
  number: string;
  items: CartItem[];
  storeName: string | null;
  total: number;
  address: string;
}

const CheckoutPage = () => {
  const { isAuthenticated, myProfile } = useAuth();
  const { items, storeName, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(myProfile?.address ?? "");
  const [payment, setPayment] = useState<"card" | "cash">("card");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const total = subtotal + DELIVERY_FEE;

  const handleConfirm = () => {
    if (!address.trim()) return;
    setPlacing(true);
    // Demo: simula la creación del pedido
    setTimeout(() => {
      const number = "UR-" + Math.floor(100000 + Math.random() * 900000);
      setPlaced({ number, items, storeName, total, address });
      clear();
      setPlacing(false);
    }, 700);
  };

  // ─── Confirmación ───
  if (placed) {
    return (
      <Layout>
        <div className="checkout-page checkout-confirm">
          <CheckCircle2 size={64} className="checkout-confirm-icon" />
          <h1>¡Pedido confirmado!</h1>
          <p className="checkout-confirm-number">Pedido #{placed.number}</p>
          <p className="checkout-confirm-sub">
            Tu pedido en <strong>{placed.storeName}</strong> está en preparación. Llegará a:{" "}
            <strong>{placed.address}</strong>
          </p>
          <div className="checkout-confirm-summary">
            {placed.items.map((it) => (
              <div key={it.product.id} className="checkout-confirm-row">
                <span>{it.quantity}× {it.product.name}</span>
                <span>{money(it.product.price * it.quantity)}</span>
              </div>
            ))}
            <div className="checkout-confirm-row total">
              <span>Total pagado</span>
              <strong>{money(placed.total)}</strong>
            </div>
          </div>
          <button className="checkout-primary" onClick={() => navigate("/dashboard")}>
            Volver al inicio
          </button>
        </div>
      </Layout>
    );
  }

  // ─── Carrito vacío ───
  if (items.length === 0) {
    return (
      <Layout>
        <div className="checkout-page checkout-empty">
          <ShoppingBag size={56} />
          <h2>Tu carrito está vacío</h2>
          <button className="checkout-primary" onClick={() => navigate("/tiendas")}>
            Explorar tiendas
          </button>
        </div>
      </Layout>
    );
  }

  // ─── Checkout ───
  return (
    <Layout>
      <div className="checkout-page">
        <h1 className="checkout-title">Finalizar pedido</h1>
        <div className="checkout-grid">
          {/* Columna izquierda: dirección + pago */}
          <div className="checkout-col">
            <section className="checkout-card">
              <h2><MapPin size={18} /> Dirección de entrega</h2>
              <input
                className="checkout-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Calle 7 # 5-20, Mocoa"
              />
            </section>

            <section className="checkout-card">
              <h2>Método de pago</h2>
              <button
                className={`checkout-pay ${payment === "card" ? "active" : ""}`}
                onClick={() => setPayment("card")}
              >
                <CreditCard size={18} /> Tarjeta
              </button>
              <button
                className={`checkout-pay ${payment === "cash" ? "active" : ""}`}
                onClick={() => setPayment("cash")}
              >
                <Banknote size={18} /> Efectivo contra entrega
              </button>
            </section>
          </div>

          {/* Columna derecha: resumen */}
          <div className="checkout-col">
            <section className="checkout-card checkout-summary">
              <h2>Resumen {storeName && <span className="checkout-store">· {storeName}</span>}</h2>
              <div className="checkout-items">
                {items.map((it) => (
                  <div key={it.product.id} className="checkout-item">
                    <span>{it.quantity}× {it.product.name}</span>
                    <span>{money(it.product.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="checkout-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="checkout-line"><span>Domicilio</span><span>{money(DELIVERY_FEE)}</span></div>
              <div className="checkout-line total"><span>Total</span><strong>{money(total)}</strong></div>
              <button
                className="checkout-primary"
                onClick={handleConfirm}
                disabled={placing || !address.trim()}
              >
                {placing ? "Procesando…" : `Confirmar pedido · ${money(total)}`}
              </button>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
