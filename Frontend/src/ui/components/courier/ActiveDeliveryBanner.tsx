import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation, MapPin, Package, ExternalLink, Bike } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { GetCourierOrdersUseCase } from "../../../application/use-cases/GetCourierOrdersUseCase";
import { CourierOrdersRepositoryImpl } from "../../../infrastructure/repositories/CourierOrdersRepositoryImpl";
import type { CourierOrder } from "../../../domain/types/courier-orders.types";
import "./ActiveDeliveryBanner.css";

const getCourierOrders = new GetCourierOrdersUseCase(new CourierOrdersRepositoryImpl());

const ActiveDeliveryBanner = () => {
  const navigate = useNavigate();
  const { courierProfile, fetchCourierProfile } = useAuth();
  const [active, setActive] = useState<CourierOrder | null>(null);

  useEffect(() => {
    if (!courierProfile) fetchCourierProfile();
  }, [courierProfile, fetchCourierProfile]);

  useEffect(() => {
    if (!courierProfile?.couriers_id) return;
    getCourierOrders
      .execute(courierProfile.couriers_id)
      .then((orders) => {
        const inDelivery = orders.find((o) => o.status === "IN_DELIVERY");
        setActive(inDelivery ?? null);
      })
      .catch((e) => console.error("Error cargando entrega activa:", e));
  }, [courierProfile]);

  if (!active) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(active.delivery_address)}`;

  return (
    <div className="active-delivery">
      <div className="active-delivery-glow" />
      <div className="active-delivery-head">
        <span className="active-delivery-pill">
          <span className="active-delivery-dot" /> Entrega en curso
        </span>
        <span className="active-delivery-id">#{active.order_id.slice(-6).toUpperCase()}</span>
      </div>

      <div className="active-delivery-body">
        <div className="active-delivery-icon">
          <Bike size={30} />
        </div>
        <div className="active-delivery-info">
          <div className="active-delivery-row">
            <MapPin size={16} />
            <span>{active.delivery_address}</span>
          </div>
          <div className="active-delivery-meta">
            <span><Package size={14} /> {active.items.length} producto(s)</span>
            <span className="active-delivery-fee">Ganas ${active.delivery_fee.toLocaleString("es-CO")}</span>
          </div>
        </div>
      </div>

      <div className="active-delivery-actions">
        <button
          className="active-delivery-btn primary"
          onClick={() => navigate(`/courier/tracking/${active.order_id}`)}
        >
          <Navigation size={17} /> Compartir ubicación
        </button>
        <a className="active-delivery-btn outline" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={17} /> Abrir en Maps
        </a>
      </div>
    </div>
  );
};

export default ActiveDeliveryBanner;
