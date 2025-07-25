import os
import requests
import time
from typing import List, Dict, Any
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
print(dotenv_path)
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("Missing GOOGLE_API_KEY in environment or .env file")

TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


def search_places(query: str, location: str = "San Francisco", max_results: int = 60) -> List[Dict[str, Any]]:
    """
    Search Google Places for businesses by text query.
    Returns a list of simplified business objects.
    """
    places = []
    params = {
        "query": f"{query} in {location}",
        "key": GOOGLE_API_KEY
    }

    while len(places) < max_results and params:
        response = requests.get(TEXT_SEARCH_URL, params=params)
        data = response.json()

        if "results" not in data:
            print(f"[Error] Google API Error: {data}")
            break

        places.extend(data["results"])

        next_page_token = data.get("next_page_token")
        if not next_page_token:
            break

        # Google requires a short delay before next_page_token works
        time.sleep(2)
        params = {
            "pagetoken": next_page_token,
            "key": GOOGLE_API_KEY
        }

    return places[:max_results]


def get_place_details(place_id: str) -> Dict[str, Any]:
    """
    Get detailed info (including reviews) for a business using its place_id.
    """
    params = {
        "place_id": place_id,
        "fields": "name,rating,user_ratings_total,formatted_address,review,types,url",
        "key": GOOGLE_API_KEY
    }

    response = requests.get(DETAILS_URL, params=params)
    data = response.json()

    if "result" not in data:
        print(f"[Error] Failed to fetch details for place_id={place_id}")
        return {}

    return data["result"]


def simplify_place(place: Dict[str, Any], reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Normalize the business + review data into our internal format.
    """
    return {
        "id": place.get("place_id"),
        "name": place.get("name"),
        "rating": place.get("rating"),
        "review_count": place.get("user_ratings_total"),
        "address": place.get("formatted_address"),
        "categories": place.get("types", []),
        "url": place.get("url", ""),
        "reviews": [
            {
                "author": r.get("author_name"),
                "rating": r.get("rating"),
                "text": r.get("text"),
                "time": r.get("relative_time_description")
            }
            for r in reviews
        ]
    }
