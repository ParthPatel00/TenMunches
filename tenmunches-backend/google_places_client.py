import os
import requests
import time
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load .env from backend folder or parent TenMunches folder
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_parent_dir = os.path.dirname(_backend_dir)
load_dotenv(os.path.join(_backend_dir, ".env"))
load_dotenv(os.path.join(_parent_dir, ".env"))
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# Optional: if your API key has HTTP referrer restrictions, set this to a whitelisted URL (e.g. https://ten-munches.vercel.app/)
GOOGLE_REFERER = os.getenv("GOOGLE_REFERER", "").strip()

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
    
    # Use the new Places API format (Referer helps when key has HTTP referrer restrictions)
    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.id,places.rating,places.userRatingCount,places.formattedAddress,places.types,places.photos"
    }
    if GOOGLE_REFERER:
        headers["Referer"] = GOOGLE_REFERER
    
    data = {
        "textQuery": f"{query} in {location}",
        "maxResultCount": max_results
    }

    try:
        response = requests.post(TEXT_SEARCH_URL, headers=headers, json=data)
        if not response.ok:
            body = response.text
            try:
                err = response.json()
                body = err.get("error", {}).get("message", body) or body
            except Exception:
                pass
            print(f"Error calling Places API: {response.status_code} - {body}")
            return []
        result = response.json()
        
        if "places" in result:
            places = result["places"]
            
    except requests.exceptions.RequestException as e:
        print(f"Error calling Places API: {e}")
        if hasattr(e, "response") and e.response is not None and e.response.text:
            print(f"Response: {e.response.text[:500]}")
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
    if GOOGLE_REFERER:
        headers["Referer"] = GOOGLE_REFERER

    try:
        response = requests.get(f"{DETAILS_URL}{place_id}", headers=headers)
        if not response.ok:
            body = response.text
            try:
                err = response.json()
                body = err.get("error", {}).get("message", body) or body
            except Exception:
                pass
            print(f"Error fetching place details: {response.status_code} - {body}")
            return {}
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching place details: {e}")
        if hasattr(e, "response") and e.response is not None and e.response.text:
            print(f"Response: {e.response.text[:500]}")
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
