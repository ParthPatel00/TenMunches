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
    <section className="relative min-h-screen bg-black text-white overflow-hidden pb-16 flex flex-col justify-center items-center">
      {/* Background image */}
      <img
        src="/sf.jpg"
        alt="San Francisco"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Overlay */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-3xl pt-20"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.06 },
          },
        }}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Discover SF’s Best Food & Drink Spots
        </motion.h1>

        <motion.p
          className="text-2xl md:text-xl drop-shadow-md mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
        >
          Discover the top 10 places in 20 food and drink categories across San
          Francisco — curated from reviews, articles, and local buzz.
        </motion.p>
      </motion.div>

      {/* Category Buttons */}
      <motion.div
        className="relative z-10 flex flex-wrap justify-center gap-4 px-4 max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delay: 0.5,
              staggerChildren: 0.03,
            },
          },
        }}
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onSelect(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.35, ease: "easeOut" },
              },
            }}
            className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2 rounded-full shadow hover:shadow-lg transition-all text-sm md:text-base backdrop-blur bg-opacity-90"
          >
            <span className="text-lg">{categoryIcons[category] || "🍽️"}</span>
            <span className="capitalize">{category}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom fade */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-0" /> */}
    </section>
  );
};

export default Hero;
