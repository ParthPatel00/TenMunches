# TenMunches 🍽️

**Live Demo → [ten-munches.vercel.app](https://ten-munches.vercel.app/)**

TenMunches surfaces the **top 10 places to eat and drink in San Francisco** across 20 curated categories — coffee, sushi, ramen, brunch, bars, and more. Instead of scrolling through hundreds of Yelp reviews, you get a single, beautiful page with AI-curated insights, real photos, and the best testimonials pulled from thousands of Google reviews.

---

## What It Does

1. **Pick a category** — choose from 20 food & drink categories (coffee, pizza, vegan, etc.)
2. **See the top 10** — ranked by a composite score blending Google rating, review sentiment, and volume
3. **Read real insights** — curated testimonials extracted from reviews via NLP
4. **Click through** — every place links directly to Google Maps

All data refreshes automatically every week via GitHub Actions, so rankings and reviews stay current.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Data Pipeline** | Python, TextBlob (NLP), Google Places API v1 |
| **Database** | MongoDB Atlas (source of truth) |
| **Image CDN** | Cloudinary (auto-format, auto-quality) |
| **Hosting** | Vercel (static CDN — zero cold starts) |
| **Automation** | GitHub Actions (weekly cron refresh) |

---

## Getting Started

See **[SETUP.md](SETUP.md)** for full setup instructions including environment config, API keys, and deployment.

```bash
# Quick start (after configuring .env)
cd tenmunches-backend && source venv/bin/activate && python export_data.py
cd tenmunches-frontend && npm run dev
```

---

## System Design

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Weekly Cron)               │
│                                                              │
│  refresh.py → Google Places API → NLP → Cloudinary Upload    │
│      ↓                                                       │
│  export_data.py → MongoDB Query → categories.json → git push │
└──────────────────────────────────────────────────────────────┘
                              │
                    (auto-deploy on push)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     Vercel CDN (Edge Network)                │
│                                                              │
│  React App (HTML/JS/CSS)  +  /data/categories.json (446 KB) │
│                                                              │
│  Served from 70+ global edge nodes — <50ms worldwide        │
└──────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────┐                    ┌────────────────┐
│  Browser     │─── img src ───────▶│  Cloudinary    │
│  (User)      │                    │  CDN (images)  │
└──────────────┘                    └────────────────┘
```

### Why Static Pre-Rendering?

The data only changes weekly. There's no reason to query a database on every page visit. By pre-rendering the data to a static JSON file:

- **Zero cold starts** — data is served from Vercel's CDN edge, same as HTML/CSS
- **No server to maintain** — no backend process, no sleep/wake cycles, no scaling concerns
- **Global edge delivery** — <50ms response times worldwide via Vercel's 70+ edge nodes
- **Free** — no compute costs; Vercel serves static files for free

This is the same architecture pattern used by companies like Netflix and Airbnb for content that doesn't change per-request — **static site generation (SSG)** with automated rebuilds.

### Data Flow

The system operates in two completely decoupled paths:

**Write Path (Weekly Refresh via GitHub Actions):**

1. **Trigger:** GitHub Actions cron fires every Monday at 6:00 AM UTC, or manually via the GitHub UI.
2. **Ingestion:** For each of the 20 food categories, `refresh.py` queries Google Places API text search for businesses in San Francisco (up to 20 results per category).
3. **Enrichment:** For each business, it fetches full details (reviews, photos, metadata) from the Places details endpoint.
4. **NLP Processing:** Every review is processed through TextBlob for polarity-based sentiment scoring (-1 to +1) and keyword-based theme extraction (taste, price, ambiance, service).
5. **Ranking:** Businesses are scored using a composite function: `score = base_rating + (normalized_sentiment) + review_volume_bonus`. The top 10 per category are retained.
6. **Image Upload:** Each business's Google-hosted photo is uploaded to Cloudinary, which returns a permanent CDN URL with `f_auto,q_auto` transformations. Cloudinary deduplicates by `public_id` so re-uploads are skipped.
7. **Testimonial Extraction:** Up to 3 testimonials are selected per business using a tiered priority: high-sentiment reviews with themes → medium-sentiment → any non-empty review.
8. **Persistence:** Each category (with its top 10 businesses) is upserted into MongoDB Atlas.
9. **Static Export:** `export_data.py` queries MongoDB and writes a compact JSON file (~446 KB) to `tenmunches-frontend/public/data/categories.json`.
10. **Deploy:** The workflow commits and pushes the updated JSON file, triggering a Vercel rebuild automatically.

**Read Path (User Request):**

1. User visits `ten-munches.vercel.app`
2. Vercel CDN serves the React app and `categories.json` from the nearest edge node
3. React renders category buttons; all images are prefetched via `requestIdleCallback`
4. User clicks a category → data is already in memory, images already cached → **instant render**

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

MongoDB serves as the **source of truth** for the data pipeline. It is not queried at runtime by end users — the static JSON export decouples the pipeline from serving. MongoDB was chosen over a relational database because:
- The data is **document-oriented** — each category is a self-contained unit with a nested array of businesses, mapping perfectly to MongoDB's document model without joins.
- The dataset is **small** (20 documents) and **write-infrequent** (weekly upserts).

### Image Pipeline

Images follow this path:

```
Google Places API  →  Cloudinary Upload API  →  Cloudinary CDN  →  Browser
(source photo URL)    (upload + transform)      (f_auto, q_auto)   (optimized)
```

Key design decisions:
- **Permanent URLs:** Google Places photo URLs require an API key and can expire. By re-hosting on Cloudinary, images persist indefinitely on permanent CDN URLs.
- **Deduplication:** Each image uses the Google `place_id` as its Cloudinary `public_id`. Re-running the refresh pipeline skips already-uploaded images, reducing both API calls and upload time.
- **Automatic optimization:** Cloudinary handles format negotiation (WebP, AVIF, JPEG) and quality compression at the edge, delivering the smallest possible payload per browser.

### Frontend Performance Optimizations

Two-layer image prefetch ensures zero-delay category switching:

1. **Background prefetch:** After the static JSON loads, `requestIdleCallback` silently preloads all 200 business images across all categories during browser idle time.
2. **Hover prefetch:** When a user hovers over a category button, that category's 10 images are immediately queued (in case background hasn't reached them yet).

By the time the user clicks, both the data and images are already in the browser cache.

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

### Data Freshness & Automation

Data freshness is managed through **GitHub Actions scheduled workflows**:

- A cron job runs every Monday at 6:00 AM UTC
- It executes the full pipeline (`refresh.py` → `export_data.py`)
- The updated `categories.json` is committed and pushed
- Vercel auto-deploys on push, making fresh data live within minutes
- Manual refreshes can be triggered anytime from the GitHub Actions UI

This replaces the need for an always-on server with background scheduling — the pipeline runs on GitHub's ephemeral runners (free for public repos) and only needs the ~15 minutes it takes to process all 20 categories.

---

## Created By

**Parth Patel**
Software Engineer
[LinkedIn](https://www.linkedin.com/in/parth-patel-sjsu/) · [Portfolio](https://patelparth.me)
