#!/usr/bin/env python3
"""Render a post-PR pop quiz from JSON into the locked HTML template and open it."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

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
    for index, option in enumerate(options):
        if not isinstance(option, dict):
            fail(f"Option {index + 1} must be an object.")
        text = option.get("text")
        why = option.get("why")
        correct = option.get("correct")
        if not isinstance(text, str) or not text.strip():
            fail(f"Option {index + 1} needs a non-empty 'text'.")
        if not isinstance(why, str) or not why.strip():
            fail(f"Option {index + 1} needs a non-empty 'why'.")
        if not isinstance(correct, bool):
            fail(f"Option {index + 1} needs boolean 'correct'.")
        if text.strip().lower().startswith("other"):
            fail("Do not include an Other option. Use only concrete answers.")
        if correct:
            correct_count += 1
        letter = LETTERS[index]
        normalized.append(
            {
                "id": letter.lower(),
                "letter": letter,
                "text": text.strip(),
                "correct": correct,
                "why": why.strip(),
            }
        )

    if correct_count != 1:
        fail("Exactly one option must have correct=true.")

    return {"question": question.strip(), "options": normalized}


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
    if len(argv) != 2:
        fail("Usage: render.py /path/to/quiz.json")
    quiz_path = Path(argv[1])
    if not quiz_path.is_file():
        fail(f"Quiz JSON not found: {quiz_path}")
    output = write_html(load_quiz(quiz_path))
    open_html(output)
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
