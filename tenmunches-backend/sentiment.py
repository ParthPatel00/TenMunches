"""
Sentiment analysis and theme extraction for TenMunches reviews.

Uses TextBlob for polarity scoring and keyword-based theme detection.
"""

import re
from collections import Counter
from typing import Any

from textblob import TextBlob

# Theme keyword groups
THEME_KEYWORDS = {
    "taste": ["flavor", "taste", "delicious", "bland", "spicy", "sweet", "savory"],
    "price": ["cheap", "affordable", "price", "expensive", "worth", "deal", "value"],
    "ambiance": ["ambience", "decor", "atmosphere", "vibe", "cozy", "noisy"],
    "service": ["service", "staff", "friendly", "rude", "slow", "waiter", "manager"],
}

STOPWORDS = {
    "the", "and", "was", "for", "with", "this", "that", "you", "your", "are", "but",
    "not", "have", "they", "had", "from", "has", "it's", "its", "our", "been", "very",
    "just", "too", "all", "out", "get", "who", "she", "he", "them", "some", "what",
    "were", "also",
}


def analyze_sentiment(text: str) -> float:
    """Return polarity score from -1 (negative) to +1 (positive)."""
    return TextBlob(text).sentiment.polarity


def extract_themes(text: str) -> list[str]:
    """Extract most common meaningful words from a review."""
    words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
    filtered = [w for w in words if w not in STOPWORDS]
    counter = Counter(filtered)
    return [w for w, _ in counter.most_common(5)]


def process_reviews(reviews: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Enrich each review with sentiment score and themes."""
    enriched = []
    for r in reviews:
        text = r.get("text", "")
        enriched.append({
            **r,
            "sentiment": analyze_sentiment(text),
            "themes": extract_themes(text),
        })
    return enriched


def summarize_themes(processed_reviews: list[dict[str, Any]]) -> dict[str, int]:
    """Count theme frequency across all reviews."""
    counts: dict[str, int] = {}
    for r in processed_reviews:
        for theme in r.get("themes", []):
            counts[theme] = counts.get(theme, 0) + 1
    return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True))
