# Workflows

## The productive loop

The productive loop is not just code:

1. Understand
2. Plan
3. Implement
4. Verify
5. Document

### Step 1 — Understand

Read the relevant files and the relevant `AGENTS.md` files first. Explain:
1. How the subsystem currently works.
2. What the key abstractions are.
3. What assumptions it relies on.
4. Where the likely change points are.

Do not edit code yet. Before building anything, ask: does this already exist? Can I
reuse what is here? If you have not read enough to know, read first.

### Step 2 — Plan

Produce an implementation plan that covers:
1. Likely files to change.
2. Data-model or API implications.
3. Migration or compatibility concerns.
4. Testing strategy.
5. Top risks.

Do not edit code yet. Do not write or propose code until I have agreed to the plan —
diagnosis is not approval.

### Step 2.5 — Scope discipline

If you spot a non-critical improvement outside the task's stated scope, do not fold it
into the current change. Note it as a follow-up and keep going. Keep changes reviewable
and scoped. Not every spotted issue requires immediate action.

### Step 3 — Implement

Implement the approved plan with minimal surface area. Preserve existing patterns,
avoid new dependencies, and flag any assumption that affects correctness.

Follow test-driven development:
1. Write the tests from Step 2 first; watch them fail (red).
2. Write enough code to make them pass (green). "Enough to pass" never means hacky —
   do it right the first time, not duct tape now and concrete later.
3. Strengthen tests as you consider edge cases and error handling.
4. Refactor if needed, keeping previously-green tests green.

Note: this repo has no test harness yet. When you introduce tests, set up the smallest
runner that fits the existing toolchain and confirm the script name with me before
relying on it; do not install or assume one silently.

### Step 4 — Verify

1. All tests pass.
2. Re-check correctness against the behavior map.
3. Identify edge cases or missing error handling.
4. Run or propose the project's existing validation scripts (typecheck, lint, build,
   tests). Prefer the scripts already defined — do not invent new ones.

### Step 5 — Document

Document accepted changes everywhere they belong — relevant `AGENTS.md` files and any
README. Editing those files requires permission (see `01-WORKSPACE-RULES.md`); propose
the wording first, edit after approval. Ship the docs with the code change, not as a
later follow-up.

## Build, test, and run

- Do not run tests, lint, or formatters by default — it costs tokens and a dev server
  is already running. Tell me to run them, or propose the command.
- Exception: tests you were asked to create. Under TDD you may run them yourself,
  scoped to only the files you created, using only scripts that already exist. Do not
  ask permission for what this paragraph already grants.
- Confirm the actual script name in the project before relying on it.
- Use repo-local commands only; never install packages or start servers.

## Style and pull requests

- Match the commit-message style in the repo's history; if unclear, use concise
  imperative messages (e.g. `Add profile sync endpoint`).
- A PR should explain intent, scope, and rationale, and link any relevant issue.
  Include screenshots for UI changes.
- Keep diffs minimal and continuity intact (see coding conventions in
  `01-WORKSPACE-RULES.md`): no incidental renames, path changes, or whole-file
  reformats.

## Before you edit

- Show the exact current lines you intend to change, as the file reads right now.
- State any assumption you are making, explicitly, before acting on it.
- Keep the change small enough to review in one pass.

## Adding directory-level AGENTS files

As a directory's structure firms up, add an `AGENTS.md` inside it describing what lives
there, the patterns in use, the gotchas, and what to be wary of. End each one with a
`READ-CHECK: unset` line, and add it to the file map in the root `AGENTS.md`. Keep
these files steady-state descriptions of the code — no ticket numbers, plan codes, or
references to in-flight work that will go stale.

READ-CHECK: unset
