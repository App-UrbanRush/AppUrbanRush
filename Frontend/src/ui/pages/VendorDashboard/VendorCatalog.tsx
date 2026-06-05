import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import VendorLayout from "../../components/layout/VendorLayout/VendorLayout";
import CategoryFilter from "../../components/vendor/CategoryFilter";
import ProductCard from "../../components/vendor/ProductCard";
import AddProductModal from "../../components/vendor/AddProductModal";
import ConfirmDeleteModal from "../../components/vendor/ConfirmDeleteModal";
import SuccessAlert from "../../components/vendor/SuccessAlert";
import { ProductRepositoryImpl } from "../../../infrastructure/repositories/ProductRepositoryImpl";
import { CategoryRepositoryImpl } from "../../../infrastructure/repositories/CategoryRepositoryImpl";
import { GetProductsByVendorUseCase } from "../../../application/use-cases/GetProductsByVendorUseCase";
import { DeleteProductUseCase } from "../../../application/use-cases/DeleteProductUseCase";
import { GetCategoriesUseCase } from "../../../application/use-cases/GetCategoriesUseCase";
import type { Product } from "../../../domain/types/product.types";
import "./VendorCatalog.css";

const VendorCatalog = () => {
  const { vendorProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customCategoryNames, setCustomCategoryNames] = useState<string[]>([]);

  const productRepository = useMemo(() => new ProductRepositoryImpl(), []);
  const categoryRepository = useMemo(() => new CategoryRepositoryImpl(), []);

  const getProductsByVendorUseCase = useMemo(() => new GetProductsByVendorUseCase(productRepository), [productRepository]);
  const deleteProductUseCase = useMemo(() => new DeleteProductUseCase(productRepository), [productRepository]);
  const getCategoriesUseCase = useMemo(
    () => new GetCategoriesUseCase(
      () => getProductsByVendorUseCase.execute(vendorProfile?.vendor_id ?? 0),
      categoryRepository,
      vendorProfile?.vendor_id ?? 0,
    ),
    [getProductsByVendorUseCase, categoryRepository, vendorProfile]
  );

  const fetchProducts = useCallback(async () => {
    if (!vendorProfile) return;
    try {
      const data = await getProductsByVendorUseCase.execute(vendorProfile.vendor_id);
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  }, [getProductsByVendorUseCase, vendorProfile]);

  const fetchCategories = useCallback(async () => {
    try {
      const { categories: dbCategories } = await getCategoriesUseCase.execute();
      setCustomCategoryNames(dbCategories.map((c) => c.name));
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }, [getCategoriesUseCase]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleDelete = async (product: Product) => {
    setDeleteProduct(product);
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    try {
      await deleteProductUseCase.execute(deleteProduct.product_id);
      setDeleteProduct(null);
      setShowSuccess(true);
      fetchProducts();
      fetchCategories();
    } catch (err) {
      console.error("Error al eliminar:", err);
      setDeleteProduct(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowAddModal(true);
  };

  const availableCategories = [
    ...new Set([
      ...products.map((p) => p.category),
      ...customCategoryNames,
    ]),
  ];

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return (
      <VendorLayout>
        <div className="vendor-catalog-loading">
          <h2>Cargando productos...</h2>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="vendor-catalog">
        <div className="vendor-catalog-header">
          <h1>Ver Catálogo</h1>
          <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
            + Añadir un Plato
          </button>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={availableCategories}
        />

        {filteredProducts.length === 0 ? (
          <div className="vendor-catalog-empty">
            <h3>No hay productos {selectedCategory !== "Todos" ? `en "${selectedCategory}"` : ""}</h3>
            <p>Comenzá a cargar productos a tu menú</p>
          </div>
        ) : (
          <div className="vendor-catalog-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <AddProductModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setEditProduct(null); }}
          onProductCreated={() => { fetchProducts(); fetchCategories(); }}
          editProduct={editProduct}
          categories={availableCategories}
        />

        <ConfirmDeleteModal
          isOpen={!!deleteProduct}
          itemName={deleteProduct?.name || ""}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteProduct(null)}
        />

        {showSuccess && (
          <SuccessAlert message="Producto eliminado correctamente" onClose={() => setShowSuccess(false)} />
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorCatalog;
