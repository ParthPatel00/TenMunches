"""
Gemini AI review summarizer for TenMunches.

Takes a list of reviews for a business and generates a concise,
insightful 2-3 sentence summary highlighting what makes the place special.
"""

import os
import time
from typing import Any

from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Initialize Gemini client
client = None
if GEMINI_API_KEY:
    try:
        # The new SDK auto-detects GOOGLE_API_KEY from env, which we use for Places API.
        # It complains if both are set, or uses the wrong one. Unset it locally for the client init.
        original_google_key = os.environ.get("GOOGLE_API_KEY")
        if "GOOGLE_API_KEY" in os.environ:
            del os.environ["GOOGLE_API_KEY"]
            
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Restore the Google API key for the rest of the app
        if original_google_key is not None:
            os.environ["GOOGLE_API_KEY"] = original_google_key
            
    except Exception as e:
        print(f"  ⚠️  Failed to initialize Gemini client: {e}")

SUMMARY_PROMPT = """You are a food critic. Based on these customer reviews for "{name}" ({category} in San Francisco), write ONE sentence (under 30 words) describing what this place is specifically known for — mention a signature dish, drink, or standout quality. Be specific and vivid. No generic praise.

Reviews:
{reviews}

One-sentence summary:"""


def summarize_reviews(
    name: str,
    category: str,
    reviews: list[dict[str, Any]],
    max_retries: int = 5,
) -> str:
    """
    Generate an AI summary of reviews using Gemini.
    Handles rate limiting (429) via exponential backoff.
    """
    if not client:
        print("  ⚠️  Gemini client not initialized, skipping AI summary")
        return ""

    if not reviews:
        return ""

    # Build review text block (limit to 10 reviews for faster processing/fewer tokens)
    review_texts = []
    for r in reviews[:10]:
        text = r.get("text", "").strip()
        rating = r.get("rating", "")
        if text:
            prefix = f"[{rating}★] " if rating else ""
            review_texts.append(f"{prefix}{text}")

    if not review_texts:
        return ""

    reviews_block = "\n---\n".join(review_texts)
    prompt = SUMMARY_PROMPT.format(
        name=name,
        category=category,
        reviews=reviews_block,
    )

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=300,
                ),
            )
            summary = response.text.strip()
            # Remove any surrounding quotes if the model adds them
            if summary.startswith('"') and summary.endswith('"'):
                summary = summary[1:-1]
            return summary
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "Quota exceeded" in error_str:
                wait_time = 35 * (attempt + 1)
                print(f"  ⏳ Gemini rate limit hit for {name}. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
            else:
                print(f"  ⚠️  Gemini summarization failed for {name}: {e}")
                break

    print(f"  ❌ Failed to generate AI summary for {name} after {max_retries} attempts.")
    return ""
