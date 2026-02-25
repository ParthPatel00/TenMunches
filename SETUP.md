# TenMunches — Setup Guide

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** & npm
- A [Google Cloud](https://console.cloud.google.com/) project with **Places API (New)** enabled
- A [MongoDB Atlas](https://cloud.mongodb.com/) cluster (free tier works)
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

---

## 1. Clone & Configure Environment

```bash
cp tenmunches-backend/.env.sample tenmunches-backend/.env
```

Edit `tenmunches-backend/.env` and fill in all values:

| Variable | Where to find it |
|---|---|
| `GOOGLE_API_KEY` | [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) |
| `MONGODB_URI` | [MongoDB Atlas → Database → Connect](https://cloud.mongodb.com/) — choose "Connect your application" |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary Dashboard](https://console.cloudinary.com/settings) — top of page |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard — below cloud name |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard — below API key |

> **MongoDB Atlas tip:** Under **Database Access**, create a user with a simple alphanumeric password. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere.

---

## 2. Backend Setup

```bash
cd tenmunches-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Run tests (optional but recommended)

```bash
python -m pytest tests/test_pipeline.py -v
```

### Initial data refresh

Populates MongoDB with all 20 categories (takes ~10–15 minutes):

```bash
python refresh.py
```

### Start the API server

```bash
uvicorn server:app --reload --port 8000
```

The server will:
- Serve data from MongoDB at `http://localhost:8000/api/categories`
- Auto-refresh data every 7 days via background scheduler
- Auto-populate the DB on first launch if it's empty

**API Docs:** Visit `http://localhost:8000/docs` for interactive Swagger UI.

---

## 3. Frontend Setup

```bash
cd tenmunches-frontend
npm install
npm run dev
```

Opens at `http://localhost:5173/`. The Vite dev server proxies `/api` requests to the backend at `localhost:8000`.

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check + last refresh timestamp |
| `GET` | `/api/categories` | All 20 categories with top 10 places each |
| `GET` | `/api/categories/{name}` | Single category (e.g. `/api/categories/coffee`) |
| `POST` | `/api/refresh` | Manually trigger a full data refresh |

---

## 5. Production Deployment

1. Deploy the backend to **Render**, **Railway**, or **Fly.io** — set all env vars there
2. Update the frontend to point to the deployed backend URL
3. Deploy the frontend to **Vercel** (already configured)

---

## Architecture

```
Frontend (React/Vite)  →  FastAPI Server  →  MongoDB Atlas
                              ↕
                         Cloudinary CDN
                              ↕
                       Google Places API
```

- **MongoDB** stores category data (20 docs, one per category)
- **Cloudinary** hosts all place photos with auto-format/quality CDN
- **APScheduler** refreshes data every 7 days in the background
- **In-memory cache** (5-min TTL) keeps API responses fast
