"""
Google Places API (v1) client for TenMunches.

Fetches businesses, reviews, and photo URLs from the Google Places API.
"""

import os
import time
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
DETAILS_URL = "https://places.googleapis.com/v1/places/"


def _headers(extra_fields: str = "") -> dict[str, str]:
    """Build standard headers for Google Places API requests."""
    h = {"X-Goog-Api-Key": GOOGLE_API_KEY}
    if extra_fields:
        h["X-Goog-FieldMask"] = extra_fields
    return h


def search_places(
    query: str,
    location: str = "San Francisco",
    max_results: int = 60,
) -> list[dict[str, Any]]:
    """
    Search Google Places for businesses by text query.
    Returns raw place objects from the API.
    """
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not set in environment")

    headers = _headers(
        "places.displayName,places.id,places.rating,"
        "places.userRatingCount,places.formattedAddress,"
        "places.types,places.photos"
    )
    data = {
        "textQuery": f"{query} in {location}",
        "maxResultCount": min(max_results, 20),  # API max per request is 20
    }

    try:
        resp = requests.post(TEXT_SEARCH_URL, headers=headers, json=data, timeout=10)
        if not resp.ok:
            _log_error("search_places", resp)
            return []
        result = resp.json()
        return result.get("places", [])[:max_results]
    except requests.RequestException as e:
        print(f"❌ search_places error: {e}")
        return []


def get_place_details(place_id: str) -> dict[str, Any]:
    """
    Get detailed info (reviews, photos) for a single place.
    """
    headers = _headers(
        "id,displayName,rating,userRatingCount,formattedAddress,"
        "types,reviews,photos,googleMapsUri"
    )

    try:
        resp = requests.get(
            f"{DETAILS_URL}{place_id}",
            headers=headers,
            timeout=10,
        )
        if not resp.ok:
            _log_error("get_place_details", resp)
            return {}
        return resp.json()
    except requests.RequestException as e:
        print(f"❌ get_place_details error: {e}")
        return {}


def build_photo_url(place: dict[str, Any]) -> str:
    """
    Build a Google Places photo URL from the first photo reference.
    Returns the direct media URL (requires API key).
    """
    photos = place.get("photos", [])
    if not photos:
        return ""
    photo_name = photos[0].get("name", "")
    if not photo_name:
        return ""
    return (
        f"https://places.googleapis.com/v1/{photo_name}/media"
        f"?key={GOOGLE_API_KEY}&maxWidthPx=800"
    )


def simplify_place(
    place: dict[str, Any],
    reviews: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Normalize Google Places data into our internal format.
    """
    return {
        "id": place.get("id", ""),
        "name": place.get("displayName", {}).get("text", ""),
        "rating": place.get("rating", 0),
        "review_count": place.get("userRatingCount", 0),
        "address": place.get("formattedAddress", ""),
        "categories": place.get("types", []),
        "url": place.get("googleMapsUri", ""),
        "photo_url": build_photo_url(place),
        "reviews": [
            {
                "author": (
                    r.get("authorAttribution", {}).get("displayName", "Anonymous")
                ),
                "rating": r.get("rating", 0),
                "text": (
                    r.get("text", {}).get("text", "")
                    if isinstance(r.get("text"), dict)
                    else str(r.get("text", ""))
                ),
                "time": r.get("relativePublishTimeDescription", ""),
            }
            for r in reviews
        ],
    }


def _log_error(context: str, resp: requests.Response) -> None:
    """Log an API error with as much detail as possible."""
    body = resp.text
    try:
        err = resp.json()
        body = err.get("error", {}).get("message", body) or body
    except Exception:
        pass
    print(f"❌ {context}: {resp.status_code} — {body}")
