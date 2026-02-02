import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  business: {
    name: string;
    address: string;
    rating: number;
    review_count: number;
    themes_summary: Record<string, number | undefined>;
    testimonials: string[];
    photo_url?: string;
    url?: string;
    categories?: string[]; // Added categories to the interface
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

  // const topThemes = Object.entries(business.themes_summary || {})
  //   .filter(([, value]) => typeof value === "number" && value > 0)
  //   .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
  //   .slice(0, 3)
  //   .map(([theme]) => theme);

  // Get category from the business data or use a default
  const getCategoryFromBusiness = () => {
    if (business.categories) {
      if (
        business.categories.includes("cafe") ||
        business.categories.includes("coffee")
      ) {
        return "coffee";
      }
      if (
        business.categories.includes("restaurant") ||
        business.categories.includes("food")
      ) {
        return "restaurant";
      }
      if (
        business.categories.includes("bar") ||
        business.categories.includes("night_club")
      ) {
        return "bar";
      }
    }
    return "default";
  };

  const category = getCategoryFromBusiness();

  // Use different fallback images based on category
  const getFallbackImage = (cat: string) => {
    switch (cat) {
      case "coffee":
        return "/sf.jpg"; // Use SF image for coffee shops
      case "restaurant":
        return "/sf.jpg"; // Use SF image for restaurants
      case "bar":
        return "/sf.jpg"; // Use SF image for bars
      default:
        return "/sf.jpg"; // Default fallback
    }
  };

  const fallback = getFallbackImage(category);

  // Use the original photo_url if available, otherwise fallback
  const image =
    !imageError && business.photo_url ? business.photo_url : fallback;

  return (
    <div
      className={`flex flex-col md:flex-row ${
        reversed ? "md:flex-row-reverse" : ""
      } gap-6 items-center animate-in-fade-up`}
    >
      {/* Image container with blur + shadow */}
      <div className="relative w-full md:w-1/2 h-80 overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition">
        <img
          src={image}
          alt={business.name}
          className="w-full h-full object-cover object-center rounded-xl"
          loading="lazy"
          decoding="async"
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

        {business.url ? (
          <a
            href={business.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 transition"
          >
            {business.address}
          </a>
        ) : (
          business.address
        )}

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
    </div>
  );
};

export default BusinessCard;
