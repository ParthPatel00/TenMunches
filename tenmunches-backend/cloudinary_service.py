"""
Cloudinary image upload service for TenMunches.

Uploads place photos from Google Places API to Cloudinary CDN.
Returns optimized CDN URLs with auto-format and quality transformations.
"""

import os

import cloudinary
import cloudinary.api
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary from env vars
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.getenv("CLOUDINARY_API_KEY", ""),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
    secure=True,
)

FOLDER = "tenmunches"


def upload_photo(image_url: str, place_id: str) -> str:
    """
    Upload a photo from a URL to Cloudinary.

    Args:
        image_url: The source URL (e.g. Google Places photo URL).
        place_id: Used as the Cloudinary public_id for deduplication.

    Returns:
        The optimized CDN URL, or "" if upload fails.
    """
    if not image_url or not image_url.startswith("http"):
        return ""

    public_id = f"{FOLDER}/{place_id}"

    try:
        # Check if image already exists (skip re-upload for speed)
        try:
            existing = cloudinary.api.resource(public_id)
            if existing and existing.get("secure_url"):
                return _optimized_url(existing["secure_url"])
        except cloudinary.api.NotFound:
            pass  # Image doesn't exist yet, will upload

        # Upload from URL
        result = cloudinary.uploader.upload(
            image_url,
            public_id=public_id,
            overwrite=True,
            resource_type="image",
            transformation=[
                {"width": 800, "height": 600, "crop": "fill", "gravity": "auto"},
                {"quality": "auto", "fetch_format": "auto"},
            ],
        )

        url = result.get("secure_url", "")
        return _optimized_url(url) if url else ""

    except Exception as e:
        print(f"  ⚠️  Cloudinary upload failed for {place_id}: {e}")
        return ""


def _optimized_url(url: str) -> str:
    """Add auto-format and quality transformations to a Cloudinary URL."""
    # If the URL already has transformations from upload, return as-is
    if "/f_auto,q_auto/" in url or "/q_auto,f_auto/" in url:
        return url
    # Insert transformations before /v1/ in the URL
    return url.replace("/upload/", "/upload/f_auto,q_auto/")


def test_connection() -> bool:
    """Verify Cloudinary credentials are valid."""
    try:
        cloudinary.api.ping()
        return True
    except Exception:
        return False
