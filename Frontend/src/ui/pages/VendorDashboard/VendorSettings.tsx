import { useState, useEffect } from "react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { Upload, MapPin, Clock, Image as ImageIcon, Save, X, Loader2, Check, Trash2, Phone, FileText } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { storageApi } from "../../../infrastructure/api/storageApi";
import { vendorPhotosApi, type VendorPhoto } from "../../../infrastructure/api/vendorPhotosApi";
import { vendorProfileApi } from "../../../infrastructure/api/vendorProfileApi";
import "./VendorSettings.css";

const VendorSettings = () => {
  const { myProfile, vendorProfile, fetchVendorProfile: refreshVendorProfile } = useAuth();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [logoPreview, setLogoPreview] = useState("");

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoSuccess, setLogoSuccess] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [photos, setPhotos] = useState<VendorPhoto[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (vendorProfile || myProfile) {
      setAddress(vendorProfile?.address || myProfile?.address || "");
      setPhone(vendorProfile?.phone || "");
      setDescription(vendorProfile?.description || "");
      setHours(vendorProfile?.business_hours || "");
      setLogoPreview(vendorProfile?.logo_url || "");
    }
  }, [vendorProfile, myProfile]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await vendorPhotosApi.getAll();
      setPhotos(data);
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoPreview(URL.createObjectURL(file));
    setIsUploadingLogo(true);
    setLogoSuccess(false);
    try {
      const result = await storageApi.uploadVendorLogo(file);
      setLogoPreview(result.logo_url);
      setLogoSuccess(true);
      setTimeout(() => setLogoSuccess(false), 3000);
      refreshVendorProfile();
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Error al subir el logo. Intenta de nuevo.");
      setLogoPreview(vendorProfile?.logo_url || "");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setPhotoSuccess(false);
    try {
      await vendorPhotosApi.upload(file);
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
      await loadPhotos();
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Error al subir la foto. Intenta de nuevo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("¿Eliminar esta foto?")) return;

    setDeletingId(photoId);
    try {
      await vendorPhotosApi.remove(photoId);
      await loadPhotos();
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Error al eliminar la foto.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await vendorProfileApi.updateProfile({
        address,
        business_hours: hours,
        phone,
        description,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      refreshVendorProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error al guardar los cambios. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VendorLayout>
      <div className="vendor-settings">
        <div className="vendor-settings-header">
          <h1>Configuración del Restaurante</h1>
          <p>Administra la información de tu establecimiento</p>
        </div>

        <div className="vendor-settings-content">
          {/* Información básica */}
          <div className="settings-section">
            <h2>Información Básica</h2>
            
            <div className="form-group">
              <label>Logo del Restaurante</label>
              <div className="logo-upload">
                {isUploadingLogo && (
                  <div className="logo-preview uploading">
                    <Loader2 size={32} className="spinner" />
                    <span>Subiendo...</span>
                  </div>
                )}
                {!isUploadingLogo && logoPreview ? (
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Logo preview" />
                    {logoSuccess && (
                      <div className="success-badge">
                        <Check size={16} />
                      </div>
                    )}
                    <button
                      className="remove-logo-btn"
                      onClick={() => setLogoPreview("")}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  !isUploadingLogo && (
                    <label className="upload-area">
                      <Upload size={32} />
                      <span>Subir logo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleLogoChange}
                        hidden
                      />
                    </label>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="settings-section">
            <h2>Contacto</h2>
            
            <div className="form-group">
              <label>
                <Phone size={18} />
                Teléfono
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 300 123 4567"
              />
            </div>

            <div className="form-group">
              <label>
                <MapPin size={18} />
                Dirección
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Calle Principal #123, Ciudad"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="settings-section">
            <h2>Descripción</h2>
            
            <div className="form-group">
              <label>
                <FileText size={18} />
                Acerca de tu restaurante
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu restaurante, especialidades, ambiente..."
                rows={4}
              />
            </div>
          </div>

          {/* Horario */}
          <div className="settings-section">
            <h2>Horario de Atención</h2>
            
            <div className="form-group">
              <label>
                <Clock size={18} />
                Horario
              </label>
              <textarea
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Ej:&#10;Lunes a Viernes: 10:00 AM - 10:00 PM&#10;Sábados y Domingos: 11:00 AM - 11:00 PM"
                rows={4}
              />
            </div>
          </div>

          {/* Fotos del local - Galería */}
          <div className="settings-section">
            <h2>Fotos del Local</h2>
            
            <div className="form-group">
              <label>
                <ImageIcon size={18} />
                Galería de fotos ({photos.length})
              </label>

              <div className="photos-gallery">
                {photos.map((photo) => (
                  <div key={photo.photo_id} className="photo-gallery-item">
                    <img src={photo.image_url} alt={`Foto del local`} />
                    <button
                      className="photo-delete-btn"
                      onClick={() => handleDeletePhoto(photo.photo_id)}
                      disabled={deletingId === photo.photo_id}
                    >
                      {deletingId === photo.photo_id ? (
                        <Loader2 size={14} className="spinner" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))}

                {isUploadingPhoto && (
                  <div className="photo-gallery-item uploading">
                    <Loader2 size={24} className="spinner" />
                    <span>Subiendo...</span>
                  </div>
                )}

                {!isUploadingPhoto && (
                  <label className="photo-gallery-add">
                    <Upload size={24} />
                    <span>{photoSuccess ? "Foto subida!" : "Agregar foto"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      hidden
                    />
                  </label>
                )}
              </div>

              {photos.length === 0 && !isUploadingPhoto && (
                <p className="photos-empty">
                  No hay fotos del local. Sube fotos para que los clientes vean tu establecimiento.
                </p>
              )}
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="settings-actions">
            <button
              className={`save-btn ${saveSuccess ? "saved" : ""}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Guardando...
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={20} />
                  Guardado!
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorSettings;
