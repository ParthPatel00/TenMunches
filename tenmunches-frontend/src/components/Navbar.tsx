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
                const currentScrollY = window.scrollY;

                // Show/hide based on scroll direction
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    setIsVisible(false); // scrolling down
                } else {
                    setIsVisible(true); // scrolling up
                }

                setIsScrolled(currentScrollY > 50);
                lastScrollY.current = currentScrollY;
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isVisible ? "translate-y-0" : "-translate-y-full"
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
                    <a
                        href="/"
                        className="flex items-center gap-3 group interactive"
                    >
                        <img
                            src="/tenLogo.svg"
                            alt="TenMunches"
                            className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500"
                        />
                        <span className="text-lg font-bold tracking-tight text-sf-cream">
                            Ten<span className="text-gradient-golden">Munches</span>
                        </span>
                    </a>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => (window as any).lenis?.scrollTo(".journey-track", { offset: -100, duration: 1.5 })}
                            className="text-sm font-medium text-gray-300 hover:text-sf-golden-light transition-colors duration-300 interactive"
                        >
                            Categories
                        </button>
                        <button
                            onClick={() => (window as any).lenis?.scrollTo(".journey-track", { offset: -100, duration: 1.5 })}
                            className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-sf-golden to-sf-golden-light text-sf-bay-deep hover:shadow-lg hover:shadow-sf-golden/30 transition-all duration-300 interactive"
                        >
                            Explore
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
