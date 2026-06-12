import type { Category } from "../../../domain/types/store.types";
import CategoryCard from "../ui/CategoryCard/CategoryCard";
import "./PopularCategories.css";

interface PopularCategoriesProps {
  categories: Category[];
}

const PopularCategories = ({ categories }: PopularCategoriesProps) => {
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
