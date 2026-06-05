import { useState, useMemo } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { CategoryRepositoryImpl } from "../../../infrastructure/repositories/CategoryRepositoryImpl";
import { StorageRepositoryImpl } from "../../../infrastructure/repositories/StorageRepositoryImpl";
import "./AddCategoryModal.css";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }: AddCategoryModalProps) => {
  const { vendorProfile } = useAuth();
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const categoryRepository = useMemo(() => new CategoryRepositoryImpl(), []);
  const storageRepository = useMemo(() => new StorageRepositoryImpl(), []);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    if (!vendorProfile) {
      setError("No se encontró información del restaurante");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const result = await storageRepository.uploadImage(imageFile, "categories");
        imageUrl = result.image_url;
      }

      await categoryRepository.createCategory(vendorProfile.vendor_id, name.trim(), imageUrl);
      onCategoryAdded();
      onClose();
      setName("");
      setImagePreview(null);
      setImageFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Añadir Categoría</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="modal-error">{error}</div>}

          <div className="modal-image-section">
            {imagePreview ? (
              <div className="modal-image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="modal-image-remove"
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="modal-image-upload">
                <ImageIcon size={36} />
                <span>Subir imagen</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} hidden />
              </label>
            )}
          </div>

          <div className="modal-field">
            <label>Nombre de la categoría</label>
            <input
              type="text"
              placeholder="Ej: Tacos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal-submit-btn" disabled={loading}>
              {loading ? "Guardando..." : "Añadir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
