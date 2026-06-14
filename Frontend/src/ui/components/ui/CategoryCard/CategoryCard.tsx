import type { Category } from "../../../../domain/types/store.types";
import "./CategoryCard.css";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <button className="category-card">
      <div className="category-card-img">
        <img src={category.image} alt={category.name} />
      </div>
      <span className="category-card-name">{category.name}</span>
    </button>
  );
};

export default CategoryCard;
