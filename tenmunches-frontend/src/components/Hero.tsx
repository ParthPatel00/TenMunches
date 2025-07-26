import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  data: { category: string }[];
  onSelect: (category: string) => void;
}

const Hero = ({ data, onSelect }: Props) => {
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
    <section className="relative h-auto min-h-[100vh] flex flex-col items-center justify-center bg-black text-white overflow-hidden pb-12">
      {/* Background image */}
      <img
        src="/sf.jpg"
        alt="San Francisco"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Overlay content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-4 max-w-3xl pt-20"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Discover SF’s Best Food & Drink Spots
        </h1>
        <p className="text-lg md:text-xl drop-shadow-md mb-8">
          We analyzed thousands of reviews to find the top 10 places in 20 food
          and drink categories — all in San Francisco.
        </p>
      </motion.div>

      {/* Categories inside hero */}
      <motion.div
        className="relative z-10 flex flex-wrap justify-center gap-4 px-4 max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
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
            className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full shadow hover:shadow-lg hover:bg-gray-100 transition-all text-sm md:text-base backdrop-blur bg-opacity-80"
          >
            <span className="text-lg">{categoryIcons[category] || "🍽️"}</span>
            <span className="capitalize">{category}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Optional fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-0" />
    </section>
  );
};

export default Hero;
