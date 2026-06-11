import { useState, useEffect } from "react";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { vendorsApi, type VendorListItem, type VendorPhotoItem } from "../../../infrastructure/api/vendorsApi";
import { courierVendorRequestsApi, type CourierVendorRequest } from "../../../infrastructure/api/courierVendorRequestsApi";
import { Store, MapPin, Phone, Clock, X, Info, Image, CheckCircle, Clock as ClockIcon, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import ActiveDeliveryBanner from "../../components/courier/ActiveDeliveryBanner";
import "./CourierDashboard.css";

const CourierDashboard = () => {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorListItem | null>(null);
  const [vendorPhotos, setVendorPhotos] = useState<VendorPhotoItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [myRequests, setMyRequests] = useState<CourierVendorRequest[]>([]);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);

  useEffect(() => {
    loadVendors();
    loadMyRequests();
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      loadPhotos(selectedVendor.vendor_id);
    } else {
      setVendorPhotos([]);
    }
  }, [selectedVendor]);

  const loadVendors = async () => {
    try {
      const data = await vendorsApi.getAll();
      setVendors(data);
    } catch (error) {
      console.error("Error loading vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const data = await courierVendorRequestsApi.getMyRequests();
      setMyRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const loadPhotos = async (vendorId: number) => {
    setLoadingPhotos(true);
    try {
      const data = await vendorsApi.getPhotos(vendorId);
      setVendorPhotos(data);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const getRequestStatus = (vendorId: number): string | null => {
    const request = myRequests.find((r) => r.vendor_id === vendorId);
    return request ? request.status : null;
  };

  const handleSendRequest = async (vendorId: number) => {
    setSendingRequest(vendorId);
    try {
      await courierVendorRequestsApi.sendRequest(vendorId);
      toast.success("Solicitud enviada correctamente");
      await loadMyRequests();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al enviar solicitud";
      toast.error(msg);
    } finally {
      setSendingRequest(null);
    }
  };

  const renderRequestButton = (vendorId: number) => {
    const status = getRequestStatus(vendorId);

    if (status === "pending") {
      return (
        <button className="courier-dashboard-card-btn-pending" disabled>
          <ClockIcon size={14} /> Solicitud enviada
        </button>
      );
    }

    if (status === "accepted") {
      return (
        <button className="courier-dashboard-card-btn-accepted" disabled>
          <CheckCircle size={14} /> Aceptado
        </button>
      );
    }

    if (status === "rejected") {
      return (
        <button className="courier-dashboard-card-btn-rejected" disabled>
          <XCircle size={14} /> Rechazado
        </button>
      );
    }

    return (
      <button
        className="courier-dashboard-card-btn"
        onClick={() => handleSendRequest(vendorId)}
        disabled={sendingRequest === vendorId}
      >
        {sendingRequest === vendorId ? "Enviando..." : "Registrarme"}
      </button>
    );
  };

  return (
    <CourierLayout>
      <div className="courier-dashboard">
        <ActiveDeliveryBanner />

        <h1>Negocios</h1>
        <p className="courier-dashboard-subtitle">Todos los negocios registrados</p>

        {loading ? (
          <div className="courier-dashboard-loading">Cargando negocios...</div>
        ) : vendors.length === 0 ? (
          <div className="courier-dashboard-empty">No hay negocios registrados</div>
        ) : (
          <div className="courier-dashboard-grid">
            {vendors.map((vendor) => (
              <div key={vendor.vendor_id} className="courier-dashboard-card">
                <div className="courier-dashboard-card-header">
                  {vendor.logo_url ? (
                    <img src={vendor.logo_url} alt={vendor.business_name} className="courier-dashboard-card-logo" />
                  ) : (
                    <div className="courier-dashboard-card-icon">
                      <Store size={24} />
                    </div>
                  )}
                  <div className="courier-dashboard-card-title">
                    <h3>{vendor.business_name}</h3>
                    <span className="courier-dashboard-card-type">{vendor.business_type}</span>
                  </div>
                </div>
                <div className="courier-dashboard-card-body">
                  <div className="courier-dashboard-card-info">
                    <MapPin size={14} />
                    <span>{vendor.address}</span>
                  </div>
                  <div className="courier-dashboard-card-info">
                    <Phone size={14} />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.business_hours && (
                    <div className="courier-dashboard-card-info">
                      <Clock size={14} />
                      <span>{vendor.business_hours}</span>
                    </div>
                  )}
                  {vendor.description && (
                    <p className="courier-dashboard-card-desc">{vendor.description}</p>
                  )}
                  <div className="courier-dashboard-card-actions">
                    {renderRequestButton(vendor.vendor_id)}
                    <button className="courier-dashboard-card-btn-outline" onClick={() => setSelectedVendor(vendor)}>
                      <Info size={14} /> Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedVendor && (
        <div className="courier-modal-overlay" onClick={() => setSelectedVendor(null)}>
          <div className="courier-modal" onClick={(e) => e.stopPropagation()}>
            <button className="courier-modal-close" onClick={() => setSelectedVendor(null)}>
              <X size={20} />
            </button>

            <div className="courier-modal-content">
              <div className="courier-modal-header">
                {selectedVendor.logo_url ? (
                  <img src={selectedVendor.logo_url} alt="Logo" className="courier-modal-logo" />
                ) : (
                  <div className="courier-modal-logo-placeholder">
                    <Store size={24} />
                  </div>
                )}
                <div>
                  <h2>{selectedVendor.business_name}</h2>
                  <span className="courier-modal-type">{selectedVendor.business_type}</span>
                </div>
              </div>

              <div className="courier-modal-section">
                <h3>Información del Negocio</h3>
                <div className="courier-modal-fields">
                  <div className="courier-modal-field">
                    <MapPin size={16} />
                    <div>
                      <span className="courier-modal-label">Dirección</span>
                      <span className="courier-modal-value">{selectedVendor.address}</span>
                    </div>
                  </div>
                  <div className="courier-modal-field">
                    <Phone size={16} />
                    <div>
                      <span className="courier-modal-label">Teléfono</span>
                      <span className="courier-modal-value">{selectedVendor.phone}</span>
                    </div>
                  </div>
                  {selectedVendor.business_hours && (
                    <div className="courier-modal-field">
                      <Clock size={16} />
                      <div>
                        <span className="courier-modal-label">Horario</span>
                        <span className="courier-modal-value">{selectedVendor.business_hours}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedVendor.description && (
                <div className="courier-modal-section">
                  <h3>Descripción</h3>
                  <p className="courier-modal-desc">{selectedVendor.description}</p>
                </div>
              )}

              <div className="courier-modal-section">
                <h3>
                  <Image size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                  Fotos del Local
                </h3>
                {loadingPhotos ? (
                  <p className="courier-modal-photos-loading">Cargando fotos...</p>
                ) : vendorPhotos.length === 0 ? (
                  <p className="courier-modal-photos-empty">No hay fotos disponibles</p>
                ) : (
                  <div className="courier-modal-photos-grid">
                    {vendorPhotos.map((photo) => (
                      <div key={photo.photo_id} className="courier-modal-photo-item">
                        <img src={photo.image_url} alt="Foto del local" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="courier-modal-register">
                {renderRequestButton(selectedVendor.vendor_id)}
              </div>
            </div>
          </div>
        </div>
      )}
    </CourierLayout>
  );
};

export default CourierDashboard;
