import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CreditCard, CheckCircle, XCircle, Package, MapPin,
  ArrowRight, Clock, AlertTriangle, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { ordersApi, type OrderDetail } from "../../../infrastructure/api/ordersApi";
import { paymentApi } from "../../../infrastructure/api/paymentApi";
import type { PaymentResponse } from "../../../domain/types/payment.types";
import { useAuth } from "../../context/useAuth";
import "./PaymentPage.css";

const ORDER_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  PREPARING: "Preparando",
  READY: "Listo",
  IN_DELIVERY: "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const PaymentPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const paymentStatus = payment?.status || null;
  const isPaid = paymentStatus === "APPROVED";
  const isDeclined = paymentStatus === "DECLINED" || paymentStatus === "ERROR" || paymentStatus === "VOIDED";
  const isPending = paymentStatus === "PENDING";
  const noPaymentYet = !payment && !loading && !error;

  const startPolling = useCallback(() => {
    if (!orderId) return;
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const p = await paymentApi.getByOrder(orderId);
        setPayment(p);
        if (p.status === "APPROVED" || p.status === "DECLINED" || p.status === "VOIDED" || p.status === "ERROR") {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // ignore polling errors
      }
    }, 10000);
  }, [orderId]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!orderId) return;
    try {
      const [orderData] = await Promise.all([
        ordersApi.getById(orderId),
      ]);
      setOrder(orderData);

      try {
        const paymentData = await paymentApi.getByOrder(orderId);
        setPayment(paymentData);
        if (paymentData.status === "PENDING") {
          startPolling();
        }
      } catch {
        // No payment yet - that's fine
      }

      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar la factura";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId, startPolling]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Detectar redirect de Wompi (transaction_id en URL params)
  useEffect(() => {
    if (!orderId || !user?.email || loading || !order) return;

    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("transaction_id");
    const reference = params.get("reference");

    if (!transactionId || !reference) return;

    // Limpiar URL silenciosamente
    window.history.replaceState({}, "", window.location.pathname);

    const confirmWompiPayment = async () => {
      try {
        const newPayment = await paymentApi.create({
          order_id: orderId,
          payment_method: { type: "CARD", token: transactionId },
          customer_email: user.email,
          transaction_id: transactionId,
          reference,
        });
        setPayment(newPayment);
        toast.success("Pago iniciado");
        startPolling();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al registrar el pago";
        toast.error(msg);
      }
    };
    confirmWompiPayment();
  }, [orderId, user, order, loading, startPolling]);

  // Re-poll when payment changes to APPROVED or DECLINED
  useEffect(() => {
    if (paymentStatus === "APPROVED" || isDeclined) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [paymentStatus, isDeclined]);

  const wompiLoadedRef = useRef(false);

  const loadWompiScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (wompiLoadedRef.current || (window as any).WidgetCheckout) {
        wompiLoadedRef.current = true;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.onload = () => {
        wompiLoadedRef.current = true;
        resolve();
      };
      script.onerror = () => reject(new Error("No se pudo cargar Wompi"));
      document.head.appendChild(script);
    });
  }, []);

  const handlePay = useCallback(async () => {
    if (!orderId || !user?.email || !order) return;
    setCreatingPayment(true);
    try {
      await loadWompiScript();

      const amountInCents = Math.round(order.total * 100);
      const reference = `urbanrush-${orderId}-${Date.now()}`;

      const config = await paymentApi.getCheckoutConfig(reference, amountInCents);

      const WidgetCheckout = (window as any).WidgetCheckout;
      const checkout = new WidgetCheckout({
        currency: "COP",
        amountInCents,
        reference,
        publicKey: config.publicKey,
        signature: { integrity: config.signature },
      });

      checkout.open(async (result: any) => {
        if (result?.transaction) {
          try {
            const newPayment = await paymentApi.create({
              order_id: orderId,
              payment_method: { type: "CARD", token: result.transaction.id },
              customer_email: user.email,
              transaction_id: result.transaction.id,
              reference,
            });
            setPayment(newPayment);
            toast.success("Pago iniciado");
            startPolling();
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al registrar el pago";
            toast.error(msg);
          }
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar el pago";
      toast.error(msg);
    } finally {
      setCreatingPayment(false);
    }
  }, [orderId, user, order, startPolling, loadWompiScript]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- LOADING ---
  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <div className="payment-spinner" />
          <p>Cargando factura...</p>
        </div>
      </div>
    );
  }

  // --- ERROR ---
  if (error || !order) {
    return (
      <div className="payment-page" style={{ marginTop: 40 }}>
        <div className="payment-invoice">
          <div className="payment-error">
            <AlertTriangle size={48} strokeWidth={1.5} style={{ color: "#dc2626", marginBottom: 16 }} />
            <h2>No se pudo cargar la factura</h2>
            <p>{error || "La orden no existe o no tienes acceso"}</p>
            <button className="payment-btn payment-btn-primary" style={{ display: "inline-flex", width: "auto" }} onClick={() => navigate("/dashboard")}>
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      {/* --- STATUS HEADER --- */}
      <div className="payment-status">
        {isPaid ? (
          <>
            <div className="payment-icon-wrap approved">
              <div className="payment-icon-circle approved">
                <svg className="payment-checkmark-svg" viewBox="0 0 52 52">
                  <circle className="payment-checkmark-circle" cx="26" cy="26" r="24" />
                  <path className="payment-checkmark-path" d="M16 26l6 6 14-14" />
                </svg>
                <div className="payment-confetti">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="payment-confetti-piece" />
                  ))}
                </div>
              </div>
            </div>
            <h2 className="approved">¡Pago confirmado!</h2>
            <p>Tu pago ha sido procesado exitosamente</p>
            <div className="payment-badge approved">
              <CheckCircle size={14} /> Pagado
            </div>
          </>
        ) : isDeclined ? (
          <>
            <div className="payment-icon-wrap declined">
              <div className="payment-icon-circle declined">
                <svg className="payment-x-svg" viewBox="0 0 52 52">
                  <circle className="payment-x-circle" cx="26" cy="26" r="24" />
                  <path className="payment-x-path" d="M18 18l16 16M34 18l-16 16" />
                </svg>
              </div>
            </div>
            <h2 className="declined">Pago rechazado</h2>
            <p>El pago no pudo ser procesado. Intenta de nuevo</p>
            <div className="payment-badge declined">
              <XCircle size={14} /> Rechazado
            </div>
          </>
        ) : (
          <>
            <div className="payment-icon-wrap pending">
              <div className="payment-icon-circle pending">
                <CreditCard size={36} style={{ color: "#e8500a" }} />
              </div>
            </div>
            <h2 className="pending">Esperando pago</h2>
            <p>Estamos esperando la confirmación del pago</p>
            <div className="payment-badge pending">
              <Clock size={14} /> Pendiente
            </div>
          </>
        )}
      </div>

      {/* --- INVOICE --- */}
      <div className="payment-invoice">
        <div className="payment-invoice-head">
          <div>
            <h2>Factura</h2>
            <div className="payment-invoice-id">#{order.order_id.slice(0, 12)}</div>
          </div>
          <div className="payment-invoice-meta">
            <div className="payment-invoice-date">{formatDate(order.created_at)}</div>
          </div>
        </div>

        <div className="payment-items">
          {order.items.map((item: { product_id: string; product_name: string; quantity: number; unit_price: number }) => (
            <div key={item.product_id} className="payment-item">
              <div className="payment-item-img-placeholder">
                <Package size={20} />
              </div>
              <div className="payment-item-info">
                <p className="payment-item-name">{item.product_name}</p>
                <p className="payment-item-meta">{item.quantity} × ${item.unit_price.toLocaleString()}</p>
              </div>
              <span className="payment-item-total">${(item.quantity * item.unit_price).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="payment-totals">
          <div className="payment-total-row">
            <span>Subtotal</span>
            <span>${order.subtotal.toLocaleString()}</span>
          </div>
          <div className="payment-total-row delivery">
            <span>Domicilio</span>
            <span>+ ${order.delivery_fee.toLocaleString()}</span>
          </div>
          <div className="payment-total-row">
            <span>Comisión de plataforma</span>
            <span>+ ${order.platform_commission.toLocaleString()}</span>
          </div>
          <div className="payment-total-row grand">
            <span>Total</span>
            <span>${order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="payment-info-line">
          <MapPin size={16} className="payment-info-line-icon" />
          <div>
            <div className="payment-info-line-label">Dirección de entrega</div>
            <div className="payment-info-line-value">{order.delivery_address}</div>
          </div>
        </div>

        <div className="payment-info-line">
          <Package size={16} className="payment-info-line-icon" />
          <div>
            <div className="payment-info-line-label">Estado del pedido</div>
            <div className="payment-info-line-value">{ORDER_LABELS[order.status] || order.status}</div>
          </div>
        </div>
      </div>

      {/* --- ACTIONS --- */}
      <div className="payment-actions">
        {isPaid && (
          <button className="payment-btn payment-btn-success" onClick={() => navigate(`/tracking/${order.order_id}`)}>
            <Package size={18} /> Ver seguimiento <ArrowRight size={18} />
          </button>
        )}

        {isDeclined && (
          <button className="payment-btn payment-btn-primary" onClick={handlePay} disabled={creatingPayment}>
            <CreditCard size={18} /> {creatingPayment ? "Procesando..." : "Intentar de nuevo"}
          </button>
        )}

        {noPaymentYet && (
          <button className="payment-btn payment-btn-primary" onClick={handlePay} disabled={creatingPayment}>
            <ExternalLink size={18} /> {creatingPayment ? "Conectando con Wompi..." : "Pagar ahora"}
          </button>
        )}

        {isPending && !creatingPayment && (
          <>
            <div className="payment-refresh">
              <div className="payment-refresh-dot" />
              Actualizando cada 10 segundos
            </div>
            <button className="payment-btn payment-btn-primary" onClick={handlePay} disabled={creatingPayment}>
              <ExternalLink size={18} /> Pagar ahora
            </button>
          </>
        )}

        {creatingPayment && (
          <div className="payment-processing">
            <div className="payment-spinner" />
            <p>Conectando con la pasarela de pago Wompi...</p>
          </div>
        )}

        <button className="payment-btn payment-btn-secondary" onClick={() => navigate("/dashboard")}>
          Ir al inicio
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
