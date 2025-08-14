import json
import os

INPUT_FILE = os.path.join(os.path.dirname(__file__), "extracted_translation_keys.json")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "refined-extracted_translation_keys.json")

def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        extracted = json.load(f)

    cleaned = {}
    for category in extracted.values():
        for key, val in category.items():
            if val and isinstance(val, str) and val.strip():
                cleaned[val] = val

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)

    print(f"✅ Cleaned {len(cleaned)} entries. Output written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()