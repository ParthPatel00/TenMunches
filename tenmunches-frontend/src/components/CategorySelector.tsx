import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

  const categoryIcons: Record<string, string> = {
    coffee: "☕",
    pizza: "🍕",
    burger: "🍔",
    vegan: "🥗",
    bakery: "🥐",
    brunch: "🍳",
    sushi: "🍣",
    thai: "🍜",
    chinese: "🥡",
    indian: "🍛",
    mexican: "🌮",
    korean: "🍲",
    italian: "🍝",
    mediterranean: "🫒",
    seafood: "🦞",
    sandwiches: "🥪",
    juice: "🧃",
    icecream: "🍨",
    bars: "🍻",
    bbq: "🍖",
    ramen: "🍥",
  };

  return (
    <section className="py-10 bg-white dark:bg-gray-950 text-center">
      <h2 className="text-3xl font-bold mb-6">Explore by Category</h2>

      <motion.div
        className="flex flex-wrap justify-center gap-4 px-4 max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onSelect(category)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-5 py-2 rounded-full shadow hover:shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-sm md:text-base"
          >
            <span className="text-lg">{categoryIcons[category] || "🍽️"}</span>
            <span className="capitalize">{category}</span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
};

export default CategorySelector;
