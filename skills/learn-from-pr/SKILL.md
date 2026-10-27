---
name: learn-from-pr
description: "Use this skill when the user asks to learn from a pull request, understand a PR or branch change, get an explainer or architecture overview of the code a PR touches, or invokes /learn-from-pr. It writes one short HTML learning document: why the PR exists, a before-and-after comparison, a component diagram of the touched code and its neighbors, and a map from each changed file to a component. A learner profile controls format and length, and the user can override it. It does not review, gate, quiz, or comment on the PR."
---

# Learn from PR

Write one short learning document that helps the user understand a pull request and the code around it. Explain why the PR exists, how behavior or structure compares before and after the PR, what the touched code connects to, and whether the change is centralized or scattered.

Use this skill to learn. Do not use it to approve or reject a PR. A person who needs a scored teach-back uses `quiz-me`. A person who needs a review uses a review skill.

## Hard rules

- Produce one document. Do not quiz the user, give a merge verdict, post to GitHub, or write a learning log.
- Base every claim on the diff or on code you read. Mark intent and design claims as stated, inferred, or unknown.
- Write the document outside the repository. Never add it to Git.
- Make the diagram viewable. Never draw an SVG by hand.

## Step 1: Resolve the target and the profile

**Target.** Identify the PR number, URL, or branch. If it is not clear, ask the user. Prefer `gh pr view` and `gh pr diff` for the description, linked issue, commits, and diff. Without `gh`, use the local diff against the merge base.

**Profile.** A learner profile controls the format of the document. Load three layers. A later layer overrides an earlier one.

| Layer | Source |
| --- | --- |
| 1. Built-in default | `references/learner-profile.default.json` in this skill |
| 2. User override | `~/.config/learn-from-pr/profile.json`, if it exists. It holds only the fields the user changes. |
| 3. Report override | The user's request, for example "text-heavy this time" or "skip the walkthrough". Convert it to profile fields. |

Merge rules:

- Merge objects deeply. A later layer wins.
- Replace an array. Do not append to it.
- Check layers 2 and 3 against `references/learner-profile.schema.json`. If a layer has an invalid field, warn the user in one line, ignore that field, and keep the value from the earlier layer. Do not stop.
- Do not write to layer 1. If the user asks to save a preference, write it to layer 2 and create the directory if needed.

Then print one line, for example: `Profile: hsin-cheng-default + user override + this run (sections: why, context, architecture, change_map)`.

What each profile field does:

| Field | Effect |
| --- | --- |
| `communication.writing_style` | `asd-ste100` applies the writing rules below. |
| `communication.format_priority` | For each piece of information, use the first format that fits. Prose is for reasons only. |
| `communication.length.*` | Prose budget for the document and for each section. |
| `structure.sections` | The sections to write and their order. |
| `architecture.*` | Diagram type, number of hops to neighbors, node limit, and change sizes on nodes. |
| `code_mapping.*` | Whether and how finely to map changes to components, and the number of improvement notes. |
| `output.*` | Format and parent directory of the document. |

### Writing rules for `asd-ste100`

- Use common, concrete words. Use one name for one thing.
- Write one idea in each sentence. Prefer the active voice.
- Repeat the noun when `it` or `this` can refer to more than one thing.
- Keep code identifiers, commands, and quoted text exactly as they are.
- Put the result first, then the evidence, then the limits.
- Say what is unknown. Do not hide it.

## Step 2: Gather evidence

1. Read the PR description, the linked issue, the commit messages, and the full diff.
2. For each behavior or structure you explain, read the relevant code at the diff's comparison base and resulting revision or working tree. Record the comparison revisions. For a deleted entry point, read any retained or replacement path before describing what remains.
3. For each touched file, read enough surrounding code to find its neighbors within `architecture.neighbor_depth` hops: callers, callees, shared data stores or config, and tests. Use search, not guesses.
4. Record the entry points and the data flow through the touched code.
5. Note anything you could not read. State it as unknown in the document.

## Step 3: Build the component model

Follow "Components and IDs" in `references/report-structure.md`. In short:

1. Group the touched and neighbor files into components. Give each an ID: `C1`, `C2`, and so on.
2. Label each component touched, new, removed, or neighbor.
3. Assign every changed file and hunk to exactly one component, or to `Other` for trivia.
4. Check that every changed file in the diff has a component before you write.

## Step 4: Write the document

1. Create a report directory: `mktemp -d "<output.location>/learn-from-pr-XXXXXX"`. Write `report.html` in it. If the location is not writable, ask the user for another one.
2. Write the sections of `structure.sections` in order. Follow `references/report-structure.md` for the content, size budget, diagram, rendering tiers, change map, shape of the change, and HTML rules.
3. Use `references/report-theme.css` unchanged as the style.
4. Render the diagram with the first rendering tier that works. If the first tier fails, use the next one.
5. If `context` is selected, check the comparison against "Before and after" in `references/report-structure.md`. Every before item must have a paired after state and effect, or an explicit unknown. Keep sections omitted by the profile omitted.
6. Open the file in the default browser when the system has a command for it (`open` on macOS, `xdg-open` on Linux). Always print the path.

## Step 5: Reply in chat

Keep the reply short:

- The path of the document.
- The profile line.
- Two lines: the goal of the PR, and the shape verdict with its numbers.
- The diagram tier you used. If the tier needs network access in the browser, say so.
- Anything you could not read or verify.

Do not paste the document into the chat.
