---
name: write-issue
description: Draft or improve executable engineering issues for GitHub, Linear, or another tracker, including features, bugs, performance improvements, and removals. Use when turning a problem or proposal into an issue with evidence, a testable hypothesis, outcome-based acceptance criteria, and rollback or deletion criteria.
---

# Write Issue

Write an agreement about the problem, desired outcome, and evidence needed to decide whether a change works. Leave implementation choices to the human or agent doing the work. An executor should be able to start, make routine tradeoffs, verify the result, and stop without repeated clarification.

## Establish the problem

Read the supplied context and relevant available evidence before asking questions. Use existing tracker templates and repository conventions when available, mapping the content below into their structure.

Identify the affected user or operator, their task, the current behavior, the pain it causes, and why the work matters now. For a bug, capture expected versus actual behavior, reproduction conditions, environment, and frequency when known. For removal or internal maintenance, identify the operating or maintenance burden and who benefits.

Separate observations from explanations. Link logs, traces, screenshots, reports, measurements, or code references to the claims they support; include relevant environment and measurement dates. A user report is evidence of a reported experience, not proof of its cause. Redact secrets and unnecessary personal data.

Never invent measurements, reproduction steps, root causes, user demand, or agreed thresholds. Label assumptions and proposed targets. Ask only about missing information that changes scope, acceptance, or reversibility; continue drafting the rest. Mark unresolved blockers explicitly. If the cause or benefit is too uncertain for an implementation issue, frame a bounded investigation with an evidence deliverable and a decision it must enable.

## Align on frontend visuals

For frontend issues that change appearance or interaction flows, prompt the issue creator to align on the visual outcome before marking the issue ready for implementation. Prefer an attached image of the agreed mockup or prototype; an accessible, stable link to a specific design or prototype version also works. For a visual bug, include the current screenshot and an annotated expected result or an existing approved reference. Reuse an adequate reference already supplied rather than asking again.

Record which reference is agreed, which visible properties and interactions are acceptance requirements, and which details remain open to executor judgment. Cover relevant screen sizes and states, such as loading, empty, error, or disabled, only where they affect this change. Add short behavior notes for interactions and accessibility requirements that a static image cannot communicate. A screenshot of the current problem alone does not establish the intended outcome.

If the intended visual outcome is missing or disputed, ask for a reference or offer to help create a mockup or prototype for alignment. Keep drafting the rest, but mark visual alignment as unresolved; a generated proposal is not automatically an agreed design. The executor should not have to guess the intended appearance. For frontend work with no visual or interaction change, state that existing presentation and behavior are preserved instead of requiring a new mockup.

Tie visual acceptance to comparison with the agreed reference in the relevant states and screen sizes, alongside functional checks. The reference defines the observable result, not the component structure, CSS technique, or other implementation mechanics.

## Form the hypothesis

Use this shape: **If we change X, then Y will improve for Z, because of the suspected relationship R.** Make X a capability or observable behavior and Y a verifiable outcome. Treat the explanation as a hypothesis until evidence supports it.

Translate solution-led requests into outcomes. For example, “add caching to improve UX” becomes “reducing repeat-load waiting time will let returning users complete the task faster.” Record caching as an optional candidate when it helps explain the original proposal. Preserve an explicitly required technique as a constraint with its reason; do not silently discard user requirements.

Use one primary hypothesis per issue. Split work when outcomes can be accepted or rejected independently; keep changes together when they form one verifiable outcome.

## Define the execution boundary

State scope, non-goals, genuine compatibility or operating constraints, and dependencies that affect starting or finishing. Explain why each restrictive constraint exists.

Let the executor choose architecture, libraries, algorithms, file organization, task sequence, tests, and rollout mechanisms within those boundaries. Avoid implementation checklists disguised as acceptance criteria. Include candidate approaches only when they add useful context, clearly labeled as non-binding. Require renewed discussion only when a choice changes the agreed outcome, constraints, or risk boundary.

## Make the decision observable

Define acceptance in terms of behavior or measured effects. Each criterion must identify the scenario or population, expected result, and evidence that would demonstrate it. Include relevant regressions or guardrails, not a generic checklist for every engineering discipline.

For quantitative claims, specify the baseline or how to obtain it, target, measurement method, workload or cohort, and evaluation window or sample requirement. Mark suggested numbers as proposals. For deterministic fixes, reproducible before-and-after checks can be sufficient; do not force a product experiment onto a small bug. “Tests pass,” “looks consistent,” and “improves UX” alone do not establish success.

Distinguish these decisions:

- **Delivery DoD:** The behavior is available in the agreed environment, acceptance checks have evidence, and the recovery path is documented and verified to a depth appropriate to the change.
- **Hypothesis accepted:** The defined outcome threshold is met and guardrails hold.
- **Hypothesis rejected:** Adequate evidence fails the outcome threshold, or a defined harmful effect occurs.
- **Inconclusive:** Evidence is insufficient or confounded. Define a bounded next measurement or decision deadline; do not call this success or automatically treat it as rejection.

When outcome validation takes longer than delivery, state whether the issue remains open or name a tracked follow-up and responsible role for that decision. Do not invent an assignee or silently close the hypothesis at deployment.

## Plan rollback and retirement

Every issue must name the condition that stops or reverses the change, the safe state to restore, and how recovery will be demonstrated. Describe required recovery behavior while leaving the mechanism to the implementer. A small isolated change may need only a tested revert; a data change needs an explicit account of restoring or preserving affected data. Code rollback alone does not undo data or external side effects. If recovery is unresolved, expose that blocker instead of promising reversibility.

Also define when the change should be deleted or retired: a rejected hypothesis, lack of use, replacement, or an expired experiment. Name the review point and responsible role where continued observation is needed. Specify the cleanup outcome for temporary flags, experiments, obsolete paths, and associated resources when applicable. Successful delivery can mean removing code. For a removal issue, define which behavior and data must survive and how to recover if a dependency was missed.

## Draft and check the issue

Use a short outcome-oriented title. The following is a default outline, not a form to pad; combine sections for small issues while preserving the decisions above:

```markdown
# [Desired outcome or observed problem]

## Context and pain
[Affected user, task, current behavior, consequence, and why now.]

## Evidence
[Linked observations, reproduction or baseline, and clearly labeled unknowns.]

## Hypothesis
[If X, then Y for Z, because R.]

## Visual outcome (when applicable)
[Attached agreed mockup or versioned prototype link; required states,
screen sizes, behavior notes, and any unresolved visual decisions.]

## Scope and constraints
[Boundaries, non-goals, justified constraints, and blocking dependencies.]

## Acceptance and Definition of Done
- [ ] [Observable result in a defined scenario, with verification evidence.]
[Outcome evaluation: accept, reject, or inconclusive; method and timing.]
[Closure rule if delivery and outcome evaluation happen separately.]

## Rollback and retirement
[Stop/reversal trigger, safe state, recovery evidence, removal trigger,
and any later review responsibility.]

## Open questions
[Only unresolved decisions; distinguish blockers from executor choices.]
```

Before delivery, read it as an executor with no conversation history. Check that they can explain the pain, distinguish facts from assumptions, choose an approach, verify completion, decide the hypothesis, and recover or retire the change. Replace vague criteria and remove prescribed mechanics. If required decisions remain unresolved, label the issue a draft and identify the minimum information needed to make it executable.

Return the complete title and body. Create or update a tracker issue only when the user has authorized that action and the destination is known. Drafting a skill or an issue does not authorize publishing. When publishing, use available tracker tools, check for an existing matching issue, and return the verified issue link; otherwise deliver the draft without claiming it was filed.
