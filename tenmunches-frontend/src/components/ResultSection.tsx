import { useEffect, useRef } from "react";
import gsap from "gsap";
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
      url?: string;
    }[];
  }[];
  selectedBusinessName?: string | null;
  onMounted?: () => void;
}

const ResultsSection = ({ category, data, selectedBusinessName, onMounted }: Props) => {
  const result = data.find((c) => c.category === category);
  const businesses = result?.top_10 || [];
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    onMounted?.();

    // Deep link scroll logic
    if (selectedBusinessName) {
      // Small timeout to allow the DOM elements to render before measuring
      setTimeout(() => {
        const cardElement = document.getElementById(`biz-${selectedBusinessName.replace(/\\s+/g, '-')}`);
        if (cardElement) {
          // Use Lenis directly via window to avoid circular imports.
          (window as any).lenis?.scrollTo(cardElement, { offset: -100, duration: 1.5 });

          // Highlight effect
          cardElement.classList.add('ring-4', 'ring-sf-golden', 'scale-[1.02]', 'z-50', 'transition-all', 'duration-500');
          setTimeout(() => {
            cardElement.classList.remove('ring-4', 'ring-sf-golden', 'scale-[1.02]', 'z-50');
          }, 2000);
        }
      }, 800);
    }
  }, [onMounted, selectedBusinessName, category]);

  // Animate title on mount
  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [category]);

  return (
    <section ref={sectionRef} className="section-padding bg-sf-bay-deep relative">
      {/* Golden accent at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sf-golden/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2
          ref={titleRef}
          className="text-4xl md:text-5xl font-display font-bold text-center mb-4"
          style={{ opacity: 0 }}
        >
          Top 10{" "}
          <span className="text-gradient-golden capitalize">{category}</span>{" "}
          Spots
        </h2>
        <p className="text-center text-gray-400 mb-12 md:mb-16 text-lg">
          The best {category} places in San Francisco, ranked by reviews and
          AI insights.
        </p>

        {/* Business Cards */}
        <div className="space-y-8 md:space-y-12">
          {businesses.map((biz, index) => (
            <BusinessCard
              key={`${category}-${index}`}
              business={biz}
              rank={index + 1}
              reversed={index % 2 !== 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
