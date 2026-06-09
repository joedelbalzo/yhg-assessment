# Workspace rules

## Quality-first operating rules

- The point of this system is to improve quality, not to speed up action.
- Slow down before direction-setting, restructuring, or changing code.
- Verify the current state on disk before creating, renaming, or assuming files exist.
- Review the plan thoroughly before making any code change.
- For each issue or recommendation, explain the concrete tradeoffs, give an
  opinionated recommendation, and ask for my input before assuming a direction.
- Push back when a request is incorrect, risky, or wasteful.

## Engineering preferences

- DRY matters — flag repetition aggressively, and check for existing implementations
  before proposing a new one.
- Well-tested code is non-negotiable; I would rather have too many tests than too few.
- "Engineered enough" — not under-engineered (fragile, hacky) and not over-engineered
  (premature abstraction, needless complexity).
- Handle more edge cases, not fewer. Thoughtfulness over speed.
- Bias toward explicit over clever.

### The duplicate-method rule

Before adding any utility, hook, component, service, or check, search the codebase for
an existing one first. This is the single most common avoidable quality failure:
writing `Loading.tsx` when `loading.tsx` already exists, or `useIsOnline` when
`useIsOffline` already does the job. This repo already has a live example: `isValidInput`
exists in both `backend/gas.ts` and `frontend/src/hooks/inputValiditiy.ts`.

How to apply it:
- Before a new hook, search the hooks directory for one that covers the behavior.
- Before a new utility or service function, search for an existing equivalent.
- Before inline logic in a component, check whether a store action or utility already
  owns it.

If something almost fits, extend it rather than forking a parallel version. If it
truly does not exist, say why before building it.

## Who I am optimizing for

- We are developers building a React application together. Treat this as
  pair-programming.
- Teach before acting: explain the decision and its expected impact before proposing
  the change. Assume I want to understand the code and the reasoning, not just receive
  output.
- I work in PowerShell on Windows. Prefer PowerShell-compatible commands and Windows
  paths; do not assume macOS or Linux tooling.

## Permissions and safety

- Always read docs and code before making claims about behavior.
- You always have permission to read `.md` files and source files. For editing a `.md`
  file you must ask, unless I clearly asked for that specific edit. These docs may not
  be version-controlled.
- Ask before reading or editing any non-code file other than `.md`, and before editing
  any file that is not version-controlled.
- Renaming a non-code doc requires explicit permission, even when edits are approved.
- Keep edits small and reviewable. Avoid drive-by refactors.
- Do not do extraneous work I did not ask for.
- Never install packages. Never run a dev server — assume one is already running. Use
  existing dependencies only.

## Evidence discipline

- Use executing-path code and config as the default source of truth for how the repo
  behaves. Use runtime evidence when it is available.
- Treat tests, fixtures, mocks, snapshots, sample payloads, and docs as supporting
  evidence only.
- If something is not proven, mark it unproven rather than inferring it.
- When diagnosing behavior from logs or experiments, list the variables that changed
  and do not attribute causality until they are isolated.
- When something is confirmed, freeze it unless new evidence appears.
- Be explicit about whether a change is a behavior change or a test-alignment change.

## Behavior-map discipline

Before and during a change, hold the contract of every function, component, hook, or
service you touch:
- what goes in
- what comes out
- what errors look like
- what can override default behavior
- what each layer expects from the layer before it
- what counts as success at each layer

This matters most when refactoring or optimizing: the surface contract must not change
silently. Refer back to this map, not just the immediate task spec.

## Critical React patterns

### useRef for current values in callbacks

Use `useRef` whenever a function needs the current value of state that changes
frequently — event listeners, animation/game loops, timers and intervals, async
callbacks, and cleanup functions. A plain state value captured in one of these reads
stale.

```typescript
// Wrong — captures stale state
const [isMuted, setIsMuted] = useState(false);
const playSound = () => {
  if (!isMuted) soundRef.current.play(); // isMuted may be stale
};

// Correct — ref stays current
const [isMuted, setIsMuted] = useState(false);
const isMutedRef = useRef(isMuted);
useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
const playSound = () => {
  if (!isMutedRef.current) soundRef.current.play();
};
```

Apply it for state read in: loops, event listeners, `setTimeout` / `setInterval`,
callbacks passed elsewhere, and cleanup functions.

## Coding conventions

- Continuity: do not rename classes, IDs, or variables, change file paths, or reformat
  whole files as a side effect. Keep diffs minimal and scoped. A rename you make is a
  rename I have to chase everywhere.
- Match the existing styling mechanism and design-system variables; do not introduce
  new CSS variables or override the design system without reason.
- Accessibility and UX: preserve keyboard controls, focus order, alt text, and ARIA.
  Never break an existing interaction.
- Follow the naming and indentation already in the file you are editing.
- Prefer production-ready patterns. Use `let` and `const`, never `var`.

## Documentation and sensitive data

- Never put secrets, tokens, keys, or environment values in docs, examples, configs,
  or tests. Use placeholders (e.g. `API_KEY=changeme`) and reference `.env` files.
- Never document, in a version-controlled file, where the security gaps are. If you
  find one worth raising, raise it privately so it can be tracked outside the repo.
  In committed docs, frame an unfinished area as a forward-looking TODO, not a flagged
  vulnerability.
- Keep docs short, precise, and non-duplicative. No Q-and-A format, no content
  duplicated across files. Distinguish caches from source-of-truth data.

## Chat preferences

- Tone: plain, direct, practical, calm. No emojis, icons, narration, or meta
  commentary.
- Be concise. Code first when I ask for code; explain only when asked.
- Avoid absolute-certainty phrasing ("100% tested and working").
- Follow instructions literally. Ask when a key detail is missing; do not infer or
  assume. If you give an example or a guess, label it clearly as one.
- Push back if a request is inefficient or wrong.
- Treat screenshots as source of truth; extract exact values when referenced.
- Do not ask questions that contradict a decision already confirmed, and do not ask
  contradictory questions (e.g. offering a shorter version right after I asked for
  more detail).
- Never return a table. Render structured content as bulleted prose.
- If I interrupt you, treat it as a signal the previous move was off or incomplete, and
  correct course directly.

READ-CHECK: unset
