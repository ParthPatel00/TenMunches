import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";


interface Props {
    categories: string[];
    selectedCategory: string | null;
    onSelect: (category: string) => void;
    onHover?: (category: string) => void;
}

const categoryIcons: Record<string, string> = {
    coffee: "☕",
    pizza: "🍕",
    burger: "🍔",
    vegan: "🥗",
    bakery: "🥐",
    brunch: "🍳",
    sushi: "🍣",
    thai: "🍜",
    chinese: "🥡",
    indian: "🍛",
    mexican: "🌮",
    korean: "🍲",
    italian: "🍝",
    mediterranean: "🫒",
    seafood: "🦞",
    sandwiches: "🥪",
    juice: "🧃",
    icecream: "🍨",
    bars: "🍻",
    bbq: "🍖",
    ramen: "🍥",
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

const CategoryShowcase = ({
    categories,
    selectedCategory,
    onSelect,
    onHover,
}: Props) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Scroll-triggered entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title reveal
            if (titleRef.current) {
                gsap.fromTo(
                    titleRef.current,
                    { y: 60, opacity: 0 },
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

            // Cards staggered entrance
            if (gridRef.current) {
                const cards = gridRef.current.querySelectorAll(".category-card");
                gsap.fromTo(
                    cards,
                    { y: 60, opacity: 0, scale: 0.9 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        ease: "back.out(1.4)",
                        stagger: 0.05,
                        scrollTrigger: {
                            trigger: gridRef.current,
                            start: "top 80%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [categories]);

    // 3D tilt on hover
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        },
        []
    );

    const handleMouseLeave = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.transform =
                "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
        },
        []
    );

    return (
        <section
            ref={sectionRef}
            id="categories"
            className="relative section-padding bg-sf-bay-deep"
        >
            {/* Subtle topographic pattern background */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(197, 148, 74, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(197, 148, 74, 0.1) 0%, transparent 50%)`,
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Section Title */}
                <div className="text-center mb-16">
                    <h2
                        ref={titleRef}
                        className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4"
                        style={{ opacity: 0 }}
                    >
                        Pick Your <span className="text-gradient-golden">Craving</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        20 curated categories. Top 10 spots each. All in San Francisco.
                    </p>
                </div>

                {/* Category Grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
                >
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category;

                        return (
                            <button
                                key={category}
                                onClick={() => onSelect(category)}
                                onPointerEnter={() => onHover?.(category)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                className={`category-card group relative flex flex-col items-center gap-3 p-6 md:p-8 rounded-2xl transition-all duration-500 interactive
                  ${isSelected
                                        ? "glass-light glow-golden-strong"
                                        : "glass hover:glass-light"
                                    }
                `}
                                style={{
                                    opacity: 0,
                                    willChange: "transform",
                                    transformStyle: "preserve-3d",
                                }}
                            >
                                {/* Rotating gradient border */}
                                <div
                                    className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isSelected ? "!opacity-100" : ""
                                        }`}
                                    style={{
                                        padding: "1px",
                                        background:
                                            "linear-gradient(135deg, var(--sf-golden), transparent 40%, var(--sf-golden-light))",
                                        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                        WebkitMask:
                                            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                        maskComposite: "exclude",
                                        WebkitMaskComposite: "xor",
                                        borderRadius: "inherit",
                                        pointerEvents: "none",
                                    }}
                                />

                                {/* Icon with glow */}
                                <div className="relative">
                                    <span className="text-4xl md:text-5xl block transform group-hover:scale-110 transition-transform duration-500">
                                        {categoryIcons[category] || "🍽️"}
                                    </span>
                                    <div
                                        className={`absolute inset-0 blur-xl rounded-full transition-opacity duration-500 ${isSelected
                                            ? "opacity-60"
                                            : "opacity-0 group-hover:opacity-40"
                                            }`}
                                        style={{ background: "var(--sf-golden)" }}
                                    />
                                </div>

                                {/* Name */}
                                <span
                                    className={`text-sm md:text-base font-semibold capitalize transition-colors duration-300 ${isSelected
                                        ? "text-sf-golden-light"
                                        : "text-gray-200 group-hover:text-sf-golden-light"
                                        }`}
                                >
                                    {category}
                                </span>

                                {/* Neighborhood tag */}
                                <span className="text-[10px] md:text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300 text-center leading-tight">
                                    {categoryNeighborhoods[category] || "San Francisco"}
                                </span>

                                {/* Active indicator */}
                                {isSelected && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-sf-golden to-sf-golden-light animate-glow-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoryShowcase;
