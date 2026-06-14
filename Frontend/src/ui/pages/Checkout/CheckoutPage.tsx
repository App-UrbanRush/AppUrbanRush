import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { ShoppingBag, MapPin, CreditCard, ArrowLeft, ArrowRight, Check, Package, Plus, Minus, Trash2, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/useAuth";
import { ordersApi } from "../../../infrastructure/api/ordersApi";
import "./CheckoutPage.css";

const STEPS = ["Carrito", "Dirección", "Pago", "Factura"];

const DELIVERY_FEE = 3000;
const PLATFORM_COMMISSION_RATE = 0.15;

interface LocationMarkerProps {
  onMove: (lat: number, lng: number) => void;
  onDblClick?: (lat: number, lng: number) => void;
}

const LocationMarker = ({ onMove, onDblClick }: LocationMarkerProps) => {
  useMapEvents({
    dragend: (e) => {
      const { lat, lng } = e.target.getCenter();
      onMove(lat, lng);
    },
    dblclick: (e) => {
      const { lat, lng } = e.latlng;
      onDblClick?.(lat, lng);
    },
  });
  return null;
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

const CheckoutPage = () => {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { myProfile, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(myProfile?.address || "");
  const [coords, setCoords] = useState({ lat: 4.711, lng: -74.0721 });
  const [markerCoords, setMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleLocateMe = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        toast.success("Ubicación obtenida");
        setLocating(false);
      },
      () => {
        toast.error("No se pudo acceder a tu ubicación");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const updateLocation = useCallback((lat: number, lng: number) => {
    setCoords({ lat, lng });
    setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setMarkerCoords(null);
  }, []);

  const handleDblClick = useCallback((lat: number, lng: number) => {
    setCoords({ lat, lng });
    setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setMarkerCoords({ lat, lng });
  }, []);

  // Geocodificar dirección o parsear coordenadas
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAddressChange = useCallback((value: string) => {
    setAddress(value);
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);

    // Detectar si el texto son coordenadas numéricas: "lat, lng" o "lat lng"
    const coordMatch = value.trim().match(/^(-?\d+\.?\d*)\s*[,;\s]\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setCoords({ lat, lng });
        return;
      }
    }

    if (value.trim().length < 5) return;
    geocodeTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=1&accept-language=es`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch {
        // Si falla la geocodificación, no actualizar coordenadas
      }
    }, 800);
  }, []);

  const canContinue = useMemo(() => {
    if (step === 0) return items.length > 0;
    if (step === 1) return address.trim().length > 0;
    return true;
  }, [step, items, address]);

  const deliveryFee = DELIVERY_FEE;
  const platformCommission = Math.round(totalPrice * PLATFORM_COMMISSION_RATE);
  const estimatedTotal = totalPrice + deliveryFee + platformCommission;

  const handleSubmitOrder = useCallback(async () => {
    if (!user?.id || !user?.email) {
      toast.error("Debes iniciar sesión para continuar");
      return;
    }

    setSubmitting(true);
    try {
      const userId = Number(user.id);
      const productIds = [...new Set(items.map((i) => i.product.vendor_id))];

      if (productIds.length > 1) {
        toast.error("Por ahora solo se soportan pedidos de un solo negocio");
        setSubmitting(false);
        return;
      }

      const vendorId = productIds[0];
      const orderItems = items
        .filter((i) => i.product.vendor_id === vendorId)
        .map((i) => ({
          product_id: i.product.product_id,
          quantity: i.quantity,
        }));

      const order = await ordersApi.create({
        user_id: userId,
        vendor_id: vendorId,
        delivery_address: address,
        items: orderItems,
        customer_lat: coords.lat,
        customer_lng: coords.lng,
      });

      clearCart();
      navigate(`/payment/${order.order_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear el pedido";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [items, user, address, clearCart, navigate]);

  if (items.length === 0 && !submitting) {
    return (
      <div className="checkout-wrapper">
        <div className="checkout-card" style={{ textAlign: "center", padding: "60px 28px" }}>
          <Package size={48} strokeWidth={1.5} style={{ color: "#9ca3af", marginBottom: 16 }} />
          <h2 style={{ margin: "0 0 8px", color: "#1f2937" }}>Tu carrito está vacío</h2>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>
            Agrega productos desde las tiendas para iniciar un pedido
          </p>
          <button
            className="checkout-btn checkout-btn-primary"
            style={{ display: "inline-flex", width: "auto" }}
            onClick={() => navigate("/stores")}
          >
            Ver tiendas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <h1>Checkout</h1>
      <p className="checkout-subtitle">Revisa tu pedido antes de pagar</p>

      {/* Step indicator */}
      <div className="checkout-steps">
        {STEPS.map((label, i) => (
          <span key={label} className="checkout-step-wrapper" style={{ display: "contents" }}>
            {i > 0 && <div className={`checkout-step-line ${i <= step ? "completed" : ""}`} />}
            <div className={`checkout-step ${i === step ? "active" : ""} ${i < step ? "completed" : ""} ${i > step ? "pending" : ""}`}>
              <div className="checkout-step-number">
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className="checkout-step-label">{label}</span>
            </div>
          </span>
        ))}
      </div>

      {/* Step 0: Cart Review */}
      {step === 0 && (
        <div className="checkout-card">
          <h2><ShoppingBag size={20} /> Productos</h2>
          <div>
            {items.map((item) => (
              <div key={item.product.product_id} className="checkout-cart-item">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="checkout-cart-item-img" />
                ) : (
                  <div className="checkout-cart-item-img-placeholder">
                    <Package size={24} />
                  </div>
                )}
                <div className="checkout-cart-item-info">
                  <p className="checkout-cart-item-name">{item.product.name}</p>
                  <p className="checkout-cart-item-price">${item.product.price.toLocaleString()} c/u</p>
                  <div className="checkout-cart-item-bottom">
                    <button className="checkout-cart-qty-btn" onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Minus size={12} />
                    </button>
                    <span className="checkout-cart-qty">{item.quantity}</span>
                    <button className="checkout-cart-qty-btn" onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}>
                      <Plus size={12} />
                    </button>
                    <button className="checkout-cart-remove" onClick={() => removeItem(item.product.product_id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <span className="checkout-cart-item-total">${(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <div className="checkout-summary-row total">
              <span>Total</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="checkout-actions">
            <button className="checkout-btn checkout-btn-secondary" onClick={() => navigate("/stores")}>
              <ArrowLeft size={16} /> Seguir comprando
            </button>
            <button className="checkout-btn checkout-btn-primary" disabled={!canContinue} onClick={() => setStep(1)}>
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="checkout-card">
          <h2><MapPin size={20} /> Dirección de entrega</h2>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              className="checkout-address-input"
              type="text"
              placeholder="Ej: 4.711, -74.0721 o una dirección"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="checkout-btn checkout-btn-secondary"
              onClick={handleLocateMe}
              disabled={locating}
              style={{ padding: "12px 16px", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              <Navigation size={16} className={locating ? "checkout-locating-icon" : ""} />
              {locating ? "Buscando..." : "Buscar"}
            </button>
          </div>
          <div className="checkout-map">
            <MapContainer center={[coords.lat, coords.lng]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker onMove={updateLocation} onDblClick={handleDblClick} />
              {markerCoords && <Marker position={[markerCoords.lat, markerCoords.lng]} />}
              <RecenterMap lat={coords.lat} lng={coords.lng} />
            </MapContainer>
          </div>
          <div className="checkout-coords-info">
            <MapPin size={14} /> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </div>
          <div className="checkout-actions">
            <button className="checkout-btn checkout-btn-secondary" onClick={() => setStep(0)}>
              <ArrowLeft size={16} /> Atrás
            </button>
            <button className="checkout-btn checkout-btn-primary" disabled={!canContinue} onClick={() => setStep(2)}>
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="checkout-card">
          <h2><CreditCard size={20} /> Método de pago</h2>

          <div className="checkout-payment-option selected">
            <input type="radio" checked readOnly />
            <div className="checkout-payment-option-info">
              <p className="checkout-payment-option-name">Tarjeta de crédito / débito</p>
              <p className="checkout-payment-option-desc">Paga con Wompi — VISA, Mastercard, American Express</p>
            </div>
            <CreditCard size={24} style={{ color: "#e8500a" }} />
          </div>

          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Dirección</span>
              <span style={{ maxWidth: "50%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis" }}>{address}</span>
            </div>
            <div className="checkout-summary-row total">
              <span>Total a pagar</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="checkout-actions">
            <button className="checkout-btn checkout-btn-secondary" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Atrás
            </button>
            <button className="checkout-btn checkout-btn-primary" onClick={() => setStep(3)}>
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Invoice / Summary */}
      {step === 3 && (
        <div className="checkout-card">
          <h2><Package size={20} /> Resumen del pedido</h2>

          {/* Products */}
          <div>
            {items.map((item) => (
              <div key={item.product.product_id} className="checkout-cart-item">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="checkout-cart-item-img" />
                ) : (
                  <div className="checkout-cart-item-img-placeholder">
                    <Package size={24} />
                  </div>
                )}
                <div className="checkout-cart-item-info">
                  <p className="checkout-cart-item-name">{item.product.name}</p>
                  <p className="checkout-cart-item-price">${item.product.price.toLocaleString()} c/u × {item.quantity}</p>
                </div>
                <span className="checkout-cart-item-total">${(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div style={{ padding: "14px 0", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <MapPin size={16} style={{ color: "#e8500a", marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Dirección</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#1f2937" }}>{address}</div>
            </div>
          </div>

          {/* Payment method */}
          <div style={{ padding: "14px 0", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <CreditCard size={16} style={{ color: "#e8500a", marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Método de pago</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#1f2937" }}>Tarjeta de crédito / débito (Wompi)</div>
            </div>
          </div>

          {/* Totals */}
          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Domicilio</span>
              <span style={{ color: "#22a44e" }}>+ ${deliveryFee.toLocaleString()}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Comisión de plataforma ({(PLATFORM_COMMISSION_RATE * 100).toFixed(0)}%)</span>
              <span>+ ${platformCommission.toLocaleString()}</span>
            </div>
            <div className="checkout-summary-row total">
              <span>Total</span>
              <span>${estimatedTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="checkout-actions">
            <button className="checkout-btn checkout-btn-secondary" onClick={() => setStep(2)}>
              <ArrowLeft size={16} /> Atrás
            </button>
            <button
              className="checkout-btn checkout-btn-primary"
              disabled={submitting}
              onClick={handleSubmitOrder}
            >
              {submitting ? "Creando pedido..." : "Confirmar pedido"}
            </button>
          </div>
        </div>
      )}

      {submitting && (
        <div className="checkout-card">
          <div className="checkout-loading">
            <div className="checkout-spinner" />
            <p>Creando tu pedido...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
