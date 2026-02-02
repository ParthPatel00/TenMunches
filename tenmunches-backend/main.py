import os
import json
import time
from google_places_client import search_places, get_place_details, simplify_place
from sentiment import process_reviews, summarize_themes
from ranker import rank_businesses
from testimonial_extractor import select_testimonials
from image_downloader import download_place_photo

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Local image storage: frontend public/place-photos (so images work after API key expires)
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_parent_dir = os.path.dirname(_backend_dir)
PLACE_PHOTOS_DIR = os.path.join(_parent_dir, "tenmunches-frontend", "public", "place-photos")
PUBLIC_PHOTOS_PREFIX = "/place-photos"

CATEGORIES = [
    "coffee", "pizza", "burger", "vegan", "bakery", "brunch", "sushi", "thai", "chinese", "indian", "mexican",
    "korean", "italian", "mediterranean", "seafood", "sandwiches", "ice cream", "bars", "bbq", "ramen"
]
# For testing purposes, work on a smaller set of categories to not run out of API quota
# CATEGORIES = ["coffee", "pizza"]

def process_category(category: str, max_places: int = 60) -> dict:
    print(f"📍 Processing category: {category}")

    raw_places = search_places(category)
    enriched_businesses = []

    for place in raw_places:
        details = get_place_details(place["id"])
        if not details:
            continue

        reviews = details.get("reviews", [])
        place_data = simplify_place(details, reviews)
        processed_reviews = process_reviews(place_data.get("reviews", []))

        # Download photo locally so images work even after API key expires
        if place_data.get("photo_url"):
            google_photo_url = place_data["photo_url"]
            local_path = download_place_photo(
                google_photo_url,
                place_data.get("id"),
                place_data.get("name", ""),
                PLACE_PHOTOS_DIR,
                PUBLIC_PHOTOS_PREFIX,
            )
            place_data["photo_url"] = local_path if local_path else ""
            time.sleep(0.15)  # Be nice to the API

        # Summarize themes for debugging or frontend use
        theme_summary = summarize_themes(processed_reviews)
        place_data["themes_summary"] = theme_summary

        enriched_businesses.append(place_data)

    ranked = rank_businesses(enriched_businesses)
    top_10 = ranked[:10]

    # Add testimonials for top 10
    for biz in top_10:
        biz["testimonials"] = select_testimonials(biz.get("reviews", []))

    return {
        "category": category,
        "top_10": top_10
    }


def main():
    results = []

    for category in CATEGORIES:
        try:
            data = process_category(category)
            results.append(data)
        except Exception as e:
            print(f"❌ Error in category '{category}': {e}")

    # Save to JSON
    out_file = os.path.join(OUTPUT_DIR, "top_places_photos_senti.json")
    with open(out_file, "w") as f:
        json.dump(results, f, indent=2)

    # Copy to frontend public folder so the app uses fresh data (including new API key in photo URLs)
    _backend_dir = os.path.dirname(os.path.abspath(__file__))
    _parent_dir = os.path.dirname(_backend_dir)
    frontend_public = os.path.join(_parent_dir, "tenmunches-frontend", "public", "top_places_photos_senti.json")
    if os.path.exists(os.path.dirname(frontend_public)):
        import shutil
        shutil.copy2(out_file, frontend_public)
        print("✅ Output saved and copied to frontend public/top_places_photos_senti.json")
    else:
        print("✅ Output saved to output/top_places_photos_senti.json (copy to frontend/public/ to see new images)")


if __name__ == "__main__":
    main()
