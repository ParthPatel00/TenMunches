import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";
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
    }[];
  }[];
}

const ResultsSection = ({ category, data }: Props) => {
  const result = data.find((c) => c.category === category);
  const businesses = result?.top_10 || [];

  return (
    <section className="bg-gray-100 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 capitalize">
          Top 10 {category} Places in San Francisco
        </h2>

        <MasonryInfiniteGrid className="gap-6" gap={16} align="center">
          {businesses.map((biz, index) => (
            <div key={index} className="w-full md:w-[300px]">
              <BusinessCard business={biz} rank={index + 1} />
            </div>
          ))}
        </MasonryInfiniteGrid>
      </div>
    </section>
  );
};

export default ResultsSection;
