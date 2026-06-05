import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import AddCategoryModal from "../../components/vendor/AddCategoryModal";
import ConfirmDeleteModal from "../../components/vendor/ConfirmDeleteModal";
import SuccessAlert from "../../components/vendor/SuccessAlert";
import ErrorAlert from "../../components/vendor/ErrorAlert";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/ProductRepositoryImpl";
import { CategoryRepositoryImpl } from "../../../infrastructure/repositories/CategoryRepositoryImpl";
import { GetProductsByVendorUseCase } from "../../../application/use-cases/GetProductsByVendorUseCase";
import { DeleteCategoryUseCase } from "../../../application/use-cases/DeleteCategoryUseCase";
import type { Product } from "../../../domain/types/product.types";
import type { Category } from "../../../domain/interfaces/ICategoryRepository";
import { Plus, Trash2 } from "lucide-react";
import "./VendorCategories.css";

interface CategoryCard {
  category_id: string;
  name: string;
  image_url: string;
  productCount: number;
  isCustom: boolean;
}

const VendorCategories = () => {
  const { vendorProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryCard | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const productRepository = useMemo(() => new ProductRepositoryImpl(), []);
  const categoryRepository = useMemo(() => new CategoryRepositoryImpl(), []);
  const getProductsByVendorUseCase = useMemo(() => new GetProductsByVendorUseCase(productRepository), [productRepository]);
  const deleteCategoryUseCase = useMemo(() => new DeleteCategoryUseCase(categoryRepository), [categoryRepository]);

  const fetchProducts = useCallback(async () => {
    if (!vendorProfile) return;
    try {
      const data = await getProductsByVendorUseCase.execute(vendorProfile.vendor_id);
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }, [getProductsByVendorUseCase, vendorProfile]);

  const loadCategories = useCallback(async () => {
    if (!vendorProfile) return;
    try {
      const data = await categoryRepository.getCategoriesByVendor(vendorProfile.vendor_id);
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }, [categoryRepository, vendorProfile]);

  const handleDeleteCategory = (card: CategoryCard) => {
    if (card.productCount > 0) {
      setShowError(true);
      return;
    }
    setDeleteTarget(card);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategoryUseCase.execute(deleteTarget.category_id);
      setDeleteTarget(null);
      setShowSuccess(true);
      loadCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    fetchProducts();
    loadCategories();
  }, [fetchProducts, loadCategories]);

  const categoryCount: Record<string, number> = {};
  products.forEach((p) => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  const allCategories: CategoryCard[] = categories.map((cat) => ({
    category_id: cat.category_id,
    name: cat.name,
    image_url: cat.image_url,
    productCount: categoryCount[cat.name] || 0,
    isCustom: true,
  }));

  const productCategoryNames = new Set(categories.map((c) => c.name));
  Object.keys(categoryCount).forEach((catName) => {
    if (!productCategoryNames.has(catName)) {
      allCategories.push({
        category_id: "",
        name: catName,
        image_url: "",
        productCount: categoryCount[catName],
        isCustom: false,
      });
    }
  });

  return (
    <VendorLayout>
      <div className="vendor-categories">
        <div className="vendor-categories-header">
          <h1>Gestionar Categorías</h1>
          <button className="add-category-btn" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Añadir Categoría
          </button>
        </div>

        <div className="categories-grid">
          {allCategories.map((category) => (
            <div key={category.name} className="category-card">
              {category.image_url ? (
                <div
                  className="category-card-bg"
                  style={{ backgroundImage: `url(${category.image_url})` }}
                />
              ) : (
                <div className="category-card-bg category-card-no-image" />
              )}
              <div className="category-card-overlay" />
              <div className="category-card-content">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">{category.productCount} productos</p>
              </div>
              {category.isCustom && (
                <button
                  className="category-delete-btn"
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category); }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <AddCategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCategoryAdded={loadCategories}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.name || ""}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteTarget(null)}
      />

      {showSuccess && (
        <SuccessAlert message="Categoría eliminada correctamente" onClose={() => setShowSuccess(false)} />
      )}

      {showError && (
        <ErrorAlert message="No se puede eliminar: existen productos en esta categoría" onClose={() => setShowError(false)} />
      )}
    </VendorLayout>
  );
};

export default VendorCategories;
