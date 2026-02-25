"""
Business ranking for TenMunches.

Score = base rating + normalized sentiment + review volume bonus.
"""

from typing import Any


def compute_score(biz: dict[str, Any]) -> float:
    """
    Compute a composite score for a business.

    Components:
      - base_rating (0–5 from Google)
      - avg_sentiment (-1 to 1, normalized to 0–1)
      - volume bonus (+0.25 for 100+ reviews, +0.5 for 500+)
    """
    base_rating = biz.get("rating", 0) or 0
    num_reviews = biz.get("review_count", 0) or 0
    reviews = biz.get("reviews", [])

    if reviews:
        sentiments = [r.get("sentiment", 0) for r in reviews]
        avg_sentiment = sum(sentiments) / len(sentiments)
    else:
        avg_sentiment = 0

    score = base_rating + (avg_sentiment + 1) / 2

    if num_reviews > 500:
        score += 0.5
    elif num_reviews > 100:
        score += 0.25

    return round(score, 3)


def rank_businesses(businesses: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Rank businesses by composite score, descending."""
    for biz in businesses:
        biz["score"] = compute_score(biz)
    return sorted(businesses, key=lambda b: b["score"], reverse=True)
