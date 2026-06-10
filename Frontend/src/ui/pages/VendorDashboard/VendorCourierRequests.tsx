import { useState, useEffect } from "react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import {
  courierVendorRequestsApi,
  type CourierVendorRequest,
  type CourierDetails,
} from "../../../infrastructure/api/courierVendorRequestsApi";
import { Send, Clock, CheckCircle, XCircle, Eye, X, User, Truck, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import "./VendorCourierRequests.css";

const VendorCourierRequests = () => {
  const [requests, setRequests] = useState<CourierVendorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<CourierDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await courierVendorRequestsApi.getVendorRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await courierVendorRequestsApi.acceptRequest(requestId);
      toast.success("Solicitud aceptada");
      await loadRequests();
    } catch (error) {
      toast.error("Error al aceptar solicitud");
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await courierVendorRequestsApi.rejectRequest(requestId);
      toast.error("Solicitud rechazada");
      await loadRequests();
    } catch (error) {
      toast.error("Error al rechazar solicitud");
    }
  };

  const handleViewDetails = async (userId: number) => {
    setLoadingDetails(true);
    setShowModal(true);
    try {
      const details = await courierVendorRequestsApi.getCourierDetails(userId);
      setSelectedCourier(details);
    } catch (error) {
      toast.error("Error al cargar detalles");
      setShowModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "accepted":
        return <CheckCircle size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  return (
    <VendorLayout>
      <div className="vendor-requests">
        <h1>Solicitudes de Domiciliarios</h1>
        <p className="vendor-requests-subtitle">Domiciliarios que quieren trabajar contigo</p>

        {loading ? (
          <div className="vendor-requests-loading">Cargando solicitudes...</div>
        ) : requests.length === 0 ? (
          <div className="vendor-requests-empty">
            <Send size={48} />
            <p>No hay solicitudes pendientes</p>
          </div>
        ) : (
          <div className="vendor-requests-list">
            {requests.map((request) => (
              <div key={request.id} className={`vendor-requests-card ${request.status}`}>
                <div className="vendor-requests-card-info">
                  <div className="vendor-requests-card-icon">
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <span className="vendor-requests-card-title">
                      {request.courier_name || "Sin nombre"}
                    </span>
                    <span className="vendor-requests-card-date">
                      {new Date(request.created_at).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="vendor-requests-card-actions">
                  <span className={`vendor-requests-card-status ${request.status}`}>
                    {request.status === "pending" && "Pendiente"}
                    {request.status === "accepted" && "Aceptada"}
                    {request.status === "rejected" && "Rechazada"}
                  </span>
                  <div className="vendor-requests-card-buttons">
                    <button
                      className="vendor-requests-btn-details"
                      onClick={() => handleViewDetails(request.courier_user_id)}
                    >
                      <Eye size={14} />
                      Detalles
                    </button>
                    <button
                      className="vendor-requests-btn-accept"
                      onClick={() => handleAccept(request.id!)}
                    >
                      Aceptar
                    </button>
                    <button
                      className="vendor-requests-btn-reject"
                      onClick={() => handleReject(request.id!)}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="vendor-requests-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="vendor-requests-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vendor-requests-modal-header">
              <h2>Detalles del Domiciliario</h2>
              <button className="vendor-requests-modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {loadingDetails ? (
              <div className="vendor-requests-modal-loading">Cargando información...</div>
            ) : selectedCourier && (
              <div className="vendor-requests-modal-content">
                <div className="vendor-requests-modal-section">
                  <h3><User size={16} /> Datos Personales</h3>
                  <div className="vendor-requests-modal-grid">
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label">Nombre</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.firstName} {selectedCourier.firstLastName}</span>
                    </div>
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label">Cédula</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.document_number || "No registrado"}</span>
                    </div>
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label">Género</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.gender || "No registrado"}</span>
                    </div>
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label">Dirección</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.address || "No registrada"}</span>
                    </div>
                  </div>
                </div>

                <div className="vendor-requests-modal-section">
                  <h3><Truck size={16} /> Datos del Vehículo</h3>
                  <div className="vendor-requests-modal-grid">
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label">Tipo</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.vehicle_type || "No registrado"}</span>
                    </div>
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label">Placa</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.vehicle_plate || "No registrada"}</span>
                    </div>
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label">SOAT</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.soat_number || "No registrado"}</span>
                    </div>
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label">Estado</span>
                      <span className={`vendor-requests-modal-status ${selectedCourier.courier_status?.toLowerCase()}`}>
                        {selectedCourier.courier_status || "No disponible"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="vendor-requests-modal-section">
                  <h3><Mail size={16} /> Contacto</h3>
                  <div className="vendor-requests-modal-grid">
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label"><Mail size={14} /> Correo</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.email || "No registrado"}</span>
                    </div>
                    <div className="vendor-requests-modal-field">
                      <span className="vendor-requests-modal-label"><Phone size={14} /> Celular</span>
                      <span className="vendor-requests-modal-value">{selectedCourier.cellphone || "No registrado"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </VendorLayout>
  );
};

export default VendorCourierRequests;
