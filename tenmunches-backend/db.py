"""
MongoDB connection and CRUD helpers for TenMunches.

Database: tenmunches
Collections:
  - categories: one document per food category, each contains top_10 array
  - refresh_log: tracks when data was last refreshed
"""

import os
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = "tenmunches"

_client: MongoClient | None = None


def get_client() -> MongoClient:
    """Return a singleton MongoClient, creating it on first call."""
    global _client
    if _client is None:
        if not MONGODB_URI:
            raise ValueError("MONGODB_URI not set in environment")
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return _client


def get_db():
    """Return the tenmunches database handle."""
    return get_client()[DB_NAME]


def ping() -> bool:
    """Test the MongoDB connection. Returns True if healthy."""
    try:
        get_client().admin.command("ping")
        return True
    except ConnectionFailure:
        return False


# ---------------------------------------------------------------------------
# Categories CRUD
# ---------------------------------------------------------------------------

def get_all_categories() -> list[dict[str, Any]]:
    """Return all category documents, excluding MongoDB _id."""
    db = get_db()
    docs = list(db.categories.find({}, {"_id": 0}))
    return docs


def get_category(name: str) -> dict[str, Any] | None:
    """Return a single category document by name."""
    db = get_db()
    doc = db.categories.find_one({"category": name}, {"_id": 0})
    return doc


def upsert_category(data: dict[str, Any]) -> None:
    """Insert or replace a category document (matched by category name)."""
    db = get_db()
    db.categories.replace_one(
        {"category": data["category"]},
        data,
        upsert=True,
    )


def drop_all_categories() -> None:
    """Remove all category documents (used before full refresh)."""
    get_db().categories.delete_many({})


# ---------------------------------------------------------------------------
# Refresh log
# ---------------------------------------------------------------------------

def log_refresh(status: str = "success", details: str = "") -> None:
    """Record a refresh event with timestamp."""
    get_db().refresh_log.insert_one({
        "timestamp": datetime.now(timezone.utc),
        "status": status,
        "details": details,
    })


def get_last_refresh() -> dict[str, Any] | None:
    """Return the most recent refresh log entry."""
    doc = get_db().refresh_log.find_one(
        {},
        {"_id": 0},
        sort=[("timestamp", -1)],
    )
    return doc
