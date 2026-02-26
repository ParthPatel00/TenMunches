export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        sf: {
          fog: 'rgba(220, 225, 230, 0.15)',
          golden: '#C5944A',
          'golden-light': '#E8B04B',
          sunset: '#F97316',
          pink: '#EC4899',
          bay: '#1E3A5F',
          'bay-deep': '#0F172A',
          cream: '#FFF8F0',
          terracotta: '#C75B39',
        },
      },
      animation: {
        'fog-drift': 'fogDrift 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 10s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scroll-cue': 'scrollCue 2s ease-in-out infinite',
        'gradient-rotate': 'gradientRotate 3s linear infinite',
        'particle-rise': 'particleRise 8s ease-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'text-reveal': 'textReveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards',
        'pin-float': 'pinFloat 3s ease-in-out infinite',
        'radar-pulse': 'radarPulse 2s ease-out infinite',
        'bridge-breathe': 'bridgeBreathe 8s ease-in-out infinite',
        'water-shimmer': 'waterShimmer 6s ease-in-out infinite',
        'ambient-pulse': 'ambientPulse 6s ease-in-out infinite',
      },
      keyframes: {
        fogDrift: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(1deg)' },
          '66%': { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(197, 148, 74, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(197, 148, 74, 0.6)' },
        },
        scrollCue: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(12px)', opacity: '0.5' },
        },
        gradientRotate: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        particleRise: {
          '0%': { transform: 'translateY(100vh) scale(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-20vh) scale(1)', opacity: '0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        textReveal: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
