import { useState, useEffect } from "react";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import { Upload, MapPin, Clock, Image as ImageIcon, Save, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import "./VendorSettings.css";

const VendorSettings = () => {
  const { myProfile, vendorProfile } = useAuth();
  const [formData, setFormData] = useState({
    restaurantName: "",
    logo: null as File | null,
    logoPreview: "",
    address: "",
    hours: "",
    photos: [] as File[],
    photoPreviews: [] as string[],
  });

  useEffect(() => {
    if (vendorProfile || myProfile) {
      setFormData((prev) => ({
        ...prev,
        restaurantName: vendorProfile?.business_name || "",
        address: vendorProfile?.address || myProfile?.address || "",
      }));
    }
  }, [vendorProfile, myProfile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        logo: file,
        logoPreview: URL.createObjectURL(file),
      });
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => URL.createObjectURL(file));
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files],
      photoPreviews: [...formData.photoPreviews, ...previews],
    });
  };

  const removePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
      photoPreviews: formData.photoPreviews.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    console.log("Guardando configuración:", formData);
    // Aquí iría la lógica para guardar en el backend
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
              <label>Nombre del Restaurante</label>
              <input
                type="text"
                value={formData.restaurantName}
                readOnly
                placeholder="Ej: La Cocina de Mamá"
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label>Logo del Restaurante</label>
              <div className="logo-upload">
                {formData.logoPreview ? (
                  <div className="logo-preview">
                    <img src={formData.logoPreview} alt="Logo preview" />
                    <button
                      className="remove-logo-btn"
                      onClick={() => setFormData({ ...formData, logo: null, logoPreview: "" })}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="upload-area">
                    <Upload size={32} />
                    <span>Subir logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      hidden
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="settings-section">
            <h2>Ubicación</h2>
            
            <div className="form-group">
              <label>
                <MapPin size={18} />
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Calle Principal #123, Ciudad"
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
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="Ej:&#10;Lunes a Viernes: 10:00 AM - 10:00 PM&#10;Sábados y Domingos: 11:00 AM - 11:00 PM"
                rows={4}
              />
            </div>
          </div>

          {/* Fotos del local */}
          <div className="settings-section">
            <h2>Fotos del Local</h2>
            
            <div className="form-group">
              <label>
                <ImageIcon size={18} />
                Galería de fotos
              </label>
              <div className="photos-upload">
                {formData.photoPreviews.length > 0 && (
                  <div className="photos-grid">
                    {formData.photoPreviews.map((preview, index) => (
                      <div key={index} className="photo-item">
                        <img src={preview} alt={`Photo ${index + 1}`} />
                        <button
                          className="remove-photo-btn"
                          onClick={() => removePhoto(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="upload-photo-btn">
                  <Upload size={20} />
                  <span>Agregar foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosChange}
                    hidden
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="settings-actions">
            <button className="save-btn" onClick={handleSave}>
              <Save size={20} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorSettings;