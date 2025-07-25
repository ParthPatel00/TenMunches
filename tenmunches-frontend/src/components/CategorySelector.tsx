import { useEffect, useState } from "react";

interface Props {
  data: { category: string }[];
  onSelect: (category: string) => void;
}

const CategorySelector = ({ data, onSelect }: Props) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const unique = data.map((d) => d.category);
    setCategories(unique);
  }, [data]);

  return (
    <section className="py-10 bg-white dark:bg-gray-950 text-center">
      <h2 className="text-3xl font-bold mb-6">Explore by Category</h2>
      <div className="flex flex-wrap justify-center gap-4 px-4 max-w-5xl mx-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="bg-black text-white dark:bg-white dark:text-black px-5 py-2 rounded-full shadow-md hover:scale-105 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-sm md:text-base"
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategorySelector;
