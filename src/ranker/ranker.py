from typing import List, Dict, Any


def compute_business_score(biz: Dict[str, Any]) -> float:
    """
    Compute a score for a business using:
    - Yelp/Google rating (0–5)
    - Number of reviews
    - Avg sentiment from reviews (-1 to 1)
    """
    base_rating = biz.get("rating", 0)
    num_reviews = biz.get("review_count", 0)
    reviews = biz.get("reviews", [])

    if not reviews:
        avg_sentiment = 0
    else:
        sentiments = [r.get("sentiment", 0) for r in reviews]
        avg_sentiment = sum(sentiments) / len(sentiments)

    # Weigh sentiment and base rating together
    # Scale: 0–5 star rating + sentiment (normalized to 0–1)
    score = base_rating + (avg_sentiment + 1) / 2

    # Slightly boost highly reviewed businesses
    if num_reviews > 500:
        score += 0.5
    elif num_reviews > 100:
        score += 0.25

    return round(score, 3)


def rank_businesses(businesses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Rank businesses by computed score.
    """
    for biz in businesses:
        biz["score"] = compute_business_score(biz)

    sorted_biz = sorted(businesses, key=lambda b: b["score"], reverse=True)
    return sorted_biz
