from typing import List, Dict, Any
import random

def select_testimonials(reviews: List[Dict[str, Any]], max_testimonials: int = 3) -> List[str]:
    """
    Select up to `max_testimonials` testimonials:
    - Prefer sentiment > 0.4 and has themes
    - Fallback to sentiment > 0.2
    - Then fallback to any review text
    """
    if not reviews:
        return []

    # Prioritize top quality
    strong = [r for r in reviews if r.get("sentiment", 0) > 0.4 and r.get("themes") and len(r.get("text", "")) < 300]
    medium = [r for r in reviews if r.get("sentiment", 0) > 0.2 and len(r.get("text", "")) < 300]
    fallback = [r for r in reviews if len(r.get("text", "")) > 0]

    selected = []

    # Select from best available tier
    for source in [strong, medium, fallback]:
        for r in source:
            if len(selected) >= max_testimonials:
                break
            quote = r["text"]
            if quote not in selected:
                selected.append(quote)

    return selected
