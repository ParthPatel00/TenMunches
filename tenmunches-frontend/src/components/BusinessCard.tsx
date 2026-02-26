import { useEffect, useRef, useState } from "react";
import { Star, MapPin, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import gsap from "gsap";


interface Props {
  business: {
    name: string;
    address: string;
    rating: number;
    review_count: number;
    themes_summary: Record<string, number | undefined>;
    testimonials: string[];
    photo_url?: string;
    url?: string;
    categories?: string[];
  };
  rank: number;
  reversed?: boolean;
  index: number;
}

const BusinessCard = ({ business, rank, reversed = false }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          {
            y: 80,
            opacity: 0,
            ...(reversed ? { x: -40 } : { x: 40 }),
          },
          {
            y: 0,
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Parallax on image
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current.querySelector("img"),
          { y: "-10%" },
          {
            y: "10%",
            ease: "none",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }
    }, cardRef);

    return () => ctx.revert();
  }, [reversed]);

  const visibleTestimonials = showAll
    ? business.testimonials
    : business.testimonials.slice(0, 1);

  const image =
    !imageError && business.photo_url ? business.photo_url : "/sf.jpg";

  // Animated star fill
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const filled = i < Math.floor(business.rating);
      const partial = i === Math.floor(business.rating) && business.rating % 1 > 0;
      stars.push(
        <Star
          key={i}
          size={16}
          className={`${filled || partial ? "text-sf-golden-light" : "text-gray-600"} transition-colors`}
          fill={filled ? "currentColor" : partial ? "currentColor" : "none"}
          strokeWidth={filled || partial ? 0 : 1.5}
        />
      );
    }
    return stars;
  };

  return (
    <div
      id={`biz-${business.name.replace(/\\s+/g, '-')}`}
      ref={cardRef}
      className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"
        } gap-6 md:gap-10 items-stretch glass rounded-3xl overflow-hidden card-lift group`}
      style={{ opacity: 0 }}
    >
      {/* Image Section */}
      <div
        ref={imageRef}
        className="relative w-full md:w-[45%] min-h-[280px] md:min-h-[380px] overflow-hidden"
      >
        <img
          src={image}
          alt={business.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ height: "120%", top: "-10%" }}
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-sf-bay-deep/80 via-transparent to-sf-bay-deep/20 pointer-events-none" />

        {/* Rank badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center">
            <span className="text-2xl font-display font-bold text-gradient-golden">
              {rank}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-center">
        {/* Name */}
        <h3 className="text-2xl md:text-3xl font-display font-bold text-sf-cream mb-3 leading-tight">
          {business.name}
        </h3>

        {/* Rating + Reviews */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-0.5">{renderStars()}</div>
          <span className="text-sf-golden-light font-semibold text-sm">
            {business.rating}
          </span>
          <span className="text-gray-500 text-sm">
            ({business.review_count.toLocaleString()} reviews)
          </span>
        </div>

        {/* Address */}
        {business.url ? (
          <a
            href={business.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sf-golden-light transition-colors duration-300 mb-5 group/link interactive"
          >
            <MapPin size={14} className="text-sf-golden" />
            <span className="group-hover/link:underline">
              {business.address}
            </span>
            <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
            <MapPin size={14} className="text-sf-golden" />
            {business.address}
          </div>
        )}

        {/* Testimonials */}
        <div className="space-y-3 mb-4">
          {visibleTestimonials.map((quote, i) => (
            <div key={i} className="relative pl-5">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-sf-golden to-sf-golden-light" />
              <p className="text-sm text-gray-300 italic leading-relaxed">
                <span className="text-sf-golden text-lg font-display mr-1">
                  "
                </span>
                {quote.length > 200 ? quote.slice(0, 200) + "…" : quote}
                <span className="text-sf-golden text-lg font-display ml-1">
                  "
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Show more/less */}
        {business.testimonials.length > 1 && (
          <button
            className="inline-flex items-center gap-1 text-xs text-sf-golden hover:text-sf-golden-light transition-colors duration-300 interactive"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                Show less <ChevronUp size={14} />
              </>
            ) : (
              <>
                Show all {business.testimonials.length} testimonials{" "}
                <ChevronDown size={14} />
              </>
            )}
          </button>
        )}

        {/* View on Google Maps CTA */}
        {business.url && (
          <a
            href={business.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-sf-golden/20 to-sf-golden-light/20 border border-sf-golden/30 text-sf-golden-light hover:bg-sf-golden/30 hover:border-sf-golden/50 transition-all duration-300 w-fit interactive"
          >
            <MapPin size={14} />
            View on Google Maps
          </a>
        )}
      </div>
    </div>
  );
};

export default BusinessCard;
