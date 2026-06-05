import "./CategoryFilter.css";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

const CategoryFilter = ({ selectedCategory, onSelectCategory, categories }: CategoryFilterProps) => {
  return (
    <div className="category-filter">
      <button
        className={`category-btn ${selectedCategory === "Todos" ? "active" : ""}`}
        onClick={() => onSelectCategory("Todos")}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${selectedCategory === category ? "active" : ""}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
