"""Generate a reviewable English mirror of the public desktop curriculum.

Run with a locally installed Argos Arabic-to-English model. The source is the
redacted public JSON, never the desktop application's private database.
"""

import json
import re
from pathlib import Path

import argostranslate.translate


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content" / "desktop-library.json"
OUTPUT = ROOT / "content" / "desktop-library.en.json"
ARABIC = re.compile(r"[\u0600-\u06ff]")
SENTENCE = re.compile(r"(?<=[.!؟؛])(?=\s|$)")
CACHE = {}
COUNT = 0


def translate_line(line):
    global COUNT
    if not ARABIC.search(line):
        return line
    if line in CACHE:
        return CACHE[line]
    leading = line[: len(line) - len(line.lstrip())]
    trailing = line[len(line.rstrip()):]
    body = line.strip()
    # The model occasionally drops the first sentence of a multi-sentence
    # paragraph. Translate each sentence separately and retain line breaks.
    pieces = [piece.strip() for piece in SENTENCE.split(body) if piece.strip()]
    translated = []
    for piece in pieces:
        if len(piece) > 650:
            chunks = re.split(r"(?<=[،,:])\s+", piece)
        else:
            chunks = [piece]
        for chunk in chunks:
            result = argostranslate.translate.translate(chunk, "ar", "en") if ARABIC.search(chunk) else chunk
            translated.append(result.strip() or chunk)
    output = leading + " ".join(translated) + trailing
    CACHE[line] = output
    COUNT += 1
    if COUNT % 100 == 0:
        print(f"Translated {COUNT} unique lines", flush=True)
    return output


def convert(value):
    if isinstance(value, str):
        return "\n".join(translate_line(line) for line in value.split("\n"))
    if isinstance(value, list):
        return [convert(item) for item in value]
    if isinstance(value, dict):
        return {key: convert(item) for key, item in value.items()}
    return value


def main():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    translated = convert(source)
    if [item["id"] for item in source["categories"]] != [item["id"] for item in translated["categories"]]:
        raise SystemExit("Translation changed curriculum IDs")
    OUTPUT.write_text(json.dumps(translated, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    remaining = sum(bool(ARABIC.search(text)) for text in CACHE.values())
    print(f"Translated {COUNT} unique lines; {remaining} still contain Arabic. Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
