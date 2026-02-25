"""
FastAPI server for TenMunches.

Serves category data from MongoDB with in-memory caching for speed.
"""

import time
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db import get_all_categories, get_category, get_last_refresh, ping
from scheduler import start_scheduler

# ---------------------------------------------------------------------------
# In-memory cache (simple TTL cache for speed)
# ---------------------------------------------------------------------------

CACHE_TTL = 300  # 5 minutes

_cache: dict[str, Any] = {}
_cache_ts: dict[str, float] = {}


def _cached(key: str) -> Any | None:
    """Return cached value if not expired, else None."""
    if key in _cache and (time.time() - _cache_ts.get(key, 0)) < CACHE_TTL:
        return _cache[key]
    return None


def _set_cache(key: str, value: Any) -> None:
    _cache[key] = value
    _cache_ts[key] = time.time()


def invalidate_cache() -> None:
    """Clear the entire in-memory cache."""
    _cache.clear()
    _cache_ts.clear()


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start the background scheduler on app startup."""
    start_scheduler()
    yield


app = FastAPI(
    title="TenMunches API",
    description="Top 10 food & drink spots in San Francisco",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origins (for local development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    """Health check + last refresh info."""
    db_ok = ping()
    last_refresh = get_last_refresh()
    return {
        "status": "ok" if db_ok else "db_unreachable",
        "database": "connected" if db_ok else "disconnected",
        "last_refresh": last_refresh,
    }


@app.get("/api/categories")
def list_categories():
    """
    Return all categories with their top_10 businesses.
    This is the main endpoint the frontend fetches on load.
    """
    cached = _cached("all_categories")
    if cached is not None:
        return cached

    data = get_all_categories()
    if not data:
        raise HTTPException(
            status_code=503,
            detail="No data available. Run a refresh first.",
        )
    _set_cache("all_categories", data)
    return data


@app.get("/api/categories/{name}")
def get_single_category(name: str):
    """Return a single category by name."""
    cache_key = f"category:{name}"
    cached = _cached(cache_key)
    if cached is not None:
        return cached

    data = get_category(name)
    if not data:
        raise HTTPException(status_code=404, detail=f"Category '{name}' not found")
    _set_cache(cache_key, data)
    return data


@app.post("/api/refresh")
def trigger_refresh():
    """
    Manually trigger a data refresh.
    Runs synchronously (can take several minutes).
    """
    from refresh import run_full_refresh

    invalidate_cache()
    try:
        run_full_refresh()
        return {"status": "success", "message": "Data refresh completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
