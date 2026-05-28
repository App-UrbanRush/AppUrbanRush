import type { Category } from "../../../../domain/types/store.types";
import "./CategoryCard.css";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <button
      className="category-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1.5px solid #e0e0e0',
        borderRadius: '24px',
        padding: '7px 16px',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        color: '#333',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <img
        src={category.image}
        alt={category.name}
        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
      />
      {category.name}
    </button>
  );
};

export default CategoryCard;
