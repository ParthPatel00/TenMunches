from src.extractor.testimonial_extractor import select_testimonials

mock_reviews = [
    {"text": "Best coffee I’ve ever had. Dark roast is 🔥", "sentiment": 0.8, "themes": ["taste"]},
    {"text": "Incredible vibe, music, and decor.", "sentiment": 0.7, "themes": ["ambiance"]},
    {"text": "Very affordable for downtown SF. Great value.", "sentiment": 0.9, "themes": ["price"]},
    {"text": "The staff were rude.", "sentiment": -0.4, "themes": ["service"]}
]

print(select_testimonials(mock_reviews))
