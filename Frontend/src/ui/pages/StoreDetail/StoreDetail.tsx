import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorsApi, type VendorListItem, type VendorPhotoItem } from "../../../infrastructure/api/vendorsApi";
import { Store, MapPin, Phone, Clock, Image, ArrowLeft } from "lucide-react";
import "./StoreDetail.css";

const StoreDetail = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorListItem | null>(null);
  const [photos, setPhotos] = useState<VendorPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    loadStoreDetail();
  }, [storeId]);

  useEffect(() => {
    if (vendor) {
      loadPhotos();
    }
  }, [vendor]);

  const loadStoreDetail = async () => {
    try {
      setLoading(true);
      const vendors = await vendorsApi.getAll();
      const foundVendor = vendors.find((v) => v.vendor_id === parseInt(storeId || "0"));
      if (foundVendor) {
        setVendor(foundVendor);
      } else {
        navigate("/stores");
      }
    } catch (error) {
      console.error("Error loading store detail:", error);
      navigate("/stores");
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    if (!vendor) return;
    setLoadingPhotos(true);
    try {
      const data = await vendorsApi.getPhotos(vendor.vendor_id);
      setPhotos(data);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  if (loading) {
    return (
      <div className="store-detail-loading">
        Cargando detalles...
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="store-detail-error">
        Tienda no encontrada
      </div>
    );
  }

  return (
    <div className="store-detail-container dark-mode-wrapper">
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={18} />
        Atrás
      </button>

      <div className="store-detail-content">
        <div className="store-detail-header">
          {vendor.logo_url ? (
            <img src={vendor.logo_url} alt="Logo" className="store-detail-logo" />
          ) : (
            <div className="store-detail-logo-placeholder">
              <Store size={24} />
            </div>
          )}
          <div>
            <h1>{vendor.business_name}</h1>
            <span className="store-detail-type">{vendor.business_type}</span>
          </div>
        </div>

        <div className="store-detail-section">
          <h3>Información del Negocio</h3>
          <div className="store-detail-fields">
            <div className="store-detail-field">
              <MapPin size={16} />
              <div>
                <span className="store-detail-label">Dirección</span>
                <span className="store-detail-value">{vendor.address}</span>
              </div>
            </div>
            <div className="store-detail-field">
              <Phone size={16} />
              <div>
                <span className="store-detail-label">Teléfono</span>
                <span className="store-detail-value">{vendor.phone}</span>
              </div>
            </div>
            {vendor.business_hours && (
              <div className="store-detail-field">
                <Clock size={16} />
                <div>
                  <span className="store-detail-label">Horario</span>
                  <span className="store-detail-value">{vendor.business_hours}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {vendor.description && (
          <div className="store-detail-section">
            <h3>Descripción</h3>
            <p className="store-detail-desc">{vendor.description}</p>
          </div>
        )}

        <div className="store-detail-section">
          <h3>
            <Image size={16} />
            Fotos del Local
          </h3>
          {loadingPhotos ? (
            <p className="store-detail-photos-loading">Cargando fotos...</p>
          ) : photos.length === 0 ? (
            <p className="store-detail-photos-empty">No hay fotos disponibles</p>
          ) : (
            <div className="store-detail-photos-grid">
              {photos.map((photo) => (
                <div key={photo.photo_id} className="store-detail-photo-item">
                  <img src={photo.image_url} alt="Foto del local" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;
