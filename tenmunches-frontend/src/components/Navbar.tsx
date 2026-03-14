import { useEffect, useRef, useState } from "react";

const Navbar = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const y = window.scrollY;
                const scrollingDown = y > lastScrollY.current;
                // Hysteresis: only hide when clearly scrolling down past 80px,
                // always show when scrolling up or within 80px of top.
                // Prevents flicker when Lenis decelerates near the threshold.
                setIsVisible(!scrollingDown || y < 80);
                setIsScrolled(y > 50);
                lastScrollY.current = y;
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToCategories = () => {
        (window as any).lenis?.scrollTo(".journey-section", { offset: -100, duration: 1.5 });
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
                }`}
        >
            <div
                className={`mx-auto transition-all duration-500 ${isScrolled
                        ? "mt-4 mx-4 md:mx-8 rounded-2xl glass-light shadow-lg shadow-black/20"
                        : "bg-transparent"
                    }`}
            >
                <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3 group interactive">
                        <img
                            src="/tenLogo.svg"
                            alt="TenMunches"
                            className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500"
                        />
                        <span className="text-lg font-bold tracking-tight text-sf-cream">
                            Ten<span className="text-gradient-golden">Munches</span>
                        </span>
                    </a>

                    {/* Single CTA */}
                    <button
                        onClick={scrollToCategories}
                        className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-sf-golden to-sf-golden-light text-sf-bay-deep hover:shadow-lg hover:shadow-sf-golden/30 transition-all duration-300 interactive"
                    >
                        Explore
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
