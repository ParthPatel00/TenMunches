"""
Download place photos from Google Places API and save them locally
so the app works even after the API key expires.
"""
import os
import re
import hashlib
import requests
from dotenv import load_dotenv

# Load .env so GOOGLE_REFERER is available when key has HTTP referrer restrictions
_load_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_load_dir, ".env"))
load_dotenv(os.path.join(os.path.dirname(_load_dir), ".env"))
GOOGLE_REFERER = os.getenv("GOOGLE_REFERER", "").strip()


def _safe_filename(place_id: str | None, name: str) -> str:
    """Build a safe filename: use place_id if valid, else slug from name + hash."""
    if place_id and re.match(r"^[\w\-]+$", place_id):
        return place_id
    # Fallback: slug from name + short hash for uniqueness
    slug = re.sub(r"[^\w\-]", "_", (name or "place")[:40]).strip("_") or "place"
    short = hashlib.sha256((name or "").encode()).hexdigest()[:12]
    return f"{slug}_{short}"


def download_place_photo(
    photo_url: str,
    place_id: str | None,
    name: str,
    save_dir: str,
    public_path_prefix: str = "/place-photos",
) -> str:
    """
    Download image from photo_url and save under save_dir.
    Returns the public URL path (e.g. /place-photos/ChIJ....jpg) for use in JSON,
    or "" if download failed.
    """
    if not photo_url or not photo_url.startswith("http"):
        return ""

    os.makedirs(save_dir, exist_ok=True)
    base_name = _safe_filename(place_id, name)
    # Use .jpg by default; server may return webp, we'll detect from Content-Type
    ext = ".jpg"

    headers = {}
    if GOOGLE_REFERER:
        headers["Referer"] = GOOGLE_REFERER

    try:
        resp = requests.get(photo_url, headers=headers, stream=True, timeout=15)
        resp.raise_for_status()
        content_type = (resp.headers.get("Content-Type") or "").lower()
        if "webp" in content_type:
            ext = ".webp"
        elif "png" in content_type:
            ext = ".png"
        file_name = base_name + ext
        file_path = os.path.join(save_dir, file_name)

        with open(file_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        return f"{public_path_prefix}/{file_name}"
    except Exception as e:
        print(f"  ⚠️ Could not download photo for {name!r}: {e}")
        return ""
