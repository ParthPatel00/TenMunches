# TenMunches — Setup Guide

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** & npm
- A [Google Cloud](https://console.cloud.google.com/) project with **Places API (New)** enabled
- A [MongoDB Atlas](https://cloud.mongodb.com/) cluster (free tier works)
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

---

## 1. Configure Environment

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

## 2. Backend Setup (Data Pipeline)

```bash
cd tenmunches-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Run the data refresh (populates MongoDB + Cloudinary)

Takes ~10–15 minutes to process all 20 categories:

```bash
python refresh.py
```

### Export to static JSON (for frontend)

```bash
python export_data.py
```

This writes `tenmunches-frontend/public/data/categories.json` (~446 KB) from MongoDB.

---

## 3. Frontend Setup

```bash
cd tenmunches-frontend
npm install
npm run dev
```

Opens at `http://localhost:5173/`. The frontend loads data from the static JSON file — no backend server needed.

---

## 4. GitHub Actions (Automated Weekly Refresh)

The `.github/workflows/weekly-refresh.yml` runs every Monday at 6 AM UTC. To enable it:

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these **Repository Secrets**:

| Secret | Value |
|---|---|
| `GOOGLE_API_KEY` | Your Google API key |
| `MONGODB_URI` | Your MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

3. The workflow will auto-commit updated `categories.json`, which triggers a Vercel redeploy.

You can also trigger it manually: **Actions** → **Weekly Data Refresh** → **Run workflow**.

---

## 5. Production Deployment

The frontend is deployed on **Vercel** — it auto-deploys on every push to `main`. No backend server is needed in production; the static JSON file is served from Vercel's global CDN.

---

## Architecture

```
GitHub Actions (weekly)  →  refresh.py  →  MongoDB Atlas
                         →  export_data.py  →  categories.json  →  git push
                                                                      ↓
                                                              Vercel CDN (frontend)
                                                                      ↓
                                                              Browser ← Cloudinary CDN (images)
```
