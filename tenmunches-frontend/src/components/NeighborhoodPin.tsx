import { useState, useCallback } from "react";

interface PinProps {
    icon: string;
    category: string;
    businessName: string;
    neighborhood: string;
    rank: number;
    delay?: number;
    isActive?: boolean;
    onClick: (category: string, businessName: string) => void;
    onHover?: (category: string, businessName: string) => void;
}

const NeighborhoodPin = ({
    icon,
    category,
    businessName,
    rank,
    isActive = false,
    onClick,
    onHover,
}: PinProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        onHover?.(category, businessName);
    }, [category, businessName, onHover]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        onHover?.("", ""); // Clear global hover state
    }, [onHover]);

    // The entire pin container. We use absolute bottom-0 so MapLibre's `anchor="bottom"` works perfectly.
    return (
        <div
            className={`relative flex flex-col items-center justify-end cursor-pointer pointer-events-auto transition-all duration-300 ${isHovered || isActive ? "z-50" : "z-10"
                }`}
            onClick={() => onClick(category, businessName)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                // Increase hit area slightly
                paddingBottom: "10px",
                transform: `translateY(${isHovered ? "-8px" : "0px"}) scale(${isHovered ? 1.1 : 1})`,
            }}
        >
            {/* Radar pulse rings under the active/hovered pin */}
            {(isHovered || isActive) && (
                <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-sf-golden animate-ping opacity-50" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-sf-golden animate-ping opacity-30" style={{ animationDelay: '0.5s' }} />
                </div>
            )}

            {/* The Pill / Pin Body */}
            <div
                className={`relative flex items-center justify-center rounded-full shadow-2xl shadow-black/50 transition-all duration-300 overflow-hidden border ${isHovered
                    ? "bg-slate-900 border-sf-golden px-4 py-2 min-w-[max-content]"
                    : isActive
                        ? "bg-sf-golden bg-gradient-to-br from-sf-golden to-sf-golden-light border-white/40 w-9 h-9"
                        : "bg-sf-golden/95 bg-gradient-to-br from-sf-golden/90 to-sf-golden-light/90 border-white/20 w-8 h-8"
                    }`}
            >
                {isHovered ? (
                    <span className="text-white text-sm font-bold whitespace-nowrap flex items-center gap-2 drop-shadow-md">
                        <span className="text-sf-golden-light">#{rank}</span>
                        <span className="text-base shadow-sm">{icon}</span>
                        <span>{businessName}</span>
                    </span>
                ) : (
                    <span className={`drop-shadow-md ${isActive ? "text-base" : "text-sm"}`}>{icon}</span>
                )}
            </div>

            {/* Triangle pointing down */}
            <div
                className={`absolute bottom-[6px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 transition-colors duration-300 border-r border-b z-[-1] ${isHovered || isActive
                    ? "bg-slate-900 border-sf-golden"
                    : "bg-sf-golden-light border-white/20"
                    }`}
            />

            {/* Shadow on the ground */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/60 rounded-[100%] blur-[2px] transition-all duration-300 ${isHovered ? "scale-125 opacity-40" : "scale-100 opacity-60"}`} />
        </div>
    );
};

export default NeighborhoodPin;
