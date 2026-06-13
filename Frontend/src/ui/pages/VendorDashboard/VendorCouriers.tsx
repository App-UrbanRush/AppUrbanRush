import { useState, useEffect, useMemo } from "react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { Bike, Search, Users, Loader2, Phone, Truck, Hash } from "lucide-react";
import { vendorCouriersApi, type VendorCourier } from "../../../infrastructure/api/vendorCouriersApi";
import "./VendorCouriers.css";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Activo", className: "active" },
  PENDING: { label: "Pendiente", className: "pending" },
  INACTIVE: { label: "Inactivo", className: "inactive" },
};

const VEHICLE_ICONS: Record<string, string> = {
  MOTO: "🏍️",
  CARRO: "🚗",
  BICICLETA: "🚲",
  CAMION: "🚛",
};

const VendorCouriers = () => {
  const [couriers, setCouriers] = useState<VendorCourier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("todos");

  useEffect(() => {
    loadCouriers();
    const interval = setInterval(loadCouriers, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadCouriers = async () => {
    try {
      const data = await vendorCouriersApi.getAll();
      setCouriers(data);
    } catch (error) {
      console.error("Error loading couriers:", error);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => ({
    todos: couriers.length,
    active: couriers.filter(c => c.status === "ACTIVE").length,
    pending: couriers.filter(c => c.status === "PENDING").length,
    inactive: couriers.filter(c => c.status === "INACTIVE").length,
  }), [couriers]);

  const filtered = useMemo(() => {
    let result = couriers;
    if (filter !== "todos") {
      result = result.filter(c => c.status.toLowerCase() === filter);
    }
    if (search) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [couriers, filter, search]);

  const tabs = [
    { key: "todos", label: "Todos", count: counts.todos },
    { key: "active", label: "Activos", count: counts.active },
    { key: "inactive", label: "Inactivos", count: counts.inactive },
  ];

  const getVehicleLabel = (type: string | null) => {
    if (!type) return "Vehículo no especificado";
    const labels: Record<string, string> = {
      MOTO: "Moto",
      CARRO: "Carro",
      BICICLETA: "Bicicleta",
      CAMION: "Camión",
    };
    return labels[type] || type;
  };

  return (
    <VendorLayout>
      <div className="vendor-couriers">
        <div className="couriers-header">
          <div className="couriers-header-left">
            <div className="couriers-header-icon">
              <Bike size={24} />
            </div>
            <div>
              <h1>Domiciliarios Asociados</h1>
              <p className="couriers-header-subtitle">
                {couriers.length} domiciliario{couriers.length !== 1 ? "s" : ""} vinculado{couriers.length !== 1 ? "s" : ""} a tu negocio
              </p>
            </div>
          </div>
          <div className="couriers-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="couriers-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`couriers-tab ${filter === tab.key ? "active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className="couriers-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="couriers-loading">
            <Loader2 size={40} className="spinner" />
            <p>Cargando domiciliarios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="couriers-empty">
            <Users size={48} />
            <h3>{search ? "Sin resultados" : "No hay domiciliarios asociados"}</h3>
            <p>
              {search
                ? `No se encontraron domiciliarios con el nombre "${search}"`
                : "Los domiciliarios que acepten trabajar contigo aparecerán aquí"}
            </p>
          </div>
        ) : (
          <div className="couriers-grid">
            {filtered.map((courier) => {
              const statusConf = STATUS_CONFIG[courier.status] || { label: courier.status, className: "" };
              const vehicleIcon = VEHICLE_ICONS[courier.vehicle_type || ""] || "🛵";
              return (
                <div key={courier.courier_id} className="courier-card">
                  <div className="courier-card-top">
                    <div className="courier-card-avatar-wrapper">
                      <div className="courier-card-avatar">
                        {courier.photo_url ? (
                          <img src={courier.photo_url} alt={courier.name} />
                        ) : (
                          courier.name.charAt(0)
                        )}
                      </div>
                      <span className={`courier-card-status-dot ${statusConf.className}`} />
                    </div>
                    <div className="courier-card-info">
                      <h3 className="courier-card-name">{courier.name}</h3>
                      <span className="courier-card-vehicle">
                        {vehicleIcon} {getVehicleLabel(courier.vehicle_type)}
                      </span>
                    </div>
                    <span className={`courier-card-status ${statusConf.className}`}>
                      {statusConf.label}
                    </span>
                  </div>
                  <div className="courier-card-bottom">
                    <div className="courier-card-detail">
                      <Hash size={14} />
                      <span>ID #{courier.courier_id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorCouriers;
