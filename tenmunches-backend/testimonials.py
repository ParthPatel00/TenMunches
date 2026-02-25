"""
Testimonial selection for TenMunches.

Picks the best review quotes to display on business cards.
"""

from typing import Any


def select_testimonials(
    reviews: list[dict[str, Any]],
    max_count: int = 3,
) -> list[str]:
    """
    Select up to `max_count` testimonials, prioritizing quality:
      1. sentiment > 0.4 AND has themes AND length < 300
      2. sentiment > 0.2 AND length < 300
      3. Any non-empty review text
    """
    if not reviews:
        return []

    strong = [
        r for r in reviews
        if r.get("sentiment", 0) > 0.4
        and r.get("themes")
        and 0 < len(r.get("text", "")) < 300
    ]
    medium = [
        r for r in reviews
        if r.get("sentiment", 0) > 0.2
        and 0 < len(r.get("text", "")) < 300
    ]
    fallback = [r for r in reviews if len(r.get("text", "")) > 0]

    selected: list[str] = []
    for source in [strong, medium, fallback]:
        for r in source:
            if len(selected) >= max_count:
                break
            quote = r["text"]
            if quote not in selected:
                selected.append(quote)

    return selected
