import { useEffect, useRef } from "react";

const CustomCursor = () => {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        // Use transform instead of left/top — GPU-composited, no layout recalc
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;
        let rafId = 0;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Dot snaps instantly — pure transform, zero layout cost
            dot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
        };

        const animate = () => {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
            rafId = requestAnimationFrame(animate);
        };

        // Cursor hover enlargement — use event delegation on document instead of
        // binding to every interactive element (much cheaper, survives DOM updates)
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as Element;
            if (target.closest('a, button, [role="button"], input, select, textarea, .interactive')) {
                document.body.classList.add("cursor-hover");
            }
        };
        const handleMouseOut = (e: MouseEvent) => {
            const target = e.relatedTarget as Element | null;
            if (!target?.closest('a, button, [role="button"], input, select, textarea, .interactive')) {
                document.body.classList.remove("cursor-hover");
            }
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        document.addEventListener("mouseover", handleMouseOver, { passive: true });
        document.addEventListener("mouseout", handleMouseOut, { passive: true });
        rafId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseout", handleMouseOut);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot hidden md:block" />
            <div ref={ringRef} className="cursor-ring hidden md:block" />
        </>
    );
};

export default CustomCursor;
