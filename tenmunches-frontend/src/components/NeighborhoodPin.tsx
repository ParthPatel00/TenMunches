import { useState, useCallback } from "react";

interface PinProps {
    icon: string;
    category: string;
    businessName: string;
    neighborhood: string;
    delay?: number;
    isActive?: boolean;
    onClick: (category: string, businessName: string) => void;
    onHover?: (category: string, businessName: string) => void;
}

const NeighborhoodPin = ({
    icon,
    category,
    businessName,
    neighborhood,
    delay = 0,
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
    }, []);

    const pinScale = isHovered ? 1.2 : 1;

    // The actual anchor point is at the bottom center of this component container.
    return (
        <div
            className="relative flex items-center justify-center cursor-pointer pointer-events-auto group"
            onClick={() => onClick(category, businessName)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                zIndex: isActive || isHovered ? 50 : 10,
                // Enlarge hit area slightly
                width: "60px",
                height: "60px",
            }}
        >
            {/* Tooltip rendered as normal HTML (fixes clipping issues) */}
            {(isHovered || isActive) && (
                <div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-[1px] pointer-events-none"
                    style={{ zIndex: 100 }}
                >
                    <span className="bg-slate-900/95 backdrop-blur-md border border-sf-golden/40 rounded-lg px-3 py-1 text-sf-golden-light text-xs font-semibold font-sans whitespace-nowrap shadow-xl">
                        {icon} {category}
                    </span>
                    <span className="text-[10px] text-white/50 font-sans tracking-widest uppercase">
                        {neighborhood}
                    </span>
                </div>
            )}

            {/* Pin SVG Graphics */}
            <svg
                width="80"
                height="80"
                viewBox="-40 -60 80 80"
                style={{ overflow: "visible", position: "absolute", bottom: -10 }}
            >
                <g>
                    {/* Radar pulse rings */}
                    {(isHovered || isActive) && (
                        <>
                            <circle cx="0" cy="0" r="8" fill="none" stroke="var(--sf-golden)" strokeWidth="1">
                                <animate attributeName="r" from="6" to="30" dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="0" cy="0" r="8" fill="none" stroke="var(--sf-golden)" strokeWidth="0.7">
                                <animate attributeName="r" from="6" to="30" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                            </circle>
                        </>
                    )}

                    {/* Glow circle behind pin */}
                    {(isHovered || isActive) && (
                        <circle cx="0" cy="-10" r="18" fill="var(--sf-golden)" opacity="0.2">
                            <animate attributeName="opacity" values="0.15;0.3;0.15" dur="2s" repeatCount="indefinite" />
                        </circle>
                    )}

                    {/* Pin shadow on ground */}
                    <ellipse
                        cx="0"
                        cy="2"
                        rx={isHovered ? 9 : 6}
                        ry={isHovered ? 3 : 2}
                        fill="rgba(0,0,0,0.5)"
                    >
                        <animate
                            attributeName="rx"
                            values={isHovered ? "9;10;9" : "6;7;6"}
                            dur={`${3 + delay * 0.3}s`}
                            repeatCount="indefinite"
                        />
                    </ellipse>

                    {/* Pin body group with float animation */}
                    <g>
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            values={`0,0; 0,-8; 0,0`}
                            dur={`${2.5 + delay * 0.2}s`}
                            repeatCount="indefinite"
                        />

                        {/* Teardrop pin marker. Scaled up by 1.5 compared to previous SVG map */}
                        <g transform={`scale(${1.5 * pinScale})`} style={{ transformOrigin: "0px 0px", transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
                            <path
                                d="M0 0 C-3 -3, -8 -8, -8 -13 C-8 -20, -3 -23, 0 -23 C3 -23, 8 -20, 8 -13 C8 -8, 3 -3, 0 0 Z"
                                fill={isActive || isHovered ? "var(--sf-golden)" : "rgba(197, 148, 74, 0.95)"}
                                stroke={isActive ? "var(--sf-golden-light)" : "rgba(255, 255, 255, 0.2)"}
                                strokeWidth="0.8"
                                style={{ transition: "fill 0.3s ease" }}
                            />

                            {/* White inner circle for icon background */}
                            <circle
                                cx="0"
                                cy="-13"
                                r="5.5"
                                fill="rgba(15, 23, 42, 0.8)"
                            />

                            {/* Emoji icon */}
                            <text
                                x="0"
                                y="-11.5"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="7.5"
                            >
                                {icon}
                            </text>
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default NeighborhoodPin;
