# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (tenmunches-frontend/)
```bash
npm run dev        # Start dev server
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

### Backend (tenmunches-backend/)
```bash
# Activate virtualenv first
source venv/bin/activate

python refresh.py      # Full data pipeline: Google Places → sentiment → rank → MongoDB
python export_data.py  # Export MongoDB → tenmunches-frontend/public/data/categories.json
```

After running the backend pipeline, the frontend data is updated by committing the new `categories.json`. In production, GitHub Actions handles this weekly.

## Architecture

TenMunches is a **static site** showing the top 10 SF restaurants/bars across 20 food & drink categories. It uses a write-path / read-path split:

**Write path (weekly via GitHub Actions):**
1. `refresh.py` orchestrates the pipeline for each category:
   - `google_places.py` — queries Google Places API v1 (New)
   - `sentiment.py` — TextBlob NLP scoring on reviews
   - `ranker.py` — composite score: `rating + sentiment_normalized + volume_bonus`
   - `testimonials.py` — selects best review snippets (<300 chars, high sentiment)
   - `cloudinary_service.py` — uploads photos to Cloudinary CDN (deduplicated by `place_id`)
   - `db.py` — upserts results to MongoDB Atlas (`categories` collection)
2. `export_data.py` — dumps MongoDB → `tenmunches-frontend/public/data/categories.json`
3. GitHub Actions commits and pushes → Vercel auto-deploys

**Read path (every user visit):**
- Vercel serves static HTML/JS/CSS from edge CDN
- `App.tsx` fetches `categories.json` once on mount (no backend calls at runtime)
- All 200 businesses live in memory; interactions are instant

## Frontend Structure

**State lives in `App.tsx`:** `selectedCategory` and scroll coordination between sections. App fetches and holds all data, passing it down to children.

**Key components:**
- `SFMapHero.tsx` — MapLibre GL interactive map with category filter dropdown; clicking a pin scrolls to and highlights the matching `BusinessCard`
- `FoodJourney.tsx` — GSAP-scrubbed horizontal scroll carousel of the 20 categories; selecting a category triggers scroll to `ResultsSection`
- `ResultSection.tsx` — Renders top 10 `BusinessCard` components for the selected category
- `BusinessCard.tsx` — Presentational card: rank, Cloudinary image, rating, testimonial excerpts, Google Maps link
- `NeighborhoodPin.tsx` — Map marker with radar-pulse animation on hover/active

**Animations:** GSAP + ScrollTrigger for scroll-driven effects; Framer Motion for component transitions; Lenis (initialized in `main.tsx`) for smooth scroll globally.

**Tailwind theme** (`tailwind.config.js`) defines custom SF-themed colors (`golden`, `bay-deep`, `cream`, etc.) and keyframe animations (`fog-drift`, `float`, `glow-pulse`, `pin-float`, `radar-pulse`).

## Data Schema

`categories.json` structure:
```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "neighborhoods": ["string"],
      "icon": "string",
      "top_image": "cloudinary_url",
      "places": [
        {
          "place_id": "string",
          "name": "string",
          "rating": 4.5,
          "score": 0.92,
          "photo_url": "cloudinary_url",
          "testimonials": ["string"],
          "address": "string",
          "google_maps_url": "string"
        }
      ]
    }
  ]
}
```

## Environment Variables

Backend (`.env` in `tenmunches-backend/`): `GOOGLE_PLACES_API_KEY`, `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Frontend: no runtime env vars — data is baked into the static JSON.
