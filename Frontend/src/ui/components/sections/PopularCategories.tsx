import type { Category } from "../../../domain/types/store.types";
import CategoryCard from "../ui/CategoryCard/CategoryCard";
import "./PopularCategories.css";

interface PopularCategoriesProps {
  categories: Category[];
}

const PopularCategories = ({ categories }: PopularCategoriesProps) => {
  if (!categories.length) {
    return (
      <section className="mt-6">
        <h2 style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', marginBottom: '12px' }}>Categorías Populares</h2>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>No hay categorías populares</p>
      </section>
    );
  }

  return (
    <section className="home-section">
      <h2 className="home-section-title">Categorías Populares</h2>
      <div className="categories-grid">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  );
};

export default PopularCategories;
