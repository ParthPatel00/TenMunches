import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ---------------------------------------------------------------------------
// Static Data
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<string, { icon: string; desc: string; hood: string; gradient: string }> = {
    coffee:        { icon: "☕",  desc: "Third-wave roasters & cozy cafés",       hood: "Mission • SoMa • Hayes Valley",          gradient: "linear-gradient(160deg, #3E2723 0%, #5D4037 100%)" },
    pizza:         { icon: "🍕",  desc: "Neapolitan to New York-style slices",      hood: "North Beach • Marina • Castro",           gradient: "linear-gradient(160deg, #BF360C 0%, #E64A19 100%)" },
    burger:        { icon: "🍔",  desc: "Smash burgers to gourmet stacks",          hood: "Mission • Haight • FiDi",                 gradient: "linear-gradient(160deg, #4E342E 0%, #795548 100%)" },
    vegan:         { icon: "🥗",  desc: "Plant-forward culinary innovation",        hood: "Mission • Castro • Inner Sunset",         gradient: "linear-gradient(160deg, #1B5E20 0%, #388E3C 100%)" },
    bakery:        { icon: "🥐",  desc: "Artisan bread & French pastries",          hood: "Sunset • Richmond • Noe Valley",         gradient: "linear-gradient(160deg, #F9A825 0%, #FFB74D 100%)" },
    brunch:        { icon: "🍳",  desc: "Weekend brunches & mimosa flights",        hood: "Marina • Pacific Heights • NoPa",         gradient: "linear-gradient(160deg, #E65100 0%, #FF8F00 100%)" },
    sushi:         { icon: "🍣",  desc: "Omakase bars & fresh nigiri",              hood: "Japantown • FiDi • Inner Richmond",       gradient: "linear-gradient(160deg, #0D47A1 0%, #1565C0 100%)" },
    thai:          { icon: "🍜",  desc: "Authentic curries & street food",          hood: "Tenderloin • SoMa • Sunset",             gradient: "linear-gradient(160deg, #880E4F 0%, #AD1457 100%)" },
    chinese:       { icon: "🥡",  desc: "Dim sum to Sichuan fire",                 hood: "Chinatown • Inner Richmond • Sunset",     gradient: "linear-gradient(160deg, #C62828 0%, #D32F2F 100%)" },
    indian:        { icon: "🍛",  desc: "Rich curries & tandoori classics",         hood: "Curry Mile • SoMa • Mission",            gradient: "linear-gradient(160deg, #E65100 0%, #F57C00 100%)" },
    mexican:       { icon: "🌮",  desc: "Taquerias & modern Mexican",               hood: "Mission • Excelsior • Bayview",          gradient: "linear-gradient(160deg, #2E7D32 0%, #43A047 100%)" },
    korean:        { icon: "🍲",  desc: "BBQ, bibimbap & fried chicken",           hood: "Inner Richmond • Sunset • SoMa",         gradient: "linear-gradient(160deg, #4A148C 0%, #6A1B9A 100%)" },
    italian:       { icon: "🍝",  desc: "Handmade pasta & coastal vibes",           hood: "North Beach • Marina • FiDi",            gradient: "linear-gradient(160deg, #1B5E20 0%, #C62828 100%)" },
    mediterranean: { icon: "🫒",  desc: "Mezze, kebabs & olive groves",            hood: "Hayes Valley • Marina • Noe",            gradient: "linear-gradient(160deg, #0277BD 0%, #00838F 100%)" },
    seafood:       { icon: "🦞",  desc: "Dungeness crab & oyster bars",            hood: "Fisherman's Wharf • SoMa • Sunset",      gradient: "linear-gradient(160deg, #004D40 0%, #00695C 100%)" },
    sandwiches:    { icon: "🥪",  desc: "Delis, banh mi & subs",                   hood: "FiDi • SoMa • Mission",                  gradient: "linear-gradient(160deg, #5D4037 0%, #795548 100%)" },
    juice:         { icon: "🧃",  desc: "Cold-pressed & smoothie bowls",            hood: "Castro • Marina • Hayes Valley",         gradient: "linear-gradient(160deg, #F57F17 0%, #FBC02D 100%)" },
    icecream:      { icon: "🍨",  desc: "Artisan gelato & soft serve",              hood: "Mission • Hayes Valley • Haight",        gradient: "linear-gradient(160deg, #AD1457 0%, #EC407A 100%)" },
    bars:          { icon: "🍻",  desc: "Cocktail lounges & dive bars",             hood: "Mission • Polk • Marina",                gradient: "linear-gradient(160deg, #1A237E 0%, #283593 100%)" },
    bbq:           { icon: "🍖",  desc: "Smoky brisket & pulled pork",              hood: "SoMa • Mission • Bayview",               gradient: "linear-gradient(160deg, #4E342E 0%, #BF360C 100%)" },
    ramen:         { icon: "🍥",  desc: "Rich tonkotsu & miso bowls",               hood: "Japantown • Tenderloin • SoMa",          gradient: "linear-gradient(160deg, #E65100 0%, #BF360C 100%)" },
};

