import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import Hero from "./components/Hero.tsx";
import ResultsSection from "./components/ResultSection.tsx";

function App() {
  const [topPlaces, setTopPlaces] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetch("/top_places_photos_senti.json")
      .then((res) => res.json())
      .then((data) => setTopPlaces(data))
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const scrollToResults = useCallback(() => {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > 300);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="font-sans bg-gray-50 text-gray-900 transition-colors">
      <Hero data={topPlaces} onSelect={handleCategorySelect} />

      <div ref={resultsRef}>
        {selectedCategory && (
          <ResultsSection
            key={selectedCategory}
            category={selectedCategory}
            data={topPlaces}
            onMounted={scrollToResults}
          />
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 z-50 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition"
        >
          <ArrowUp />
        </button>
      )}
    </div>
  );
}

export default App;
