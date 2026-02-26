import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import NeighborhoodPin from "./NeighborhoodPin";

// ---------------------------------------------------------------------------
// Data: SF Neighborhood real GPS coordinates & category mappings
// ---------------------------------------------------------------------------

interface NeighborhoodData {
    id: string;
    name: string;
    longitude: number;
    latitude: number;
    categories: string[];
}

const categoryIcons: Record<string, string> = {
    coffee: "☕", pizza: "🍕", burger: "🍔", vegan: "🥗", bakery: "🥐",
    brunch: "🍳", sushi: "🍣", thai: "🍜", chinese: "🥡", indian: "🍛",
    mexican: "🌮", korean: "🍲", italian: "🍝", mediterranean: "🫒",
    seafood: "🦞", sandwiches: "🥪", juice: "🧃", icecream: "🍨",
    bars: "🍻", bbq: "🍖", ramen: "🍥",
};

// Real GPS coordinates for SF neighborhoods
const neighborhoods: NeighborhoodData[] = [
    { id: "north-beach", name: "North Beach", longitude: -122.4086, latitude: 37.8011, categories: ["pizza", "italian"] },
    { id: "chinatown", name: "Chinatown", longitude: -122.4072, latitude: 37.7941, categories: ["chinese"] },
    { id: "fidi", name: "FiDi", longitude: -122.4000, latitude: 37.7936, categories: ["sandwiches", "sushi"] },
    { id: "soma", name: "SoMa", longitude: -122.4004, latitude: 37.7808, categories: ["coffee", "bbq", "thai", "ramen"] },
    { id: "marina", name: "Marina", longitude: -122.4356, latitude: 37.8037, categories: ["brunch", "mediterranean", "juice"] },
    { id: "japantown", name: "Japantown", longitude: -122.4332, latitude: 37.7853, categories: ["sushi", "ramen"] },
    { id: "hayes-valley", name: "Hayes Valley", longitude: -122.4245, latitude: 37.7758, categories: ["coffee", "icecream", "mediterranean"] },
    { id: "mission", name: "Mission", longitude: -122.4170, latitude: 37.7599, categories: ["mexican", "burger", "bars", "icecream", "coffee"] },
    { id: "castro", name: "Castro", longitude: -122.4347, latitude: 37.7609, categories: ["vegan", "juice", "pizza"] },
    { id: "haight", name: "Haight", longitude: -122.4485, latitude: 37.7700, categories: ["burger", "icecream"] },
    { id: "richmond", name: "Richmond", longitude: -122.4789, latitude: 37.7791, categories: ["chinese", "korean", "sushi"] },
    { id: "sunset", name: "Sunset", longitude: -122.4862, latitude: 37.7525, categories: ["bakery", "thai", "korean", "seafood"] },
    { id: "fishermans-wharf", name: "Wharf", longitude: -122.4177, latitude: 37.8080, categories: ["seafood"] },
    { id: "tenderloin", name: "Tenderloin", longitude: -122.4137, latitude: 37.7833, categories: ["thai", "indian", "ramen"] },
];

// Map each category to its primary neighborhood pin location
interface PinData {
    category: string;
    icon: string;
    longitude: number;
    latitude: number;
    neighborhood: string;
}

function buildPinData(): PinData[] {
    const placed = new Set<string>();
    const pins: PinData[] = [];

    for (const hood of neighborhoods) {
        for (const cat of hood.categories) {
            if (!placed.has(cat)) {
                placed.add(cat);
                // Slightly jitter the pins so they don't perfectly overlap in the same neighborhood
                const jitterLng = (Math.random() - 0.5) * 0.006;
                const jitterLat = (Math.random() - 0.5) * 0.005;
                pins.push({
                    category: cat,
                    icon: categoryIcons[cat] || "🍽️",
                    longitude: hood.longitude + jitterLng,
                    latitude: hood.latitude + jitterLat,
                    neighborhood: hood.name,
                });
            }
        }
    }
    return pins;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
    data: any[];
    onBusinessSelect: (category: string, businessName: string) => void;
    onBusinessHover?: (category: string) => void;
    selectedCategory: string | null;
    selectedBusinessName: string | null;
    onScrollToCategories: () => void;
}

// ---------------------------------------------------------------------------
// SFMapHero (Mapbox + MapLibre Version)
// ---------------------------------------------------------------------------

