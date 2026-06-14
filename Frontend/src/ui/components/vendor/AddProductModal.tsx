import { useState, useEffect, useMemo } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/ProductRepositoryImpl";
import { StorageRepositoryImpl } from "../../../infrastructure/repositories/StorageRepositoryImpl";
import { CreateProductUseCase } from "../../../application/use-cases/CreateProductUseCase";
import { UpdateProductUseCase } from "../../../application/use-cases/UpdateProductUseCase";
import type { Product } from "../../../domain/types/product.types";
import "./AddProductModal.css";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
  editProduct?: Product | null;
  categories?: string[];
}

const AddProductModal = ({ isOpen, onClose, onProductCreated, editProduct, categories = [] }: AddProductModalProps) => {
  const { vendorProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "10",
  });

  const productRepository = useMemo(() => new ProductRepositoryImpl(), []);
  const storageRepository = useMemo(() => new StorageRepositoryImpl(), []);
  const createProductUseCase = useMemo(() => new CreateProductUseCase(productRepository), [productRepository]);
  const updateProductUseCase = useMemo(() => new UpdateProductUseCase(productRepository), [productRepository]);

  const isEditing = !!editProduct;

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        description: editProduct.description,
        price: editProduct.price.toString(),
        category: editProduct.category,
        stock: editProduct.stock.toString(),
      });
      setImagePreview(editProduct.image_url || null);
      setImageFile(null);
    } else {
      setFormData({ name: "", description: "", price: "", category: "", stock: "10" });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editProduct, isOpen]);

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

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const newStock = parseInt(formData.stock) || 10;
        await updateProductUseCase.execute(editProduct.product_id, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock: newStock,
          is_available: newStock > 0,
        });

        if (imageFile) {
          await storageRepository.uploadProductImage(editProduct.product_id, imageFile);
        }
      } else {
        if (!vendorProfile) {
          setError("No se encontró información del restaurante");
          setLoading(false);
          return;
        }

        const newProduct = await createProductUseCase.execute({
          vendor_id: vendorProfile.vendor_id,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock: parseInt(formData.stock) || 10,
        });

        if (imageFile) {
          await storageRepository.uploadProductImage(newProduct.product_id, imageFile);
        }
      }
      onProductCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const uniqueCategories = [...new Set(categories)];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Editar Plato" : "Añadir un Plato"}</h2>
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
                <span>Subir foto del plato</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            )}
          </div>

          <div className="modal-field">
            <label>Nombre del plato</label>
            <input
              type="text"
              placeholder="Ej: Hamburguesa Clásica"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="modal-field">
            <label>Descripción</label>
            <textarea
              placeholder="Describe los ingredientes y detalles del plato..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="modal-field-row">
            <div className="modal-field">
              <label>Precio ($)</label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Stock</label>
              <input
                type="number"
                placeholder="10"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Seleccionar categoría</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal-submit-btn" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Añadir Plato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
