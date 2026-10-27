# Report structure

Rules for the learning document. Read the merged learner profile first. Every value below that names a profile field comes from that profile.

## Size budget

- Prose budget for the whole document: `communication.length.target_read_minutes` × 150 words.
- Prose limit for one section: `communication.length.max_words_per_section`.
- Tables and the diagram do not count as prose. Keep a table to 12 rows or fewer and each cell to 15 words or fewer.
- Cut detail before you exceed the budget. Never shorten a `file:line` reference or a number.

## Evidence labels

Mark each claim about intent or design as **stated** (the PR, the issue, or a commit says it), **inferred** (the code shows it), or **unknown**. A claim about what the code does needs no label, but it must be true of the code you read.

## Components and IDs

- A component is a module, package, service, or layer that a developer on the project would name. Do not make one component per file.
- Give each component an ID: `C1`, `C2`, and so on. Use the same ID in the diagram, the change map, and the walkthrough.
- State of a component: **touched**, **new**, **removed**, or **neighbor** (unchanged, but connected to a touched component within `architecture.neighbor_depth` hops).
- A neighbor is a caller, a callee, a shared data store or config, or the tests of a touched component. Read the code to find neighbors. Do not guess them from file names.
- Collapse trivia into one row named `Other`: renames, lockfiles, generated files, formatting, and comment-only changes. Do not give `Other` a diagram node.

## Sections

Write the sections in the order of `structure.sections`. Write only the sections in that list.

| ID | Content | Format |
| --- | --- | --- |
| `why` | User need, constraints, and non-goals. Mark each item stated, inferred, or unknown. | Three lines or fewer |
| `context` | Compare behavior or structure before and after the PR, using the same components or scenarios. See "Before and after". | Paired list or table |
| `prediction` | One question: "Before you read on, which components would you change, and how?" The document is static, so the skill does not wait for an answer. Put this section before `context` and `architecture`, because the comparison and diagram reveal the changes. | One sentence |
| `architecture` | The component diagram. See "Diagram". | Diagram plus a legend sentence |
| `change_map` | One row per touched, new, or removed component, plus `Other`. See "Change map". | Table |
| `walkthrough` | One block per touched component, in data-flow order, from entry point to exit. State what changed and why. Use `file:line` references. Name an alternative only when the code or the PR shows it. | Short prose |
| `change_shape` | The shape of the change. See "Shape of the change". | Verdict, numbers, and notes |
| `takeaways` | Three bullets or fewer. Each is a pattern, a trade-off, or a codebase fact that helps with the next PR. Each cites evidence. | List |

If a section has nothing true to say, write one line that says so. Do not invent content.

## Before and after

When `context` is selected, title the section "Before and after".

- Compare the same component or scenario in each pair. Use component IDs from the diagram.
- For a table, use `Component or scenario`, `Before`, `After`, `Effect`, and `Evidence`. For a list, keep the same fields together in each item.
- Describe the resulting behavior or structure in `After`. A list of deleted or edited files belongs in the change map.
- For cleanup and refactoring, distinguish removed capabilities, removed entry points, retained capabilities, and replacement paths. State how a retained capability is reached after the change. If externally visible behavior stays the same, say so and explain the structural change.
- Cite base and resulting code where available. For a new or removed capability, state its absence on the relevant side and cite the diff. Mark anything you could not establish as unknown.
- Separate expected benefits from measured results. Apply the evidence labels to intent and design claims. Do not infer runtime savings or behavior preservation from line counts.

Before opening the report, check that each before item has a paired after state and effect, or an explicit unknown. The reader must be able to understand the comparison within this section, without assembling it from the change map or walkthrough.

## Diagram

Write the diagram in Mermaid first. Use a `flowchart LR`. Keep to `architecture.max_nodes` nodes. If the diagram needs more nodes, group unchanged neighbors first, then the least-changed neighbors.

