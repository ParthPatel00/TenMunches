import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const categoryIcons: Record<string, string> = {
    coffee: "☕", pizza: "🍕", burger: "🍔", vegan: "🥗", bakery: "🥐",
    brunch: "🍳", sushi: "🍣", thai: "🍜", chinese: "🥡", indian: "🍛",
    mexican: "🌮", korean: "🍲", italian: "🍝", mediterranean: "🫒",
    seafood: "🦞", sandwiches: "🥪", juice: "🧃", icecream: "🍨",
    bars: "🍻", bbq: "🍖", ramen: "🍥",
};

const categoryDescriptions: Record<string, string> = {
    coffee: "Third-wave roasters & cozy cafés",
    pizza: "Neapolitan to New York-style slices",
    burger: "Smash burgers to gourmet stacks",
    vegan: "Plant-forward culinary innovation",
    bakery: "Artisan bread & French pastries",
    brunch: "Weekend brunches & mimosa flights",
    sushi: "Omakase bars & fresh nigiri",
    thai: "Authentic curries & street food",
    chinese: "Dim sum to Sichuan fire",
    indian: "Rich curries & tandoori classics",
    mexican: "Taquerias & modern Mexican",
    korean: "BBQ, bibimbap & fried chicken",
    italian: "Handmade pasta & coastal vibes",
    mediterranean: "Mezze, kebabs & olive groves",
    seafood: "Dungeness crab & oyster bars",
    sandwiches: "Delis, banh mi & subs",
    juice: "Cold-pressed & smoothie bowls",
    icecream: "Artisan gelato & soft serve",
    bars: "Cocktail lounges & dive bars",
    bbq: "Smoky brisket & pulled pork",
    ramen: "Rich tonkotsu & miso bowls",
};

const categoryNeighborhoods: Record<string, string> = {
    coffee: "Mission • SoMa • Hayes Valley",
    pizza: "North Beach • Marina • Castro",
    burger: "Mission • Haight • FiDi",
    vegan: "Mission • Castro • Inner Sunset",
    bakery: "Sunset • Richmond • Noe Valley",
    brunch: "Marina • Pacific Heights • NoPa",
    sushi: "Japantown • FiDi • Inner Richmond",
    thai: "Tenderloin • SoMa • Sunset",
    chinese: "Chinatown • Inner Richmond • Sunset",
    indian: "Curry Mile • SoMa • Mission",
    mexican: "Mission • Excelsior • Bayview",
    korean: "Inner Richmond • Sunset • SoMa",
    italian: "North Beach • Marina • FiDi",
    mediterranean: "Hayes Valley • Marina • Noe",
    seafood: "Fisherman's Wharf • SoMa • Sunset",
    sandwiches: "FiDi • SoMa • Mission",
    juice: "Castro • Marina • Hayes Valley",
    icecream: "Mission • Hayes Valley • Haight",
    bars: "Mission • Polk • Marina",
    bbq: "SoMa • Mission • Bayview",
    ramen: "Japantown • Tenderloin • SoMa",
};

// Background gradients per category for visual variety
const categoryGradients: Record<string, string> = {
    coffee: "linear-gradient(135deg, #3E2723, #5D4037)",
    pizza: "linear-gradient(135deg, #BF360C, #E64A19)",
    burger: "linear-gradient(135deg, #4E342E, #795548)",
    vegan: "linear-gradient(135deg, #1B5E20, #388E3C)",
    bakery: "linear-gradient(135deg, #F9A825, #FFB74D)",
    brunch: "linear-gradient(135deg, #E65100, #FF8F00)",
    sushi: "linear-gradient(135deg, #0D47A1, #1565C0)",
    thai: "linear-gradient(135deg, #880E4F, #AD1457)",
    chinese: "linear-gradient(135deg, #C62828, #D32F2F)",
    indian: "linear-gradient(135deg, #E65100, #F57C00)",
    mexican: "linear-gradient(135deg, #2E7D32, #43A047)",
    korean: "linear-gradient(135deg, #4A148C, #6A1B9A)",
    italian: "linear-gradient(135deg, #1B5E20, #C62828)",
    mediterranean: "linear-gradient(135deg, #0277BD, #00838F)",
    seafood: "linear-gradient(135deg, #004D40, #00695C)",
    sandwiches: "linear-gradient(135deg, #5D4037, #795548)",
    juice: "linear-gradient(135deg, #F57F17, #FBC02D)",
    icecream: "linear-gradient(135deg, #AD1457, #EC407A)",
    bars: "linear-gradient(135deg, #1A237E, #283593)",
    bbq: "linear-gradient(135deg, #4E342E, #BF360C)",
    ramen: "linear-gradient(135deg, #E65100, #BF360C)",
};

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
// FoodJourney Component
// ---------------------------------------------------------------------------

