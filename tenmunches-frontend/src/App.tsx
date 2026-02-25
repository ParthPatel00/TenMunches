import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import Hero from "./components/Hero.tsx";
import ResultsSection from "./components/ResultSection.tsx";

// ---------------------------------------------------------------------------
// Image prefetch helpers
// ---------------------------------------------------------------------------

/** Set of category names whose images we've already prefetched. */
const _prefetched = new Set<string>();

/** Prefetch all images for a given category by creating hidden Image objects. */
function prefetchCategoryImages(
  category: string,
  data: any[]
): void {
  if (_prefetched.has(category)) return;
  _prefetched.add(category);

  const match = data.find((d: any) => d.category === category);
  if (!match) return;

  for (const biz of match.top_10 || []) {
    const url = biz.photo_url;
    if (url) {
      const img = new Image();
      img.src = url;
    }
  }
}

/** Prefetch images for ALL categories during idle time. */
function prefetchAllImages(data: any[]): void {
  let idx = 0;
  const step = () => {
    if (idx >= data.length) return;
    prefetchCategoryImages(data[idx].category, data);
    idx++;
    // Spread prefetch across idle frames so it doesn't block interaction
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(step, { timeout: 3000 });
    } else {
      setTimeout(step, 100);
    }
  };
  step();
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const [topPlaces, setTopPlaces] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetch("/data/categories.json")
      .then((res) => res.json())
      .then((data) => {
        setTopPlaces(data);
        // Start background prefetch of all images once data is loaded
        prefetchAllImages(data);
      })
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  /** On hover: immediately prefetch that category's images (instant on click). */
  const handleCategoryHover = useCallback(
    (category: string) => {
      prefetchCategoryImages(category, topPlaces);
    },
    [topPlaces]
  );

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
      <Hero
        data={topPlaces}
        onSelect={handleCategorySelect}
        onHover={handleCategoryHover}
      />

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
