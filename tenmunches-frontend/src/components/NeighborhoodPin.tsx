import { useState, useCallback, memo, useEffect } from "react";

// ---------------------------------------------------------------------------
// Module-level scroll tracking — shared across all pins, zero React re-renders.
// When the page is scrolling, mouse-enter events on pins are suppressed so the
// browser's synthetic enter/leave (fired as elements move under the cursor) can't
// trigger rapid hover-state toggling, which showed up as jitter.
// ---------------------------------------------------------------------------

let _isScrolling = false;
let _scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

function _markScrolling() {
  _isScrolling = true;
  if (_scrollEndTimer) clearTimeout(_scrollEndTimer);
  _scrollEndTimer = setTimeout(() => { _isScrolling = false; }, 200);
}

interface PinProps {
    icon: string;
    category: string;
    businessName: string;
    neighborhood: string;
    rank: number;
    delay?: number;
    isActive?: boolean;
    onClick: (category: string, businessName: string) => void;
    onHover?: (category: string) => void;
}

// Register scroll listeners once when the first pin mounts
let _listenersRegistered = false;

const NeighborhoodPin = memo(({
    icon,
    category,
    businessName,
    rank,
    isActive = false,
    onClick,
    onHover,
}: PinProps) => {
    const [isHovered, setIsHovered] = useState(false);

    // Register Lenis + native scroll listener once across all pin instances
    useEffect(() => {
        if (_listenersRegistered) return;
        _listenersRegistered = true;
        window.addEventListener('scroll', _markScrolling, { passive: true });
        // Lenis fires its own scroll event; register after a tick to ensure lenis is ready
        const t = setTimeout(() => {
            (window as any).lenis?.on('scroll', _markScrolling);
        }, 0);
        return () => clearTimeout(t);
    }, []);

    // Block hover activation during scroll; always allow clearing hover (prevents stuck state)
    const handleMouseEnter = useCallback(() => {
        if (_isScrolling) return;
        setIsHovered(true);
        onHover?.(category);
    }, [category, onHover]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const lit = isHovered || isActive;

    return (
        /*
         * FIXED outer dimensions: 36×36 px always.
         * MapLibre anchor="bottom" reads offsetHeight once — keeping it constant
         * prevents the marker from jumping when hover state changes.
         * Tooltip and radar rings overflow visually but don't affect layout.
         */
        <div
            className="relative cursor-pointer pointer-events-auto"
            style={{ width: 36, height: 36 }}
            onClick={() => onClick(category, businessName)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* ── Floating tooltip — absolutely above the pin, zero layout impact ── */}
            <div
                className="absolute left-1/2 pointer-events-none z-50"
                style={{
                    bottom: "calc(100% + 10px)",
                    transform: "translateX(-50%)",
                    transition: "opacity 0.15s ease, transform 0.15s ease",
                    opacity: isHovered ? 1 : 0,
                    transformOrigin: "bottom center",
                    // Use scale instead of conditional rendering to avoid DOM add/remove
                    // which could briefly affect surrounding elements
                }}
            >
                <div
                    className="px-2.5 py-1.5 rounded-lg border border-sf-golden/50 shadow-xl shadow-black/60 whitespace-nowrap"
                    style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(8px)" }}
                >
                    <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                        <span className="text-sf-golden-light font-bold">#{rank}</span>
                        <span>{icon}</span>
                        <span className="max-w-[160px] truncate">{businessName}</span>
                    </span>
                </div>
                {/* Arrow pointing down */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-sf-golden/50"
                    style={{ top: "calc(100% - 5px)", background: "rgba(15,23,42,0.95)" }}
                />
            </div>

            {/* ── Radar pulse rings — absolute, overflow visible, zero layout impact ── */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
                style={{
                    opacity: lit ? 1 : 0,
                    transition: "opacity 0.2s ease",
                }}
            >
                <div className="absolute w-10 h-10 rounded-full border border-sf-golden animate-ping opacity-40" />
                <div
                    className="absolute w-14 h-14 rounded-full border border-sf-golden animate-ping opacity-20"
                    style={{ animationDelay: "0.4s" }}
                />
            </div>

            {/* ── Pin body — fixed w-9 h-9, only paint properties change (no layout) ── */}
            <div
                className="absolute inset-0 rounded-full border flex items-center justify-center shadow-lg shadow-black/40"
                style={{
                    // Only transform (GPU) + colors (paint) — never layout properties
                    transform: `scale(${isHovered ? 1.2 : isActive ? 1.1 : 1})`,
                    transition: "transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
                    background: isActive
                        ? "linear-gradient(135deg, var(--sf-golden), var(--sf-golden-light))"
                        : isHovered
                            ? "rgba(15,23,42,0.95)"
                            : "linear-gradient(135deg, rgba(197,148,74,0.92), rgba(232,176,75,0.92))",
                    borderColor: lit ? "var(--sf-golden)" : "rgba(255,255,255,0.2)",
                    boxShadow: lit ? "0 0 12px rgba(197,148,74,0.4)" : "none",
                }}
            >
                <span className="text-sm leading-none drop-shadow-sm select-none">{icon}</span>
            </div>

            {/* ── Pin tail — absolute, no layout impact ── */}
            <div
                className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-r border-b"
                style={{
                    bottom: -4,
                    zIndex: -1,
                    transition: "background-color 0.2s ease, border-color 0.2s ease",
                    backgroundColor: lit ? "rgba(15,23,42,0.95)" : "var(--sf-golden-light)",
                    borderColor: lit ? "var(--sf-golden)" : "rgba(255,255,255,0.2)",
                }}
            />
        </div>
    );
});

NeighborhoodPin.displayName = "NeighborhoodPin";

export default NeighborhoodPin;
