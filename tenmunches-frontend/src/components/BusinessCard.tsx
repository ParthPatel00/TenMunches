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
    photo_url?: string;
  };
  rank: number;
  reversed?: boolean;
}

const BusinessCard = ({ business, rank, reversed = false }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const [imageError, setImageError] = useState(false);

  const visibleTestimonials = showAll
    ? business.testimonials
    : business.testimonials.slice(0, 1);

  const topThemes = Object.entries(business.themes_summary || {})
    .filter(([, value]) => typeof value === "number" && value > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3)
    .map(([theme]) => theme);

  const fallback = "/placeholder.jpg"; // Add this image to public/
  const image =
    !imageError && business.photo_url ? business.photo_url : fallback;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col md:flex-row ${
        reversed ? "md:flex-row-reverse" : ""
      } gap-6 items-center`}
    >
      {/* Image container with blur + shadow */}
      <div className="relative w-full md:w-1/2 h-80 overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition">
        <img
          src={image}
          alt={business.name}
          className="w-full h-full object-cover object-center rounded-xl"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        {/* Optional background blur layer (can be removed for performance) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl pointer-events-none" />
      </div>

      {/* Text content */}
      <div className="w-full md:w-1/2 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            #{rank} – {business.name}
          </h3>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={18} fill="currentColor" />
            <span className="text-sm font-medium">{business.rating}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500">{business.address}</p>

        <div className="space-y-2 mb-2">
          {visibleTestimonials.map((quote, i) => (
            <p
              key={i}
              className="text-sm italic text-gray-700 border-l-4 pl-3 border-gray-300"
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
      </div>
    </motion.div>
  );
};

export default BusinessCard;
