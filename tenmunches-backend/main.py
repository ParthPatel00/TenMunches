import os
import json
from google_places_client import search_places, get_place_details, simplify_place
from sentiment import process_reviews, summarize_themes
from ranker import rank_businesses
from testimonial_extractor import select_testimonials

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
        details = get_place_details(place["place_id"])
        if not details:
            continue

        reviews = details.get("reviews", [])
        processed_reviews = process_reviews(reviews)
        place_data = simplify_place(details, processed_reviews)

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
    with open(os.path.join(OUTPUT_DIR, "top_places_photos_senti.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("✅ Finished! Output saved to `output/top_places.json`")


if __name__ == "__main__":
    main()
