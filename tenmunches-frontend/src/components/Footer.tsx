import { useEffect, useRef } from "react";
import gsap from "gsap";


const Footer = () => {
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (footerRef.current) {
                gsap.fromTo(
                    footerRef.current,
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: footerRef.current,
                            start: "top 90%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            }
        }, footerRef);

        return () => ctx.revert();
    }, []);

    return (
        <footer
            ref={footerRef}
            className="relative overflow-hidden py-20 px-6"
            style={{
                background:
                    "linear-gradient(180deg, var(--sf-bay-deep) 0%, #0a0f1a 100%)",
                opacity: 0,
            }}
        >
            {/* Golden Gate Bridge SVG Silhouette */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                <svg
                    viewBox="0 0 1440 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full opacity-10"
                    preserveAspectRatio="none"
                >
                    {/* Main Bridge Span */}
                    <rect x="300" y="80" width="8" height="120" fill="var(--sf-golden)" />
                    <rect x="1132" y="80" width="8" height="120" fill="var(--sf-golden)" />

                    {/* Road */}
                    <rect x="200" y="140" width="1040" height="4" fill="var(--sf-golden)" />

                    {/* Top Cable */}
                    <path
                        d="M304 80 Q720 20 1136 80"
                        stroke="var(--sf-golden)"
                        strokeWidth="3"
                        fill="none"
                    />

                    {/* Vertical Cables */}
                    {[380, 460, 540, 620, 700, 780, 860, 940, 1020, 1060].map(
                        (x, i) => {
                            // Calculate cable top based on parabola
                            const t = (x - 304) / (1136 - 304);
                            const cableTop = 80 + (20 - 80) * 4 * t * (1 - t) + (80 - 20);
                            return (
                                <line
                                    key={i}
                                    x1={x}
                                    y1={cableTop + 15}
                                    x2={x}
                                    y2={140}
                                    stroke="var(--sf-golden)"
                                    strokeWidth="1"
                                    opacity="0.5"
                                />
                            );
                        }
                    )}
                </svg>
            </div>

            {/* Sunset gradient overlay */}
            <div
                className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(0deg, rgba(249, 115, 22, 0.05) 0%, transparent 100%)",
                }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <img src="/tenLogo.svg" alt="TenMunches" className="w-10 h-10" />
                    <span className="text-2xl font-display font-bold">
                        Ten<span className="text-gradient-golden">Munches</span>
                    </span>
                </div>

                <p className="text-gray-400 text-sm max-w-md mx-auto">
                    San Francisco's best food & drink spots, curated from thousands of
                    reviews and powered by AI insights. Updated weekly.
                </p>

                <div className="flex items-center justify-center gap-6 text-sm">
                    <a
                        href="https://github.com/ParthPatel00/TenMunches"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-sf-golden-light transition-colors duration-300 interactive"
                    >
                        GitHub
                    </a>
                    <span className="text-gray-700">•</span>
                    <a
                        href="https://www.linkedin.com/in/parth-patel-sjsu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-sf-golden-light transition-colors duration-300 interactive"
                    >
                        LinkedIn
                    </a>
                    <span className="text-gray-700">•</span>
                    <a
                        href="https://patelparth.me"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-sf-golden-light transition-colors duration-300 interactive"
                    >
                        Portfolio
                    </a>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>Made with ❤️ in San Francisco</p>
                    <p>
                        Created by{" "}
                        <a
                            href="https://patelparth.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sf-golden hover:text-sf-golden-light transition-colors interactive"
                        >
                            Parth Patel
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
