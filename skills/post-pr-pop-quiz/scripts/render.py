#!/usr/bin/env python3
"""Render a post-PR pop quiz from JSON into the locked HTML template and open it."""

from __future__ import annotations

import argparse
import json
import os
import random
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urlparse

SKILL_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = SKILL_DIR / "template.html"
PLACEHOLDER = "__QUIZ_JSON__"
LETTERS = "ABCDEFGH"


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(2)


def load_quiz(path: Path) -> dict:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"Invalid quiz JSON ({path}): {exc}")

    question = raw.get("question")
    options = raw.get("options")
    if not isinstance(question, str) or not question.strip():
        fail("Quiz JSON must include a non-empty string 'question'.")
    if not isinstance(options, list) or not 3 <= len(options) <= 5:
        fail("Quiz JSON must include 3-5 'options'.")

    normalized = []
    correct_count = 0
    for index, option in enumerate(options, start=1):
        if not isinstance(option, dict):
            fail(f"Option {index} must be an object.")
        text = option.get("text")
        why = option.get("why")
        correct = option.get("correct")
        if not isinstance(text, str) or not text.strip():
            fail(f"Option {index} needs a non-empty 'text'.")
        if not isinstance(why, str) or not why.strip():
            fail(f"Option {index} needs a non-empty 'why'.")
        if not isinstance(correct, bool):
            fail(f"Option {index} needs boolean 'correct'.")
        if text.strip().lower().startswith("other"):
            fail("Do not include an Other option. Use only concrete answers.")
        if correct:
            correct_count += 1
        normalized.append(
            {
                "text": text.strip(),
                "correct": correct,
                "why": why.strip(),
            }
        )

    if correct_count != 1:
        fail("Exactly one option must have correct=true.")

    pr = load_pr(raw.get("pr"))
    shuffle_options(normalized, pr["number"])
    for index, option in enumerate(normalized):
        letter = LETTERS[index]
        option["id"] = letter.lower()
        option["letter"] = letter

    return {
        "pr": pr,
        "question": question.strip(),
        "options": normalized,
    }


def load_pr(raw: object) -> dict:
    if not isinstance(raw, dict):
        fail("Quiz JSON must include a 'pr' object with number, url, and summary.")
    number = raw.get("number")
    url = raw.get("url")
    summary = raw.get("summary")
    if isinstance(number, str) and number.isdigit():
        number = int(number)
    if not isinstance(number, int) or number <= 0:
        fail("pr.number must be a positive integer.")
    if not isinstance(url, str) or urlparse(url).scheme not in {"http", "https"}:
        fail("pr.url must be an http(s) URL.")
    if not isinstance(summary, str) or not summary.strip():
        fail("pr.summary must be a non-empty string.")
    summary = " ".join(summary.split())
    if len(summary) > 200:
        fail("pr.summary must be at most 200 characters.")
    return {"number": number, "url": url.strip(), "summary": summary}


def shuffle_seed(pr_number: int) -> int:
    override = os.environ.get("POST_PR_POP_QUIZ_SHUFFLE_SEED")
    if override not in {None, ""}:
        return int(override)
    return pr_number


def shuffle_options(options: list[dict], pr_number: int) -> None:
    """PR-seeded Fisher-Yates. The correct option is never left in slot A."""
    rng = random.Random(shuffle_seed(pr_number))
    for index in range(len(options) - 1, 0, -1):
        swap = rng.randrange(index + 1)
        options[index], options[swap] = options[swap], options[index]

    correct_at = next(index for index, option in enumerate(options) if option["correct"])
    if correct_at == 0:
        swap = 1 + rng.randrange(len(options) - 1)
        options[0], options[swap] = options[swap], options[0]


def embed_json(quiz: dict) -> str:
    return json.dumps(quiz, ensure_ascii=False).replace("<", "\\u003c")


def write_html(quiz: dict) -> Path:
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    if PLACEHOLDER not in template:
        fail(f"Locked template is missing {PLACEHOLDER}: {TEMPLATE_PATH}")
    html = template.replace(PLACEHOLDER, embed_json(quiz), 1)
    handle, output = tempfile.mkstemp(prefix="post-pr-pop-quiz-", suffix=".html", dir="/tmp")
    os.close(handle)
    path = Path(output)
    path.write_text(html, encoding="utf-8")
    return path


def open_html(path: Path) -> None:
    if sys.platform == "darwin":
        command = ["open", str(path)]
    elif sys.platform.startswith("linux"):
        command = ["xdg-open", str(path)]
    else:
        return
    subprocess.run(command, check=False)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("quiz_json", help="Path to the quiz JSON payload")
    parser.add_argument(
        "--no-open",
        action="store_true",
        help="Write the HTML file without opening a browser",
    )
    args = parser.parse_args(argv[1:])
    quiz_path = Path(args.quiz_json)
    if not quiz_path.is_file():
        fail(f"Quiz JSON not found: {quiz_path}")
    output = write_html(load_quiz(quiz_path))
    if not args.no_open:
        open_html(output)
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
