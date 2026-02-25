# TenMunches 🍽️

**Live Demo → [ten-munches.vercel.app](https://ten-munches.vercel.app/)**

TenMunches surfaces the **top 10 places to eat and drink in San Francisco** across 20 curated categories — coffee, sushi, ramen, brunch, bars, and more. Instead of scrolling through hundreds of Yelp reviews, you get a single, beautiful page with AI-curated insights, real photos, and the best testimonials pulled from thousands of Google reviews.

---

## What It Does

1. **Pick a category** — choose from 20 food & drink categories (coffee, pizza, vegan, etc.)
2. **See the top 10** — ranked by a composite score blending Google rating, review sentiment, and volume
3. **Read real insights** — curated testimonials extracted from reviews via NLP
4. **Click through** — every place links directly to Google Maps

All data refreshes automatically every week, so rankings and reviews stay current.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **API Server** | Python, FastAPI, Uvicorn |
| **Database** | MongoDB Atlas (document store) |
| **Image CDN** | Cloudinary (auto-format, auto-quality) |
| **NLP Pipeline** | TextBlob (sentiment analysis + theme extraction) |
| **Scheduler** | APScheduler (weekly background refresh) |
| **Data Source** | Google Places API (New) v1 |
| **Frontend Hosting** | Vercel |

---

## Getting Started

See **[SETUP.md](SETUP.md)** for full setup instructions including environment config, API keys, and deployment.

```bash
# Quick start (after configuring .env)
cd tenmunches-backend && source venv/bin/activate && uvicorn server:app --reload --port 8000
cd tenmunches-frontend && npm run dev
```

---

## System Design

### High-Level Architecture

```
┌─────────────────┐       ┌──────────────────────────────────────────────┐
│                 │       │              Backend (FastAPI)               │
│    Frontend     │       │                                              │
│   React/Vite    │──────▶│  ┌──────────┐   ┌──────────┐   ┌─────────┐ │
│                 │  HTTP │  │ API Layer │──▶│ Cache    │──▶│ MongoDB │ │
│  (Vercel CDN)   │       │  │ /api/*    │   │ (in-mem) │   │ Atlas   │ │
│                 │       │  └──────────┘   └──────────┘   └─────────┘ │
└─────────────────┘       │                                              │
                          │  ┌──────────────────────────────────────┐    │
                          │  │     Background Refresh Pipeline      │    │
                          │  │  APScheduler → Google Places API     │    │
                          │  │  → NLP → Cloudinary → MongoDB        │    │
                          │  └──────────────────────────────────────┘    │
                          └──────────────────────────────────────────────┘
                                        │               │
                                        ▼               ▼
                               ┌──────────────┐  ┌────────────┐
                               │ Google Places │  │ Cloudinary │
                               │   API (v1)    │  │    CDN     │
                               └──────────────┘  └────────────┘
```

### Data Flow

The system operates in two distinct data paths:

**Write Path (Refresh Pipeline)** — runs every 7 days via APScheduler, or manually via `POST /api/refresh`:

1. **Ingestion:** For each of the 20 food categories, the pipeline queries the Google Places API text search endpoint for businesses in San Francisco (up to 20 results per category).
2. **Enrichment:** For each business, it fetches full details (reviews, photos, metadata) from the Places details endpoint.
3. **NLP Processing:** Every review is processed through TextBlob for polarity-based sentiment scoring (-1 to +1) and keyword-based theme extraction (taste, price, ambiance, service).
4. **Ranking:** Businesses are scored using a composite function: `score = base_rating + (normalized_sentiment) + review_volume_bonus`. The top 10 per category are retained.
5. **Image Upload:** Each business's Google-hosted photo is uploaded to Cloudinary, which returns a permanent CDN URL with `f_auto,q_auto` transformations. Cloudinary deduplicates by `public_id` so re-uploads are skipped.
6. **Testimonial Extraction:** Up to 3 testimonials are selected per business using a tiered priority: high-sentiment reviews with themes → medium-sentiment → any non-empty review.
7. **Persistence:** Each category (with its top 10 businesses) is upserted as a single document in MongoDB. A refresh log entry is written with timestamp and status.

**Read Path (API Serving)** — handles all frontend requests:

1. Frontend makes a single `GET /api/categories` request on page load.
2. The FastAPI server checks an **in-memory TTL cache** (5-minute expiry). On cache hit, the response is returned immediately without touching the database.
3. On cache miss, the server queries MongoDB for all 20 category documents and populates the cache.
4. The response is a JSON array of `{ category, top_10: [...] }` objects — the same shape the frontend expects.

### Database Schema (MongoDB)

```
Database: tenmunches

Collection: categories
┌──────────────────────────────────────────────────────┐
│ {                                                    │
│   "category": "coffee",                              │
│   "top_10": [                                        │
│     {                                                │
│       "id": "ChIJ...",                               │
│       "name": "The Coffee Berry SF",                 │
│       "rating": 4.9,                                 │
│       "review_count": 532,                           │
│       "address": "1410 Lombard St, San Francisco",   │
│       "categories": ["cafe", "coffee_shop", ...],    │
│       "url": "https://maps.google.com/?cid=...",     │
│       "photo_url": "https://res.cloudinary.com/...", │
│       "themes_summary": { "coffee": 12, ... },       │
│       "testimonials": ["Great coffee!", ...]          │
│     },                                               │
│     ... (10 businesses per category)                 │
│   ]                                                  │
│ }                                                    │
└──────────────────────────────────────────────────────┘
One document per category, 20 documents total.
Indexed on: { "category": 1 } (unique)

Collection: refresh_log
┌──────────────────────────────────────────────────────┐
│ {                                                    │
│   "timestamp": ISODate("2026-02-25T04:58:39Z"),      │
│   "status": "success",                               │
│   "details": "Completed in 690.4s. Errors: 0"       │
│ }                                                    │
└──────────────────────────────────────────────────────┘
Sorted by timestamp descending for latest-refresh queries.
```

MongoDB was chosen over a relational database for several reasons:
- The data is **document-oriented** — each category is a self-contained unit with a nested array of businesses. This maps perfectly to MongoDB's document model without requiring joins.
- The dataset is **small and read-heavy** (20 documents, queried frequently, written weekly). MongoDB's flexible schema makes upserts trivial.
- **MongoDB Atlas free tier** provides 512 MB storage, which is more than sufficient for this use case.

### Caching Strategy

The API uses a **two-layer caching** approach:

1. **Application-level cache (in-memory, TTL = 5 min):** A Python dictionary keyed by endpoint path. On every `GET /api/categories` request, the cache is checked first. This eliminates database round-trips for the vast majority of requests and brings response times to sub-millisecond.

2. **Cloudinary CDN cache:** All images are served through Cloudinary's global CDN with `f_auto` (automatic format negotiation — WebP for Chrome, AVIF where supported, JPEG fallback) and `q_auto` (perceptual quality optimization). This offloads image bandwidth entirely from the backend.

Cache invalidation is explicit: the cache is cleared when `POST /api/refresh` is called, ensuring fresh data is served immediately after a refresh.

### Image Pipeline

Images follow this path:

```
Google Places API  →  Cloudinary Upload API  →  Cloudinary CDN  →  Browser
(source photo URL)    (upload + transform)      (f_auto, q_auto)   (optimized)
```

Key design decisions:
- **Permanent URLs:** Google Places photo URLs require an API key and can expire. By re-hosting on Cloudinary, images persist indefinitely on permanent CDN URLs.
- **Deduplication:** Each image uses the Google `place_id` as its Cloudinary `public_id`. Re-running the refresh pipeline skips already-uploaded images, reducing both API calls and upload time.
- **Automatic optimization:** Cloudinary handles format negotiation and quality compression at the edge, delivering the smallest possible payload per browser.

### Ranking Algorithm

Businesses are scored using a composite function:

```
score = base_rating + (avg_sentiment + 1) / 2 + volume_bonus
```

| Component | Range | Source |
|---|---|---|
| `base_rating` | 0–5 | Google Places star rating |
| `avg_sentiment` | -1 to +1 | Mean TextBlob polarity across all reviews, normalized to 0–1 |
| `volume_bonus` | 0, 0.25, or 0.5 | +0.25 if 100+ reviews, +0.5 if 500+ reviews |

This produces a final score in the range **0.0–6.5**, where higher is better. The top 10 per category are retained after sorting.

### Scheduling & Data Freshness

The refresh pipeline runs on a **7-day interval** using APScheduler's `BackgroundScheduler`:

- The scheduler starts automatically when the FastAPI server boots (via the `lifespan` hook).
- On first boot, if the database is empty, an initial refresh is triggered on a background thread so the server remains responsive.
- Each refresh processes all 20 categories sequentially (~10–15 min total) and logs the result with timestamp and error count.

### API Design

The API follows REST conventions with three read endpoints and one write endpoint:

| Endpoint | Method | Latency | Description |
|---|---|---|---|
| `/api/health` | GET | <10ms | Health check, DB status, last refresh timestamp |
| `/api/categories` | GET | <5ms (cached) | All 20 categories with top 10 businesses |
| `/api/categories/{name}` | GET | <5ms (cached) | Single category by name |
| `/api/refresh` | POST | ~10 min | Trigger full pipeline synchronously |

CORS is configured to allow requests from the Vercel production domain and local development origins. The Vite dev server proxies `/api` to `localhost:8000` to avoid CORS issues during development.

---

## Created By

**Parth Patel**
Software Engineer
[LinkedIn](https://www.linkedin.com/in/parth-patel-sjsu/) · [Portfolio](https://patelparth.me)
