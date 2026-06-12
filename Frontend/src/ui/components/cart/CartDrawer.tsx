import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../context/useCart";
import { useAuth } from "../../context/useAuth";
import "./CartDrawer.css";

const money = (n: number) => `$${n.toLocaleString("es-CO")}`;

const CartDrawer = () => {
  const navigate = useNavigate();
  const { isOpen, closeCart, items, storeName, subtotal, updateQty, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  const goCheckout = () => {
    closeCart();
    // El registro se pide recién al pagar
    if (!isAuthenticated) {
      toast("Crea tu cuenta para finalizar tu pedido 🛍️");
      navigate("/register-select");
      return;
    }
    navigate("/checkout");
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={closeCart} />
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-drawer-head">
          <div>
            <h2>Tu carrito</h2>
            {storeName && <span className="cart-drawer-store">{storeName}</span>}
          </div>
          <button className="cart-drawer-close" onClick={closeCart}><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer-empty">
            <ShoppingBag size={46} />
            <p>Tu carrito está vacío</p>
            <span>Agrega productos desde una tienda</span>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((it) => (
                <div className="cart-item" key={it.product.id}>
                  <img src={it.product.image} alt={it.product.name} />
                  <div className="cart-item-info">
                    <span className="cart-item-name">{it.product.name}</span>
                    <span className="cart-item-price">{money(it.product.price)}</span>
                  </div>
                  <div className="cart-item-actions">
                    <div className="cart-qty">
                      <button onClick={() => updateQty(it.product.id, it.quantity - 1)}><Minus size={14} /></button>
                      <span>{it.quantity}</span>
                      <button onClick={() => updateQty(it.product.id, it.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(it.product.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-drawer-subtotal">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <button className="cart-drawer-checkout" onClick={goCheckout}>
                Pagar ahora
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
