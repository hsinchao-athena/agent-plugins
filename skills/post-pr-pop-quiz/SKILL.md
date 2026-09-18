---
name: post-pr-pop-quiz
description: "Use this skill whenever a pull request is finished, babysat, or marked ready to merge; when the user asks for a post-PR pop quiz; or when a rule says to invoke post-pr-pop-quiz. It opens a non-blocking browser comprehension quiz from a locked HTML template so the agent can continue without waiting. Never use AskQuestion or any built-in Cursor picker for this quiz."
---

# Post PR Merge Pop-Quiz

Teach the key idea behind a PR without blocking the agent.

Read this file. Do not restyle the page. Do not rewrite `template.html`.

This skill is a fire-and-forget browser card. Do not treat it as `quiz-me`. That skill is a scored teach-back.

## Hard rules

- Never use `AskQuestion`, `cursor_dialog` pickers, or any built-in Cursor selection UI.
- Never wait for an answer. After the page opens, continue the original work.
- Chat stays plain text. Do not paste the options into a picker.

## Steps

1. Resolve the real PR number, URL, and a one-line summary. The page shows these first: a hyperlinked `PR #<number>` line, then the summary.
2. Write one high-leverage question on the PR's purpose, motivation, or key trade-off.
3. Write 3-5 concrete options. Exactly one `correct: true`. Each option needs a `why`. Write them in any order. The renderer shuffles the options, then assigns letters `A`–`E`, so the correct answer is not always first.
4. Do not add an `Other` option.
5. Write only this JSON to a temp file. Do not invent CSS, HTML, or JS.

```json
{
  "pr": {
    "number": 19,
    "url": "https://github.com/olala7846/agent-plugins/pull/19",
    "summary": "Add a locked-template browser pop quiz so agents do not block on AskQuestion."
  },
  "question": "Why must the planner and executor share one feature map?",
  "options": [
    {"text": "Correct reason.", "correct": true, "why": "Why this is right."},
    {"text": "Plausible miss.", "correct": false, "why": "Why this fails."},
    {"text": "Unrelated miss.", "correct": false, "why": "Why this is off-topic."}
  ]
}
```

6. Render and open with the locked template. Run `python3 scripts/render.py <quiz.json>` from this skill directory (`skills/post-pr-pop-quiz/` in this repository, or the installed skill path after plugin install):

```bash
python3 scripts/render.py /tmp/post-pr-pop-quiz.json
```

`scripts/render.py` resolves `template.html` via `Path(__file__).resolve().parent.parent`. The script prints the HTML path and opens it. If `/tmp` is unavailable, pass a JSON file anywhere the script can read; it still writes HTML under `/tmp`.

7. In chat, print only:

```text
[Post PR Merge Pop-Quiz] opened <html-path>
PR #<number> <one-sentence question>
```

8. Continue the PR work. Do not pause for a selection.

## Do not

- Edit `template.html` or add per-quiz styles.
- Generate a new HTML page from scratch.
- Block babysitting, CI, review, or merge-ready work on this quiz.
- Treat this as `quiz-me`. That skill is a scored teach-back. This one is a fire-and-forget browser card.
