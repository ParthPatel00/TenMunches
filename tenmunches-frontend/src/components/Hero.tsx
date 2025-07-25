const Hero = () => {
  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background image */}
      <picture>
        <source srcSet="/sf.avif" type="image/avif" />
        <img
          src="/sf.jpg" // fallback image (JPG/PNG)
          alt="San Francisco"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
      </picture>

      {/* Overlay img*/}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Discover SF’s Best Food & Drink Spots
        </h1>
        <p className="text-lg md:text-xl drop-shadow-md">
          We analyzed thousands of reviews to find the top 10 places in 20 food
          and drink categories — all in San Francisco.
        </p>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-0" />
    </section>
  );
};

export default Hero;