const SFMapHero = ({
    data,
    onBusinessSelect,
    onBusinessHover,
    selectedCategory,
    selectedBusinessName,
    onScrollToCategories,
}: Props) => {
    const heroRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLButtonElement>(null);

    // Extract all geocoded businesses from the JSON data
    const pins = useMemo(() => {
        const extractedPins: any[] = [];
        data.forEach((categoryBlock) => {
            const cat = categoryBlock.category;
            const icon = categoryIcons[cat] || "🍽️";
            categoryBlock.top_10?.forEach((biz: any) => {
                if (biz.latitude && biz.longitude) {
                    // Jitter coords slightly for clustered businesses
                    const jitterLng = (Math.random() - 0.5) * 0.001;
                    const jitterLat = (Math.random() - 0.5) * 0.001;
                    extractedPins.push({
                        ...biz,
                        category: cat,
                        icon,
                        longitude: biz.longitude + jitterLng,
                        latitude: biz.latitude + jitterLat,
                        // Provide a fallback neighborhood text since we don't have strictly mapped neighborhoods for each
                        neighborhood: biz.address.split(', San Francisco')[0] || "San Francisco",
                    });
                }
            });
        });
        return extractedPins;
    }, [data]);

    // Particles for atmosphere
    const particles = useMemo(
        () =>
            Array.from({ length: 15 }, (_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 8}s`,
                duration: `${6 + Math.random() * 6}s`,
                size: `${2 + Math.random() * 4}px`,
                opacity: 0.2 + Math.random() * 0.4,
            })),
        []
    );

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Headline — stagger words
            if (headlineRef.current) {
                const words = headlineRef.current.querySelectorAll(".word");
                gsap.fromTo(
                    words,
                    { y: 60, opacity: 0, rotateX: -30 },
                    { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, delay: 0.2 }
                );
            }

            // Subtitle
            if (subtitleRef.current) {
                gsap.fromTo(
                    subtitleRef.current,
                    { y: 25, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.8 }
                );
            }

            // Map container
            const mapContainer = document.querySelector(".actual-map-container");
            if (mapContainer) {
                gsap.fromTo(
                    mapContainer,
                    { opacity: 0, y: 30, scale: 0.96 },
                    { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out", delay: 1.0 }
                );
            }

            // CTA
            if (ctaRef.current) {
                gsap.fromTo(
                    ctaRef.current,
                    { y: 15, opacity: 0, scale: 0.92 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", delay: 1.2 }
                );
            }
        }, heroRef);

        return () => ctx.revert();
    }, []);

    const headlineWords = "Explore SF's Best Bites".split(" ");

    return (
        <section ref={heroRef} className="map-hero-container relative">
            {/* Background gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(ellipse at 50% 30%, rgba(30, 58, 95, 0.5) 0%, var(--sf-bay-deep) 70%)",
                }}
            />

            {/* Fog layer */}
            <div className="fog-layer" />

            {/* Particles */}
            <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            left: p.left,
                            bottom: "-10px",
                            width: p.size,
                            height: p.size,
                            animationDelay: p.delay,
                            animationDuration: p.duration,
                            opacity: p.opacity,
                        }}
                    />
                ))}
            </div>

            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] pointer-events-none opacity-20 bg-sf-golden" />

            {/* Main content layer */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col items-center pt-24 pb-12 min-h-screen">
                {/* Headline */}
                <h1
                    ref={headlineRef}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-4 text-center leading-[1.1] tracking-tight"
                    style={{ perspective: "600px" }}
                >
                    {headlineWords.map((word, i) => (
                        <span
                            key={i}
                            className={`word inline-block mr-[0.25em] ${word === "SF's" || word === "Best" ? "text-gradient-golden" : "text-white"
                                }`}
                            style={{ opacity: 0, display: "inline-block", willChange: "transform, opacity" }}
                        >
                            {word}
                        </span>
                    ))}
                </h1>

                {/* Subtitle */}
                <p
                    ref={subtitleRef}
                    className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed font-light text-center"
                    style={{ opacity: 0 }}
                >
                    Tap a pin to discover top 10 spots in 20 food & drink categories
                </p>

                {/* Real Interactive Map (MapLibre + Carto) */}
                <div
                    className="actual-map-container w-full h-[55vh] max-h-[600px] min-h-[400px] mb-10 rounded-3xl overflow-hidden border border-white/5 relative shadow-2xl shadow-black/50"
                    style={{ opacity: 0 }}
                >
                    {/* Subtle vignette over the map to blend it into the dark theme */}
                    <div className="absolute inset-0 z-[2] pointer-events-none shadow-[inset_0_0_80px_rgba(15,23,42,0.8)] rounded-3xl" />

                    <Map
                        mapLib={maplibregl}
                        initialViewState={{
                            longitude: -122.44, // Centered in SF
                            latitude: 37.765,
                            zoom: 11.8,
                            pitch: 45, // Adding some tilt for a 3D feel
                            bearing: -15, // Slight angle
                        }}
                        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                        interactive={true}
                        scrollZoom={false} // Disable scroll zoom so user doesn't get stuck while scrolling page
                        dragPan={true}
                        dragRotate={true}
                        style={{ width: "100%", height: "100%", borderRadius: "1.5rem" }}
                    >
                        <NavigationControl position="bottom-right" showCompass={false} />

                        {/* Render our custom NeighborhoodPins purely using Map Markers */}
                        {pins.map((pin, i) => {
                            const isBusinessSelected = selectedBusinessName === pin.name;
                            const isCategorySelected = selectedCategory === pin.category;
                            const isActive = isBusinessSelected || (isCategorySelected && !selectedBusinessName);
                            // Only show pins that match the selected category if one is active, to reduce clutter.
                            // If no category is selected, show all 200.
                            if (selectedCategory && selectedCategory !== pin.category) return null;

                            return (
                                <Marker
                                    key={`${pin.category}-${pin.name}-${i}`}
                                    longitude={pin.longitude}
                                    latitude={pin.latitude}
                                    anchor="bottom"
                                    style={{ zIndex: isActive ? 50 : 10 }}
                                >
                                    <NeighborhoodPin
                                        icon={pin.icon}
                                        category={pin.category}
                                        businessName={pin.name}
                                        neighborhood={pin.neighborhood}
                                        delay={(i % 10) * 0.1}
                                        isActive={isActive}
                                        onClick={onBusinessSelect}
                                        onHover={onBusinessHover}
                                    />
                                </Marker>
                            );
                        })}
                    </Map>
                </div>

                {/* CTA */}
                <button
                    ref={ctaRef}
                    onClick={onScrollToCategories}
                    className="group mt-auto mb-8 relative px-8 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-sf-golden to-sf-golden-light text-sf-bay-deep hover:shadow-2xl hover:shadow-sf-golden/40 transition-all duration-500 hover:scale-105 interactive"
                    style={{ opacity: 0 }}
                >
                    <span className="relative z-10">View All Categories</span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sf-golden-light to-sf-golden opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
            </div>

            {/* Scroll cue */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400 tracking-widest uppercase">Scroll</span>
                <div className="scroll-cue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-sf-golden">
                        <path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </section>
    );
};

export default SFMapHero;
