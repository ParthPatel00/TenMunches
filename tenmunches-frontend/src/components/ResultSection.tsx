import { useEffect, useRef, useCallback } from "react";
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
}

const ResultsSection = ({ category, data, selectedBusinessName }: Props) => {
  const result = data.find((c) => c.category === category);
  const businesses = result?.top_10 || [];
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const deepLinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highlightCard = useCallback((el: HTMLElement) => {
    // GSAP-driven highlight — no classList thrashing, no layout reflows
    gsap.fromTo(
      el,
      { boxShadow: "0 0 0 3px var(--sf-golden), 0 0 40px rgba(197,148,74,0.35)" },
      {
        boxShadow: "0 0 0 0px rgba(197,148,74,0), 0 0 0px rgba(197,148,74,0)",
        duration: 0.7,
        delay: 1.8,
        ease: "power2.inOut",
        clearProps: "boxShadow",
      }
    );
    gsap.fromTo(el, { scale: 1.02 }, {
      scale: 1, duration: 0.5, delay: 2.1, ease: "power2.inOut", clearProps: "scale",
    });
  }, []);

  useEffect(() => {
    if (!selectedBusinessName) return;

    // Cancel any in-flight deep-link from a previous rapid selection
    if (deepLinkTimerRef.current) clearTimeout(deepLinkTimerRef.current);

    // Poll for the card element — handles slow renders on low-end devices
    let attempts = 0;
    const tryScroll = () => {
      const id = `biz-${selectedBusinessName.replace(/\s+/g, '-')}`;
      const cardElement = document.getElementById(id);
      if (cardElement) {
        (window as any).lenis?.scrollTo(cardElement, { offset: -100, duration: 1.5 });
        highlightCard(cardElement);
      } else if (attempts++ < 10) {
        // Retry up to 10× at 100ms intervals (1s total) before giving up
        deepLinkTimerRef.current = setTimeout(tryScroll, 100);
      }
    };

    deepLinkTimerRef.current = setTimeout(tryScroll, 80);

    return () => {
      if (deepLinkTimerRef.current) clearTimeout(deepLinkTimerRef.current);
    };
  }, [selectedBusinessName, category, highlightCard]);

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
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
