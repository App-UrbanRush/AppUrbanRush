import { useState, useEffect } from "react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { Users, Loader2, Search } from "lucide-react";
import { vendorCouriersApi, type VendorCourier } from "../../../infrastructure/api/vendorCouriersApi";
import "./VendorCouriers.css";

const VendorCouriers = () => {
  const [couriers, setCouriers] = useState<VendorCourier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCouriers();
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
          <div className="couriers-grid">
            {filtered.map((courier) => (
              <div key={courier.courier_id} className="courier-card">
                <div className="courier-avatar">
                  {courier.name.charAt(0)}
                </div>
                <div className="courier-info">
                  <h3>{courier.name}</h3>
                  <span className={`courier-status ${courier.status.toLowerCase()}`}>
                    {courier.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorCouriers;