- Start the diagram with `accTitle:` and `accDescr:` lines.
- Name each node `C<n> <component name>`. When `architecture.show_change_size` is true, add a second line to each touched node: `<files> files, +<added> −<removed>`.
- Label each edge with a short verb or data name, for example `calls`, `reads`, or `emits`.
- Mark the state with more than color. Use these `classDef` styles:
  - touched: thick border, bold text, and a `✎` marker at the start of the label
  - new: thick dashed border and a `+` marker
  - removed: thin dashed border, struck text if the renderer allows it, and a `−` marker
  - neighbor: thin border and normal text
- Add a one-sentence legend under the diagram that names the markers.

### Rendering

The reader must be able to view the diagram. Use the first tier that works, and state the tier in the chat reply.

1. **Local renderer.** If `mmdc` is on `PATH`, render with `mmdc -i <diagram.mmd> -o <diagram.svg> -b transparent`. Check that the SVG has a `<title>`, a `<desc>`, `role="img"`, `aria-labelledby`, and `aria-describedby`. Add any that are missing, with unique IDs. Remove animation rules. Embed only the SVG inline in a `<figure>` with a `<figcaption>`. This tier works offline.
2. **Pinned Mermaid script.** If `mmdc` is not available, embed the diagram as `<pre class="mermaid">…</pre>` and load Mermaid from `https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js`. Start it with `mermaid.initialize({ startOnLoad: true, theme: <dark when prefers-color-scheme is dark, default otherwise> })`. Also place the Mermaid source in a `<details><summary>Diagram source</summary>` block, so the diagram stays readable if the script cannot load. Tell the user that this tier needs network access in the browser. The request fetches only the script. It sends no repository content.
3. **Source only.** If the user refuses network access, put the Mermaid source in a code block and tell the user.

Never draw the SVG by hand.

## Change map

Columns: `ID`, `Component`, `Files and lines`, `What changed`, `Why`, `Size`.

- One row per touched, new, or removed component. Add the `Other` row last.
- `Files and lines`: when `code_mapping.granularity` is `file_and_hunk`, list each file with its changed line ranges, for example `src/auth.ts:12-40, 88-95`. When it is `file`, list files only.
- `Size`: `+added −removed`.
- If `code_mapping.map_changes_to_components` is false, group rows by file and drop the `ID` column.
- Every changed file in the diff must appear in exactly one row. Check this before you write the document.

## Shape of the change

This section shows whether the logic is in one place or spread out. Write it in three parts.

1. **Numbers.** Components touched out of the components in the diagram. Files per touched component. The share of changed lines in the largest touched component. Exclude `Other` from the share.
   - Count a removed component and its replacement as one component.
   - A **follow-through** component only tracks a change made elsewhere, for example docs, version metadata, lockfiles, and tests that list the changed item. Show follow-through components in the numbers, but do not count them toward the Scattered rule.
2. **Verdict.** Use these rules of thumb and show the numbers beside the verdict.
   - **Centralized:** one touched component, or the largest component holds 70% or more of the changed lines.
   - **Scattered:** four or more touched components that are not follow-through, and the largest holds less than 50%.
   - **Mixed:** any other case.
3. **Improvement notes.** Write at most `code_mapping.max_improvement_notes` notes, each marked **inferred**. Each note names a specific place, for example:
   - the same logic appears in two components, with both locations
   - a component changes only to follow a change in another component, which suggests tight coupling
   - new logic sits far from the code it works with
   - changed code has no nearby test

   If you find no such evidence, write "No improvement found in the code read." Never write a note without a location. If `max_improvement_notes` is 0, omit the notes.

## HTML document

- Write one self-contained HTML file. Put the CSS of `report-theme.css` in a `<style>` element in the `<head>`, unchanged. Do not add themes, colors, fonts, or animations.
- The only permitted external resource is the pinned Mermaid script of rendering tier 2.
- The `<title>` is `PR <number>: <short title>`. If the target is not a PR, use the branch name.
- Start the body with an `<h1>` that links to the PR, then a `<section class="summary">` of two sentences or fewer: the goal and the shape verdict.
- Use semantic headings, tables with `<th>` cells, and a `<figcaption>` for the diagram.
