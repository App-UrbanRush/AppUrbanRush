import { useState, useEffect } from "react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { Users, Loader2, Search, Package } from "lucide-react";
import { vendorCouriersApi, type VendorCourier } from "../../../infrastructure/api/vendorCouriersApi";
import "./VendorCouriers.css";

const VendorCouriers = () => {
  const [couriers, setCouriers] = useState<VendorCourier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCouriers();
    const interval = setInterval(loadCouriers, 5000);
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

  const filtered = couriers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <VendorLayout>
      <div className="vendor-couriers">
        <div className="couriers-header">
          <div className="couriers-header-left">
            <h1>Domiciliarios Asociados</h1>
            <span className="couriers-count">{couriers.length} total</span>
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

        {loading ? (
          <div className="couriers-loading">
            <Loader2 size={40} className="spinner" />
            <p>Cargando domiciliarios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="couriers-empty">
            <Users size={48} />
            <p>No hay domiciliarios asociados a tu restaurante</p>
          </div>
        ) : (
          <>
            <div className="couriers-table-header">
              <span className="couriers-col-photo">Foto</span>
              <span className="couriers-col-name">Nombre</span>
              <span className="couriers-col-status">Estado Actual</span>
              <span className="couriers-col-action">Acción</span>
            </div>
            <div className="couriers-table">
              {filtered.map((courier) => (
                <div key={courier.courier_id} className="courier-row">
                  <div className="couriers-col-photo">
                    <div className="courier-avatar">
                      {courier.photo_url ? (
                        <img src={courier.photo_url} alt={courier.name} className="courier-avatar-img" />
                      ) : (
                        courier.name.charAt(0)
                      )}
                    </div>
                  </div>
                  <div className="couriers-col-name">
                    <span className="courier-name-text">{courier.name}</span>
                  </div>
                  <div className="couriers-col-status">
                    <span className={`courier-status ${courier.status.toLowerCase()}`}>
                      {courier.status}
                    </span>
                  </div>
                  <div className="couriers-col-action">
                    <button className="courier-assign-btn">
                      <Package size={14} /> Asignar Pedido
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorCouriers;
