import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ No API key found in .env file")
    exit(1)

print(f"🔑 Testing API key: {api_key[:10]}...")

# Test the new Places API
url = "https://places.googleapis.com/v1/places:searchText"
headers = {
    "X-Goog-Api-Key": api_key,
    "X-Goog-FieldMask": "places.displayName,places.id,places.rating,places.userRatingCount,places.formattedAddress,places.types,places.photos"
}

data = {
    "textQuery": "coffee in San Francisco",
    "maxResultCount": 5
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"📡 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ API key is working!")
        print(f"📍 Found {len(result.get('places', []))} places")
        if result.get('places'):
            first_place = result['places'][0]
            print(f"🏪 First place: {first_place.get('displayName', {}).get('text', 'Unknown')}")
    else:
        print(f"❌ API Error: {response.text}")
        
except Exception as e:
    print(f"❌ Request failed: {e}")
