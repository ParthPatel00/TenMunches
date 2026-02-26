import { useEffect, useRef } from "react";
import gsap from "gsap";

const GoldenGateBridge3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (containerRef.current) {
                gsap.fromTo(
                    containerRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top 90%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Cable parabola path generator
    const getCablePath = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        sag: number
    ) => {
        const midX = (x1 + x2) / 2;
        const midY = Math.max(y1, y2) + sag;
        return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
    };

    // Vertical suspender cables
    const suspenders = [];
    const towerLeftX = 35;
    const towerRightX = 75;
    const towerTopY = 15;
    const roadY = 65;
    const numSuspenders = 8;

    for (let i = 1; i < numSuspenders; i++) {
        const t = i / numSuspenders;
        const x = towerLeftX + (towerRightX - towerLeftX) * t;
        // Parabola sag calculation
        const cableY = towerTopY + 20 * 4 * t * (1 - t);
        suspenders.push({ x, topY: towerTopY + cableY * 0.3, bottomY: roadY });
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full flex items-center justify-center py-8"
            style={{ opacity: 0 }}
        >
            {/* Background ambient glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(199, 91, 57, 0.06) 0%, transparent 60%)",
                }}
            />

            {/* 3D Bridge container */}
            <div className="bridge-3d-container" style={{ maxWidth: "600px" }}>
                <div className="bridge-3d-scene">
                    <svg
                        viewBox="0 0 110 85"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full"
                        style={{ overflow: "visible" }}
                    >
                        {/* Water reflection */}
                        <rect
                            x="15"
                            y="70"
                            width="80"
                            height="15"
                            rx="2"
                            fill="url(#waterGradient)"
                            className="water-shimmer"
                        />

                        {/* Road deck */}
                        <rect
                            x="20"
                            y={roadY - 1}
                            width="70"
                            height="3"
                            rx="1"
                            fill="#A0452B"
                            opacity="0.9"
                        />
                        <rect
                            x="20"
                            y={roadY + 2}
                            width="70"
                            height="1"
                            fill="#8B3A22"
                            opacity="0.5"
                        />

                        {/* Left tower */}
                        <rect
                            x={towerLeftX - 2}
                            y={towerTopY}
                            width="4"
                            height={roadY - towerTopY + 5}
                            rx="1"
                            fill="url(#towerGradient)"
                        />
                        {/* Left tower highlight */}
                        <rect
                            x={towerLeftX - 1.5}
                            y={towerTopY}
                            width="1"
                            height={roadY - towerTopY + 5}
                            fill="rgba(255, 150, 100, 0.3)"
                            rx="0.5"
                        />
                        {/* Left tower cross beams */}
                        <rect
                            x={towerLeftX - 3}
                            y={towerTopY + 12}
                            width="6"
                            height="1.5"
                            rx="0.5"
                            fill="#A0452B"
                        />
                        <rect
                            x={towerLeftX - 3}
                            y={towerTopY + 28}
                            width="6"
                            height="1.5"
                            rx="0.5"
                            fill="#A0452B"
                        />

                        {/* Right tower */}
                        <rect
                            x={towerRightX - 2}
                            y={towerTopY}
                            width="4"
                            height={roadY - towerTopY + 5}
                            rx="1"
                            fill="url(#towerGradient)"
                        />
                        {/* Right tower highlight */}
                        <rect
                            x={towerRightX - 1.5}
                            y={towerTopY}
                            width="1"
                            height={roadY - towerTopY + 5}
                            fill="rgba(255, 150, 100, 0.3)"
                            rx="0.5"
                        />
                        {/* Right tower cross beams */}
                        <rect
                            x={towerRightX - 3}
                            y={towerTopY + 12}
                            width="6"
                            height="1.5"
                            rx="0.5"
                            fill="#A0452B"
                        />
                        <rect
                            x={towerRightX - 3}
                            y={towerTopY + 28}
                            width="6"
                            height="1.5"
                            rx="0.5"
                            fill="#A0452B"
                        />

                        {/* Main cable — top */}
                        <path
                            d={getCablePath(towerLeftX, towerTopY + 2, towerRightX, towerTopY + 2, 18)}
                            stroke="#C75B39"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* Second cable */}
                        <path
                            d={getCablePath(towerLeftX, towerTopY + 4, towerRightX, towerTopY + 4, 16)}
                            stroke="#A0452B"
                            strokeWidth="0.8"
                            fill="none"
                            opacity="0.6"
                            strokeLinecap="round"
                        />

                        {/* Left approach cable */}
                        <path
                            d={`M 10 ${roadY - 2} Q ${towerLeftX - 5} ${towerTopY + 25} ${towerLeftX} ${towerTopY + 2}`}
                            stroke="#C75B39"
                            strokeWidth="1.2"
                            fill="none"
                            opacity="0.7"
                            strokeLinecap="round"
                        />

                        {/* Right approach cable */}
                        <path
                            d={`M ${towerRightX} ${towerTopY + 2} Q ${towerRightX + 5} ${towerTopY + 25} 100 ${roadY - 2}`}
                            stroke="#C75B39"
                            strokeWidth="1.2"
                            fill="none"
                            opacity="0.7"
                            strokeLinecap="round"
                        />

                        {/* Suspender cables */}
                        {suspenders.map((s, i) => (
                            <line
                                key={i}
                                x1={s.x}
                                y1={s.topY + 5}
                                x2={s.x}
                                y2={s.bottomY - 1}
                                stroke="#C75B39"
                                strokeWidth="0.5"
                                opacity="0.5"
                            />
                        ))}

                        {/* Gradient definitions */}
                        <defs>
                            <linearGradient
                                id="towerGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop offset="0%" stopColor="#D46B44" />
                                <stop offset="50%" stopColor="#C75B39" />
                                <stop offset="100%" stopColor="#8B3A22" />
                            </linearGradient>
                            <linearGradient
                                id="waterGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop offset="0%" stopColor="rgba(30, 58, 95, 0.3)" />
                                <stop offset="100%" stopColor="rgba(15, 23, 42, 0.1)" />
                            </linearGradient>
                        </defs>

                        {/* Tiny animated lights on towers */}
                        <circle cx={towerLeftX} cy={towerTopY + 1} r="1.2" fill="#FF6B35">
                            <animate
                                attributeName="opacity"
                                values="1;0.3;1"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </circle>
                        <circle cx={towerRightX} cy={towerTopY + 1} r="1.2" fill="#FF6B35">
                            <animate
                                attributeName="opacity"
                                values="1;0.3;1"
                                dur="2s"
                                begin="1s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    </svg>
                </div>
            </div>

            {/* Side lines */}
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[25%] h-px"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, rgba(199, 91, 57, 0.3))",
                }}
            />
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[25%] h-px"
                style={{
                    background:
                        "linear-gradient(270deg, transparent, rgba(199, 91, 57, 0.3))",
                }}
            />
        </div>
    );
};

export default GoldenGateBridge3D;
