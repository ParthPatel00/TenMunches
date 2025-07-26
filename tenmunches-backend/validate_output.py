import json
import os

FILE = "../output/top_places.json"

def validate_top_places(file_path: str):
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    with open(file_path, "r") as f:
        data = json.load(f)

    all_good = True

    for category_data in data:
        category = category_data.get("category")
        businesses = category_data.get("top_10", [])

        if len(businesses) != 10:
            print(f"⚠️ Category '{category}' has {len(businesses)} businesses (expected 10)")
            all_good = False

        for biz in businesses:
            name = biz.get("name", "Unknown")
            testimonials = biz.get("testimonials", [])
            if len(testimonials) != 3:
                print(f"⚠️ '{name}' in '{category}' has {len(testimonials)} testimonials (expected 3)")
                all_good = False

    if all_good:
        print("✅ All categories have 10 businesses and each business has 3 testimonials.")
    else:
        print("❌ Validation failed. See issues above.")


if __name__ == "__main__":
    validate_top_places(FILE)
