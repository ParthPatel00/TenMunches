from typing import List, Dict, Tuple
from textblob import TextBlob
import re
from collections import Counter

# Keywords per theme — extendable
THEME_KEYWORDS = {
    "taste": ["flavor", "taste", "delicious", "bland", "spicy", "sweet", "savory"],
    "price": ["cheap", "affordable", "price", "expensive", "worth", "deal", "value"],
    "ambiance": ["ambience", "decor", "atmosphere", "vibe", "cozy", "noisy"],
    "service": ["service", "staff", "friendly", "rude", "slow", "waiter", "manager"]
}


def analyze_sentiment(text: str) -> float:
    """
    Return polarity score from -1 (negative) to +1 (positive).
    """
    blob = TextBlob(text)
    return blob.sentiment.polarity



# Basic stopword list (can be extended)
STOPWORDS = set([
    "the", "and", "was", "for", "with", "this", "that", "you", "your", "are", "but", "not",
    "have", "they", "had", "from", "has", "it's", "its", "our", "been", "very", "just", "too",
    "all", "out", "get", "who", "she", "he", "them", "some", "it's", "what", "were", "also"
])

def extract_themes(text: str) -> List[str]:
    """
    Fallback: Extract most common meaningful words from review.
    """
    words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())  # words with 4+ letters
    filtered = [w for w in words if w not in STOPWORDS]

    counter = Counter(filtered)
    return [w for w, _ in counter.most_common(5)]



def process_reviews(reviews: List[Dict[str, str]]) -> List[Dict[str, any]]:
    """
    Process a list of reviews. Add sentiment + themes to each.
    """
    enriched = []
    for r in reviews:
        text = r.get("text", "")
        sentiment = analyze_sentiment(text)
        themes = extract_themes(text)
        enriched.append({
            **r,
            "sentiment": sentiment,
            "themes": themes
        })
    return enriched


def summarize_themes(processed_reviews: List[Dict[str, any]]) -> Dict[str, int]:
    """
    Count frequency of each theme across reviews.
    """
    theme_count = {}
    for r in processed_reviews:
        for theme in r.get("themes", []):
            theme_count[theme] = theme_count.get(theme, 0) + 1
    return dict(sorted(theme_count.items(), key=lambda x: x[1], reverse=True))
