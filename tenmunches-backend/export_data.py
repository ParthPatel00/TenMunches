"""
Export MongoDB category data to a static JSON file for Vercel CDN serving.

Usage:
    python export_data.py

Reads all categories from MongoDB and writes them to
../tenmunches-frontend/public/data/categories.json
"""

import json
import os
import sys

from dotenv import load_dotenv

# Load env vars from backend .env, then from root .env as fallback
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from db import get_all_categories


def export_categories(output_path: str | None = None) -> None:
    """Export all category data from MongoDB to a static JSON file."""
    if output_path is None:
        output_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "tenmunches-frontend",
            "public",
            "data",
            "categories.json",
        )

    print("📦 Exporting categories from MongoDB...")
    data = get_all_categories()

    if not data:
        print("❌ No data found in MongoDB. Run refresh.py first.")
        sys.exit(1)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = os.path.getsize(output_path) / 1024
    print(f"✅ Exported {len(data)} categories to {output_path} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    export_categories()
