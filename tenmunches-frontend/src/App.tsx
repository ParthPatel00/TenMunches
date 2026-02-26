import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import SFMapHero from "./components/SFMapHero";
import FoodJourney from "./components/FoodJourney";
import GoldenGateBridge3D from "./components/GoldenGateBridge3D";
import ResultsSection from "./components/ResultSection";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";

// ---------------------------------------------------------------------------
// Image prefetch helpers
// ---------------------------------------------------------------------------

const _prefetched = new Set<string>();

function prefetchCategoryImages(category: string, data: any[]): void {
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

function prefetchAllImages(data: any[]): void {
  let idx = 0;
  const step = () => {
    if (idx >= data.length) return;
    prefetchCategoryImages(data[idx].category, data);
    idx++;
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
  const [selectedBusinessName, setSelectedBusinessName] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const journeyRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetch("/data/categories.json")
      .then((res) => res.json())
      .then((data) => {
        setTopPlaces(data);
        prefetchAllImages(data);
      })
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  const categories = topPlaces.map((d) => d.category);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedBusinessName(null);
  };

  const handleBusinessSelect = (category: string, businessName: string) => {
    setSelectedCategory(category);
    setSelectedBusinessName(businessName);
  };

  const handleCategoryHover = useCallback(
    (category: string) => {
      prefetchCategoryImages(category, topPlaces);
    },
    [topPlaces]
  );

  const scrollToJourney = useCallback(() => {
    journeyRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToResults = useCallback(() => {
    requestAnimationFrame(() => {
      // The ResultsSection will handle the fine-grained scroll if selectedBusinessName is set
      // So we only scroll to the section container here if selectedBusinessName is null
      if (!selectedBusinessName) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [selectedBusinessName]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > 600);
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
    <div className="relative min-h-screen bg-sf-bay-deep text-sf-cream overflow-hidden">
      {/* Grain texture overlay */}
      <div className="grain-overlay" />

      {/* Custom cursor (desktop only) */}
      <CustomCursor />

      {/* Navigation */}
      <Navbar />

      {/* Hero — Interactive SF Map */}
      <SFMapHero
        data={topPlaces}
        onBusinessSelect={handleBusinessSelect}
        onBusinessHover={handleCategoryHover}
        selectedCategory={selectedCategory}
        selectedBusinessName={selectedBusinessName}
        onScrollToCategories={scrollToJourney}
      />

      {/* 3D Golden Gate Bridge Divider */}
      <GoldenGateBridge3D />

      {/* Food Journey — Horizontal Scroll Categories */}
      <div ref={journeyRef}>
        <FoodJourney
          categories={categories}
          data={topPlaces}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
          onHover={handleCategoryHover}
        />
      </div>

      {/* Results Section */}
      <div ref={resultsRef}>
        {selectedCategory && (
          <ResultsSection
            key={selectedCategory}
            category={selectedCategory}
            data={topPlaces}
            selectedBusinessName={selectedBusinessName}
            onMounted={scrollToResults}
          />
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass-light flex items-center justify-center text-sf-golden-light hover:text-sf-cream hover:bg-sf-golden/30 transition-all duration-500 interactive shadow-lg shadow-black/30 ${showScrollTop
          ? "translate-y-0 opacity-100"
          : "translate-y-16 opacity-0 pointer-events-none"
          }`}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}

export default App;
