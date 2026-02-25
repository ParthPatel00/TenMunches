"""
Integration tests for the TenMunches backend pipeline.

Run with: python -m pytest tests/test_pipeline.py -v
Requires a valid .env with all service credentials.
"""

import os
import sys

# Ensure the backend package root is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


# ---------------------------------------------------------------------------
# MongoDB
# ---------------------------------------------------------------------------

class TestMongoDB:
    def test_connection(self):
        from db import ping
        assert ping() is True, "MongoDB connection failed"

    def test_upsert_and_read(self):
        from db import upsert_category, get_category

        test_data = {
            "category": "__test__",
            "top_10": [{"name": "Test Place", "rating": 4.5}],
        }
        upsert_category(test_data)
        result = get_category("__test__")
        assert result is not None
        assert result["category"] == "__test__"
        assert len(result["top_10"]) == 1

        # Cleanup
        from db import get_db
        get_db().categories.delete_one({"category": "__test__"})

    def test_get_all_categories(self):
        from db import get_all_categories
        # Should not raise
        result = get_all_categories()
        assert isinstance(result, list)


# ---------------------------------------------------------------------------
# Cloudinary
# ---------------------------------------------------------------------------

class TestCloudinary:
    def test_connection(self):
        from cloudinary_service import test_connection
        assert test_connection() is True, "Cloudinary connection failed"

    def test_upload_photo(self):
        from cloudinary_service import upload_photo

        # Use a small public test image
        test_url = "https://placehold.co/100x100.png"
        result = upload_photo(test_url, "__test_tenmunches__")
        assert result != "", "Cloudinary upload returned empty URL"
        assert "cloudinary" in result.lower(), f"Expected Cloudinary URL, got: {result}"

        # Cleanup
        import cloudinary.uploader
        try:
            cloudinary.uploader.destroy("tenmunches/__test_tenmunches__")
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Google Places
# ---------------------------------------------------------------------------

class TestGooglePlaces:
    def test_search(self):
        from google_places import search_places

        results = search_places("coffee", max_results=3)
        assert len(results) > 0, "Google Places search returned no results"
        assert "id" in results[0], "Place missing 'id' field"

    def test_details(self):
        from google_places import search_places, get_place_details

        results = search_places("coffee", max_results=1)
        assert len(results) > 0
        place_id = results[0]["id"]

        details = get_place_details(place_id)
        assert details, "get_place_details returned empty"
        assert "displayName" in details or "rating" in details


# ---------------------------------------------------------------------------
# NLP Pipeline
# ---------------------------------------------------------------------------

class TestSentiment:
    def test_analyze_sentiment(self):
        from sentiment import analyze_sentiment

        pos = analyze_sentiment("This is absolutely wonderful and amazing!")
        neg = analyze_sentiment("This is terrible and awful.")
        assert pos > 0, f"Expected positive sentiment, got {pos}"
        assert neg < 0, f"Expected negative sentiment, got {neg}"

    def test_process_reviews(self):
        from sentiment import process_reviews

        reviews = [{"text": "Great food!", "author": "Test", "rating": 5}]
        result = process_reviews(reviews)
        assert len(result) == 1
        assert "sentiment" in result[0]
        assert "themes" in result[0]


class TestRanker:
    def test_ranking(self):
        from ranker import rank_businesses

        businesses = [
            {"name": "A", "rating": 3.0, "review_count": 50, "reviews": []},
            {"name": "B", "rating": 4.5, "review_count": 200, "reviews": []},
            {"name": "C", "rating": 4.0, "review_count": 600, "reviews": []},
        ]
        ranked = rank_businesses(businesses)
        # B or C should be ranked higher than A
        assert ranked[0]["name"] != "A"


class TestTestimonials:
    def test_select_testimonials(self):
        from testimonials import select_testimonials

        reviews = [
            {"text": "Amazing place!", "sentiment": 0.8, "themes": ["food"]},
            {"text": "Decent spot.", "sentiment": 0.3, "themes": []},
            {"text": "Not great.", "sentiment": -0.2, "themes": []},
        ]
        result = select_testimonials(reviews, max_count=2)
        assert len(result) == 2
        assert result[0] == "Amazing place!"


# ---------------------------------------------------------------------------
# API Server
# ---------------------------------------------------------------------------

class TestAPI:
    @pytest.fixture(autouse=True)
    def client(self):
        """Create a test client for the FastAPI app."""
        from fastapi.testclient import TestClient
        # Import server without starting scheduler
        import server as srv
        srv.invalidate_cache()
        self._client = TestClient(srv.app)
        yield

    def test_health(self):
        resp = self._client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data

    def test_categories_endpoint(self):
        resp = self._client.get("/api/categories")
        # May be 503 if no data yet, or 200 with data
        assert resp.status_code in (200, 503)

    def test_category_not_found(self):
        resp = self._client.get("/api/categories/__nonexistent__")
        assert resp.status_code == 404