const FALLBACK = { icon: "🍽️", desc: "Discover top spots", hood: "San Francisco", gradient: "linear-gradient(160deg, #1E3A5F 0%, #0F172A 100%)" };

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
    categories: string[];
    data: any[];
    selectedCategory: string | null;
    onSelect: (category: string) => void;
    onHover?: (category: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FoodJourney = ({ categories, data, selectedCategory, onSelect, onHover }: Props) => {
    const sectionRef  = useRef<HTMLDivElement>(null);
    const titleRef    = useRef<HTMLHeadingElement>(null);
    const eyebrowRef  = useRef<HTMLParagraphElement>(null);
    const gridRef     = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (categories.length === 0) return;

        // Respect reduced-motion preference
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gridRef.current?.querySelectorAll<HTMLElement>(".portrait-card").forEach((el) => {
                el.style.opacity = "1";
            });
            if (titleRef.current)   titleRef.current.style.opacity   = "1";
            if (eyebrowRef.current) eyebrowRef.current.style.opacity = "1";
            return;
        }

        const ctx = gsap.context(() => {
            // Eyebrow + title fade-up
            gsap.fromTo(
                [eyebrowRef.current, titleRef.current],
                { y: 36, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.85, stagger: 0.12, ease: "power3.out",
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: "top 88%",
                        toggleActions: "play none none none",
                        once: true,
                    },
                }
            );

            // Card stagger entrance — no pin, no scrub
            const cards = gridRef.current?.querySelectorAll(".portrait-card");
            if (cards && cards.length > 0) {
                gsap.fromTo(
                    cards,
                    { y: 56, opacity: 0, scale: 0.93 },
                    {
                        y: 0, opacity: 1, scale: 1,
                        duration: 0.65,
                        stagger: { each: 0.05, from: "start" },
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: gridRef.current,
                            start: "top 88%",
                            toggleActions: "play none none none",
                            once: true,
                        },
                    }
                );
            }
        }, sectionRef);

        // Defer refresh so GSAP has fully registered all triggers before measuring
        const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
        return () => {
            clearTimeout(refreshTimer);
            ctx.revert();
        };
    }, [categories]);

    const handleEnter = useCallback((category: string) => onHover?.(category), [onHover]);

    return (
        <section
            ref={sectionRef}
            className="journey-section relative bg-sf-bay-deep overflow-hidden"
        >
            {/* Ambient glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(197,148,74,0.05) 0%, transparent 70%)" }}
            />

            {/* Section header */}
            <div className="relative z-10 text-center pt-20 pb-12 px-6">
                <p
                    ref={eyebrowRef}
                    className="text-sf-golden text-xs font-semibold uppercase tracking-[0.22em] mb-4"
                    style={{ opacity: 0 }}
                >
                    20 Curated Categories
                </p>
                <h2
                    ref={titleRef}
                    className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4"
                    style={{ opacity: 0 }}
                >
                    Pick Your <span className="text-gradient-golden">Craving</span>
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto">
                    Each has the top 10 spots in SF, ranked by rating &amp; AI sentiment.
                </p>
            </div>

            {/* Portrait card grid */}
            <div
                ref={gridRef}
                className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 px-4 sm:px-6 lg:px-10 xl:px-16 pb-24"
            >
                {categories.map((category, index) => {
                    const meta = CATEGORY_META[category] ?? FALLBACK;
                    const isSelected = selectedCategory === category;
                    const photoUrl = data.find((d) => d.category === category)?.top_10?.[0]?.photo_url;

                    return (
                        <div
                            key={category}
                            className={`portrait-card${isSelected ? " portrait-card--selected" : ""}`}
                            style={{ opacity: 0 }}
                            onClick={() => onSelect(category)}
                            onMouseEnter={() => handleEnter(category)}
                        >
                            {/* Photo / gradient background */}
                            <div
                                className="portrait-card__bg"
                                style={{
                                    background: meta.gradient,
                                    ...(photoUrl ? { backgroundImage: `url(${photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
                                }}
                            />

                            {/* Gradient overlay */}
                            <div className="portrait-card__overlay" />

                            {/* Watermark index */}
                            <div className="portrait-card__index" aria-hidden>
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            {/* Bottom content */}
                            <div className="portrait-card__body">
                                <span className="portrait-card__icon" aria-hidden>{meta.icon}</span>
                                <h3 className="portrait-card__name">{category}</h3>
                                <div className="portrait-card__hoods">
                                    {meta.hood.split(" • ").slice(0, 2).map((h) => (
                                        <span key={h} className="portrait-card__hood-pill">{h}</span>
                                    ))}
                                </div>
                                <div className="portrait-card__cta" aria-hidden>
                                    <span>Explore Top 10</span>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            {/* Selected dot */}
                            {isSelected && (
                                <div className="portrait-card__dot animate-glow-pulse" />
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default FoodJourney;
