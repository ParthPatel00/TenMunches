import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  business: {
    name: string;
    address: string;
    rating: number;
    review_count: number;
    themes_summary: Record<string, number | undefined>;
    testimonials: string[];
  };
  rank: number;
}

const BusinessCard = ({ business, rank }: Props) => {
  const [showAll, setShowAll] = useState(false);

  const visibleTestimonials = showAll
    ? business.testimonials
    : business.testimonials.slice(0, 1);

  const topThemes = Object.entries(business.themes_summary || {})
    .filter(([, value]) => typeof value === "number" && value > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3)
    .map(([theme]) => theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">
          #{rank} – {business.name}
        </h3>
        <div className="flex items-center gap-1 text-yellow-400">
          <Star size={18} fill="currentColor" />
          <span className="text-sm font-medium">{business.rating}</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
        {business.address}
      </p>

      {topThemes.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {topThemes.map((theme, i) => (
            <span
              key={i}
              className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-xs rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2 mb-2">
        {visibleTestimonials.map((quote, i) => (
          <p
            key={i}
            className="text-sm italic text-gray-700 dark:text-gray-200 border-l-4 pl-3 border-gray-300 dark:border-gray-600"
          >
            “{quote}”
          </p>
        ))}
      </div>

      {business.testimonials.length > 1 && (
        <button
          className="text-xs text-blue-500 hover:underline"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : "Show all testimonials"}
        </button>
      )}
    </motion.div>
  );
};

export default BusinessCard;
