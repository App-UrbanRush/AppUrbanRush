import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag, Package, CreditCard } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/useAuth";
import "./CartDrawer.css";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`cart-drawer-overlay${isOpen ? " open" : ""}`} onClick={onClose} />
      <div className={`cart-drawer${isOpen ? " open" : ""}`} ref={drawerRef}>
        <div className="cart-drawer-header">
          <h2>
            <ShoppingBag size={20} />
            Carrito
            <span>({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>
          </h2>
          <button className="cart-drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div className="cart-drawer-empty">
              <Package size={48} strokeWidth={1.5} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.product_id} className="cart-drawer-item">
                {item.product.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="cart-drawer-item-img"
                  />
                ) : (
                  <div className="cart-drawer-item-img-placeholder">
                    <Package size={24} />
                  </div>
                )}
                <div className="cart-drawer-item-info">
                  <p className="cart-drawer-item-name">{item.product.name}</p>
                  <p className="cart-drawer-item-price">${item.product.price.toLocaleString()}</p>
                  <div className="cart-drawer-item-bottom">
                    <button
                      className="cart-drawer-qty-btn"
                      onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cart-drawer-qty">{item.quantity}</span>
                    <button
                      className="cart-drawer-qty-btn"
                      onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="cart-drawer-remove"
                      onClick={() => removeItem(item.product.product_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-total">
              <span className="cart-drawer-total-label">Total</span>
              <span className="cart-drawer-total-value">${totalPrice.toLocaleString()}</span>
            </div>
            <button
              className="cart-drawer-checkout-btn"
              onClick={() => { onClose(); navigate(isAuthenticated ? "/checkout" : "/login"); }}
            >
              <CreditCard size={18} />
              Pagar ahora
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
