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
    if (biz.photo_url) {
      const img = new Image();
      img.src = biz.photo_url;
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
  const [dataError, setDataError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // mapPinCategory is independent of selectedCategory — only the map filter dropdown changes it
  const [mapPinCategory, setMapPinCategory] = useState<string | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/data/categories.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setTopPlaces(data);
        prefetchAllImages(data);
      })
      .catch((err) => {
        console.error("Failed to load data", err);
        setDataError(true);
      });
  }, []);

  const categories = topPlaces.map((d) => d.category);

  // ── Category from carousel (should scroll to results) ──
  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setSelectedBusinessName(null);
  }, []);

  // ── Category selected from the map filter dropdown (pins only — no scroll, no results change) ──
  const handleMapFilterSelect = useCallback((category: string | null) => {
    setMapPinCategory(category);
  }, []);

  // ── A specific business pin was clicked on the map — scroll to results + deep-link ──
  const handleBusinessSelect = useCallback((category: string, businessName: string) => {
    setMapPinCategory(category);
    setSelectedCategory(category);
    setSelectedBusinessName(businessName);
  }, []);

  const handleCategoryHover = useCallback(
    (category: string) => prefetchCategoryImages(category, topPlaces),
    [topPlaces],
  );

  const scrollToJourney = useCallback(() => {
    (window as any).lenis?.scrollTo(".journey-section", { offset: -100, duration: 1.5 });
  }, []);

  // Scroll to results when category changes (not on business-pin deep-link — ResultsSection handles that)
  useEffect(() => {
    if (!selectedCategory || selectedBusinessName) return;
    const timer = setTimeout(() => {
      const el = resultsRef.current;
      const lenis = (window as any).lenis;
      if (!el || !lenis) return;

      // ROOT CAUSE: Lenis's internal Dimensions class debounces its ResizeObserver
      // callback by 250ms. ResultsSection mounts and makes the page much taller, but
      // lenis.limit still reflects the OLD (shorter) page height until the debounce fires.
      // lenis.scrollTo() clamps the target to that stale limit, landing the section near
      // the viewport centre instead of near the top.
      //
      // FIX: call lenis.resize() which synchronously recalculates dimensions.scrollHeight
      // and therefore lenis.limit — bypassing the 250ms debounce entirely.
      lenis.resize();

      // Now lenis.limit is correct; scrollTo will not clamp.
      lenis.scrollTo(el, { offset: -80, duration: 1.2 });
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]); // selectedBusinessName intentionally excluded — pin clicks handled by ResultsSection

  // Show/hide scroll-to-top button — threshold = 80% of viewport height, responsive
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > window.innerHeight * 0.8);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dataError) {
    return (
      <div className="min-h-screen bg-sf-bay-deep flex items-center justify-center text-sf-cream">
        <div className="text-center px-6">
          <p className="text-2xl font-display font-bold mb-3">Couldn't load restaurant data</p>
          <p className="text-gray-400 mb-6">Check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-sf-golden to-sf-golden-light text-sf-bay-deep"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-sf-bay-deep text-sf-cream overflow-hidden">
      <div className="grain-overlay" />
      <CustomCursor />
      <Navbar />

      {/* Hero — Interactive SF Map */}
      <SFMapHero
        categories={categories}
        data={topPlaces}
        onMapFilterSelect={handleMapFilterSelect}
        onBusinessSelect={handleBusinessSelect}
        onBusinessHover={handleCategoryHover}
        selectedCategory={mapPinCategory}
        selectedBusinessName={selectedBusinessName}
        onScrollToCategories={scrollToJourney}
      />

      <GoldenGateBridge3D />

      {/* Food Journey — Horizontal Scroll Categories */}
      <FoodJourney
        categories={categories}
        data={topPlaces}
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
        onHover={handleCategoryHover}
      />

      {/* Results Section */}
      <div ref={resultsRef}>
        {selectedCategory && (
          <ResultsSection
            key={selectedCategory}
            category={selectedCategory}
            data={topPlaces}
            selectedBusinessName={selectedBusinessName}
          />
        )}
      </div>

      <Footer />

      {/* Scroll to top */}
      <button
        onClick={() => (window as any).lenis?.scrollTo(0, { duration: 1.2 })}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass-light flex items-center justify-center text-sf-golden-light hover:text-sf-cream hover:bg-sf-golden/30 transition-all duration-500 interactive shadow-lg shadow-black/30 ${showScrollTop
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
          }`}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}

export default App;
