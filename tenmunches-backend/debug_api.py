import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# Test the new Places API
url = "https://places.googleapis.com/v1/places:searchText"
headers = {
    "X-Goog-Api-Key": api_key,
    "X-Goog-FieldMask": "places.displayName,places.id,places.rating,places.userRatingCount,places.formattedAddress,places.types,places.photos"
}

data = {
    "textQuery": "coffee in San Francisco",
    "maxResultCount": 1
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

if result.get('places'):
    place = result['places'][0]
    print("Place structure:")
    print(f"ID: {place.get('id')}")
    print(f"Name: {place.get('displayName')}")
    print(f"Rating: {place.get('rating')}")
    print(f"Address: {place.get('formattedAddress')}")
    
    # Get details for this place
    details_url = f"https://places.googleapis.com/v1/places/{place['id']}"
    details_headers = {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,formattedAddress,types,reviews,photos"
    }
    
    details_response = requests.get(details_url, headers=details_headers)
    details = details_response.json()
    
    print("\nDetails structure:")
    print(f"Reviews count: {len(details.get('reviews', []))}")
    if details.get('reviews'):
        review = details['reviews'][0]
        print(f"Review text type: {type(review.get('text'))}")
        print(f"Review text: {review.get('text')}")
        print(f"Review author: {review.get('author')}")