const FoodJourney = ({ categories, data, selectedCategory, onSelect, onHover }: Props) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // GSAP horizontal scroll
    useEffect(() => {
        if (!trackRef.current || !wrapperRef.current || !sectionRef.current) return;
        if (categories.length === 0) return;

        const ctx = gsap.context(() => {
            // Title entrance
            if (titleRef.current) {
                gsap.fromTo(
                    titleRef.current,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: titleRef.current,
                            start: "top 85%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            }

            // Horizontal scroll pinning
            const track = trackRef.current!;
            const totalWidth = track.scrollWidth - window.innerWidth;

            gsap.to(track, {
                x: -totalWidth,
                ease: "none",
                scrollTrigger: {
                    trigger: wrapperRef.current,
                    start: "top top",
                    end: () => `+=${totalWidth}`,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            // Card stagger entrance
            const cards = track.querySelectorAll(".journey-card");
            gsap.fromTo(
                cards,
                { y: 60, opacity: 0, scale: 0.92 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.7,
                    stagger: 0.06,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: wrapperRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, [categories]);

    // 3D tilt on mouse move
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        },
        []
    );

    const handleMouseLeave = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.transform =
                "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
        },
        []
    );

    return (
        <section ref={sectionRef} className="journey-section relative bg-sf-bay-deep">
            {/* Section title */}
            <div className="relative z-10 text-center pt-20 pb-8 px-6">
                <h2
                    ref={titleRef}
                    className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4"
                    style={{ opacity: 0 }}
                >
                    Pick Your <span className="text-gradient-golden">Craving</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-2">
                    Scroll through 20 curated categories. Each has the top 10 spots in SF.
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                        <path d="M5 12h14m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Scroll to explore</span>
                </div>
            </div>

            {/* Horizontal scroll wrapper */}
            <div ref={wrapperRef} className="relative">
                <div
                    ref={trackRef}
                    className="journey-track pl-8 pr-[50vw] py-8"
                    style={{ willChange: "transform" }}
                >
                    {categories.map((category, index) => {
                        const isSelected = selectedCategory === category;
                        const icon = categoryIcons[category] || "🍽️";
                        const desc = categoryDescriptions[category] || "Discover top spots";
                        const hood = categoryNeighborhoods[category] || "San Francisco";
                        const fallbackGradient = categoryGradients[category] || "linear-gradient(135deg, #1E3A5F, #0F172A)";

                        // Find the top #1 business's photo
                        const categoryBlock = data.find((d) => d.category === category);
                        const topBizPhoto = categoryBlock?.top_10?.[0]?.photo_url;

                        return (
                            <div
                                key={category}
                                className={`journey-card ${isSelected ? "glow-golden-strong" : ""}`}
                                onClick={() => onSelect(category)}
                                onPointerEnter={() => onHover?.(category)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                style={{ opacity: 0 }}
                            >
                                {/* Background gradient or precise top business photo! */}
                                <div
                                    className="journey-card-bg"
                                    style={{
                                        background: fallbackGradient,
                                        ...(topBizPhoto ? {
                                            backgroundImage: `url(${topBizPhoto})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center"
                                        } : {})
                                    }}
                                />

                                {/* Dark Gradient overlay for readability */}
                                <div className="journey-card-overlay" />

                                {/* Decorative number */}
                                <div
                                    className="absolute top-4 right-5 z-[2] text-7xl font-display font-bold leading-none"
                                    style={{ color: "rgba(255,255,255,0.04)" }}
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </div>

                                {/* Content */}
                                <div className="journey-card-content">
                                    {/* Category icon */}
                                    <div className="relative inline-block mb-3">
                                        <span className="text-5xl block">{icon}</span>
                                        {isSelected && (
                                            <div
                                                className="absolute inset-0 blur-xl rounded-full"
                                                style={{
                                                    background: "var(--sf-golden)",
                                                    opacity: 0.4,
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Category name */}
                                    <h3 className="text-2xl md:text-3xl font-display font-bold capitalize mb-2 text-white">
                                        {category}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-300 text-sm mb-3 font-light">
                                        {desc}
                                    </p>

                                    {/* Neighborhood tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {hood.split(" • ").map((h) => (
                                            <span
                                                key={h}
                                                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400"
                                            >
                                                {h}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Explore CTA */}
                                    <div className="flex items-center gap-2 text-sf-golden-light text-sm font-semibold group/cta">
                                        <span>Explore Top 10</span>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="transform group-hover/cta:translate-x-1 transition-transform"
                                        >
                                            <path
                                                d="M5 12h14m0 0l-4-4m4 4l-4 4"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Active indicator */}
                                {isSelected && (
                                    <div className="absolute top-4 left-4 z-[3] w-3 h-3 rounded-full bg-sf-golden animate-glow-pulse" />
                                )}

                                {/* Gradient border on hover */}
                                <div
                                    className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        padding: "1px",
                                        background:
                                            "linear-gradient(135deg, var(--sf-golden), transparent 40%, var(--sf-golden-light))",
                                        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                        WebkitMask:
                                            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                        maskComposite: "exclude",
                                        WebkitMaskComposite: "xor",
                                        borderRadius: "24px",
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FoodJourney;
