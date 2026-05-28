import type { Category } from "../../../domain/types/store.types";
import CategoryCard from "../ui/CategoryCard/CategoryCard";
import "./PopularCategories.css";

interface PopularCategoriesProps {
  categories: Category[];
}

const PopularCategories = ({ categories }: PopularCategoriesProps) => {
  return (
    <section className="mt-6">
      <h2 style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', marginBottom: '12px' }}>Categorías Populares</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  );
};

export default PopularCategories;
