import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";


interface Props {
  onScrollToCategories: () => void;
}

const Hero = ({ onScrollToCategories }: Props) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);

  // Generate random particles
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${6 + Math.random() * 6}s`,
        size: `${3 + Math.random() * 5}px`,
        opacity: 0.3 + Math.random() * 0.5,
      })),
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: "30%",
          scale: 1.1,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }

      // Headline animation — stagger words
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll(".word");
        gsap.fromTo(
          words,
          { y: 80, opacity: 0, rotateX: -40 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.08,
            delay: 0.3,
          }
        );
      }

      // Subtitle fade in
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            delay: 1.0,
          }
        );
      }

      // CTA fade in
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { y: 20, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            delay: 1.4,
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Split text into words for animation
  const headlineWords = "San Francisco's Best, Curated for You".split(" ");

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden"
    >
      {/* Background image with parallax */}
      <img
        ref={bgRef}
        src="/sf.jpg"
        alt="San Francisco skyline"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{ willChange: "transform" }}
      />

      {/* Dark gradient overlay — SF Bay deep blue */}
      <div className="absolute inset-0 bg-gradient-to-b from-sf-bay-deep/70 via-sf-bay-deep/50 to-sf-bay-deep z-[1]" />

      {/* Vignette */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(15, 23, 42, 0.7) 100%)",
        }}
      />

      {/* Fog drift layer */}
      <div className="fog-layer" />

      {/* Golden particles */}
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

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-[1.05] tracking-tight"
          style={{ perspective: "600px" }}
        >
          {headlineWords.map((word, i) => (
            <span
              key={i}
              className={`word inline-block mr-[0.25em] ${word === "San" || word === "Francisco's"
                ? "text-gradient-golden"
                : "text-white"
                }`}
              style={{
                opacity: 0,
                display: "inline-block",
                willChange: "transform, opacity",
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          style={{ opacity: 0 }}
        >
          Top 10 places in 20 food & drink categories — curated from thousands
          of reviews, local buzz, and AI-powered insights.
        </p>

        {/* CTA Button */}
        <button
          ref={ctaRef}
          onClick={onScrollToCategories}
          className="group relative px-8 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-sf-golden to-sf-golden-light text-sf-bay-deep hover:shadow-2xl hover:shadow-sf-golden/40 transition-all duration-500 hover:scale-105 interactive"
          style={{ opacity: 0 }}
        >
          <span className="relative z-10">Explore Categories</span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sf-golden-light to-sf-golden opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-xs text-gray-400 tracking-widest uppercase">
          Scroll
        </span>
        <div className="scroll-cue">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-sf-golden"
          >
            <path
              d="M12 5v14m0 0l-6-6m6 6l6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Golden Gate Bridge section divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          {/* Bridge cables */}
          <path
            d="M0 80 Q360 20 720 50 Q1080 80 1440 30 V80 H0 Z"
            fill="var(--sf-bay-deep)"
            opacity="0.8"
          />
          <path
            d="M0 80 Q360 30 720 55 Q1080 80 1440 40 V80 H0 Z"
            fill="var(--sf-bay-deep)"
          />
          {/* Golden accent line */}
          <path
            d="M0 78 Q360 28 720 53 Q1080 78 1440 38"
            stroke="var(--sf-golden)"
            strokeWidth="1"
            opacity="0.3"
            fill="none"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
