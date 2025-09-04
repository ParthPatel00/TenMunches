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

# Updated to use the newer Places API endpoints
TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
DETAILS_URL = "https://places.googleapis.com/v1/places/"


def search_places(query: str, location: str = "San Francisco", max_results: int = 60) -> List[Dict[str, Any]]:
    """
    Search Google Places for businesses by text query using the new Places API.
    Returns a list of simplified business objects.
    """
    places = []
    
    # Use the new Places API format
    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.id,places.rating,places.userRatingCount,places.formattedAddress,places.types,places.photos"
    }
    
    data = {
        "textQuery": f"{query} in {location}",
        "maxResultCount": max_results
    }

    try:
        response = requests.post(TEXT_SEARCH_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        if "places" in result:
            places = result["places"]
            
    except requests.exceptions.RequestException as e:
        print(f"Error calling Places API: {e}")
        return []

    return places[:max_results]


def get_place_details(place_id: str) -> Dict[str, Any]:
    """
    Get detailed info (including reviews) for a business using its place_id.
    """
    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,formattedAddress,types,reviews,photos"
    }

    try:
        response = requests.get(f"{DETAILS_URL}{place_id}", headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching place details: {e}")
        return {}


def simplify_place(place: Dict[str, Any], reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Normalize the business + review data into our internal format, including photo URL if available.
    """
    # Try to get first photo reference and build a URL
    photos = place.get("photos", [])
    photo_url = ""
    if photos:
        photo = photos[0]
        # For the new API, we need to use the photo name to build the URL
        photo_name = photo.get("name", "")
        if photo_name:
            photo_url = f"https://places.googleapis.com/v1/{photo_name}/media?key={GOOGLE_API_KEY}&maxWidthPx=800"

    return {
        "id": place.get("id"),
        "name": place.get("displayName", {}).get("text", ""),
        "rating": place.get("rating"),
        "review_count": place.get("userRatingCount"),
        "address": place.get("formattedAddress"),
        "categories": place.get("types", []),
        "url": f"https://maps.google.com/?cid={place.get('id')}",
        "photo_url": photo_url,
        "reviews": [
            {
                "author": r.get("author", {}).get("displayName", "") if r.get("author") else "Anonymous",
                "rating": r.get("rating"),
                "text": r.get("text", {}).get("text", "") if isinstance(r.get("text"), dict) else str(r.get("text", "")),
                "time": r.get("relativePublishTimeDescription", "")
            }
            for r in reviews
        ]
    }
