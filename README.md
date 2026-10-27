# olala7846-agent-plugins

A skills-only [Agent Plugin](https://agent-plugins.org/specification) maintained by [Hsin-Cheng Chao](https://github.com/olala7846). Version `0.6.1` adds paired before-and-after comparisons to `learn-from-pr`, including retained capabilities and replacement paths for cleanup PRs.

## Included skills

- [`init-coding-agent`](skills/init-coding-agent/SKILL.md): reviews your existing personal instructions, then adds the ASD-STE100-inspired simple technical English preference to the user-level rules of Claude Code, Codex, and Cursor. It never writes repository files.
- [`learn-from-pr`](skills/learn-from-pr/SKILL.md): writes one short HTML learning document for a pull request. It explains why the PR exists, compares behavior or structure before and after the PR, draws the touched code and its neighbors as a component diagram, and maps each changed file to a component. A learner profile sets format and length. The built-in default is tuned to the maintainer. A user override file at `~/.config/learn-from-pr/profile.json` and a per-report request override it. It does not review, gate, or quiz.
- [`post-pr-pop-quiz`](skills/post-pr-pop-quiz/SKILL.md): opens a non-blocking browser quiz from a locked HTML template so an agent can check PR comprehension without waiting for an answer. Distinct from `quiz-me`, which is a scored teach-back.
- [`quiz-me`](skills/quiz-me/SKILL.md): writes an evidence-based HTML change report, holds an open clarification and teach-back conversation, then adaptively quizzes the user with a transparent scorecard before they merge or declare substantial work complete.
- [`spacex-simplify`](skills/spacex-simplify/SKILL.md): applies a SpaceX-inspired engineering review loop to plans, pull requests, specifications, code changes, and architecture proposals.

## Usage

Install this repository with an Agent Plugins-compatible client. The package contains no MCP component; its capabilities are the immediate child skills in `skills/`.

Invoke a skill explicitly when your client supports it, for example:

```text
/quiz-me Quiz me on PR #123 before I merge it.
```

## Development setup

To prepare a clean worktree, use Node.js 22 or later and run:

```sh
./bootstrap.sh
```

The script installs the pinned local validation tools. This repository has no Git hook configuration to install. Run `npm run validate` after a plugin change.

## Validation

The repository validates its manifest, package layout, and every bundled skill in GitHub Actions. Run the same checks locally after bootstrapping:

```sh
npm run validate
```

`plugin.json` uses the Agent Plugins v1.0.0 schema. Each packaged skill is an immediate child of `skills/` and follows the [Agent Skills specification](https://agentskills.io/specification).
