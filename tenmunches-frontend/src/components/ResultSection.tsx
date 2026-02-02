import { useEffect } from "react";
import BusinessCard from "./BusinessCard";

interface Props {
  category: string;
  data: {
    category: string;
    top_10: {
      name: string;
      address: string;
      rating: number;
      review_count: number;
      themes_summary: Record<string, number | undefined>;
      testimonials: string[];
      photo_url?: string;
    }[];
  }[];
  onMounted?: () => void;
}

const ResultsSection = ({ category, data, onMounted }: Props) => {
  const result = data.find((c) => c.category === category);
  const businesses = result?.top_10 || [];

  // Notify parent when content is in the DOM so scroll happens after full render
  useEffect(() => {
    onMounted?.();
  }, [onMounted]);

  return (
    <section className="bg-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 capitalize">
          Top 10 {category} Places in San Francisco
        </h2>

        <div className="space-y-10">
          {businesses.map((biz, index) => (
            <BusinessCard
              key={`${category}-${index}`}
              business={biz}
              rank={index + 1}
              reversed={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
