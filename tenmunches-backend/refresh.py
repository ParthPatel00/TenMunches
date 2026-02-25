"""
Data refresh pipeline for TenMunches.

Fetches fresh data from Google Places API, processes it through the
NLP pipeline, uploads images to Cloudinary, and stores results in MongoDB.

Can be run standalone: python refresh.py
"""

import time
from typing import Any

from google_places import search_places, get_place_details, simplify_place
from sentiment import process_reviews, summarize_themes
from ranker import rank_businesses
from testimonials import select_testimonials
from cloudinary_service import upload_photo
from db import upsert_category, log_refresh

CATEGORIES = [
    "coffee", "pizza", "burger", "vegan", "bakery",
    "brunch", "sushi", "thai", "chinese", "indian",
    "mexican", "korean", "italian", "mediterranean", "seafood",
    "sandwiches", "ice cream", "bars", "bbq", "ramen",
]


def process_category(category: str) -> dict[str, Any]:
    """
    Process a single category:
    1. Search Google Places
    2. Fetch details + reviews
    3. Sentiment analysis
    4. Upload photos to Cloudinary
    5. Rank and take top 10
    6. Extract testimonials
    """
    print(f"📍 Processing category: {category}")

    raw_places = search_places(category)
    enriched: list[dict[str, Any]] = []

    for place in raw_places:
        place_id = place.get("id", "")
        if not place_id:
            continue

        details = get_place_details(place_id)
        if not details:
            continue

        reviews_raw = details.get("reviews", [])
        place_data = simplify_place(details, reviews_raw)

        # Run sentiment analysis on reviews
        processed_reviews = process_reviews(place_data.get("reviews", []))
        place_data["reviews"] = processed_reviews

        # Upload photo to Cloudinary for permanent CDN hosting
        google_photo_url = place_data.get("photo_url", "")
        if google_photo_url:
            cdn_url = upload_photo(google_photo_url, place_data["id"])
            place_data["photo_url"] = cdn_url
            time.sleep(0.1)  # Rate-limit politeness

        # Summarize themes
        place_data["themes_summary"] = summarize_themes(processed_reviews)

        enriched.append(place_data)

    # Rank and take top 10
    ranked = rank_businesses(enriched)
    top_10 = ranked[:10]

    # Extract testimonials for top 10
    for biz in top_10:
        biz["testimonials"] = select_testimonials(biz.get("reviews", []))

    # Strip raw reviews from final output (they're large and not needed by frontend)
    for biz in top_10:
        biz.pop("reviews", None)
        biz.pop("score", None)

    return {
        "category": category,
        "top_10": top_10,
    }


def run_full_refresh() -> None:
    """
    Run the full pipeline for all 20 categories and store in MongoDB.
    """
    print("🚀 Starting full data refresh...")
    start = time.time()
    errors: list[str] = []

    for category in CATEGORIES:
        try:
            data = process_category(category)
            upsert_category(data)
            print(f"  ✅ {category}: {len(data['top_10'])} places stored")
        except Exception as e:
            msg = f"❌ Error in '{category}': {e}"
            print(msg)
            errors.append(msg)

    elapsed = round(time.time() - start, 1)
    status = "success" if not errors else "partial"
    details = f"Completed in {elapsed}s. Errors: {len(errors)}"
    if errors:
        details += "\n" + "\n".join(errors)

    log_refresh(status=status, details=details)
    print(f"🏁 Refresh complete in {elapsed}s ({status})")


if __name__ == "__main__":
    run_full_refresh()
