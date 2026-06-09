# AGENTS.md

This file is the bootstrap for how we work together in this repository. It points to
the real operating rules in `AGENTS/`, and it carries the project reference (how this
codebase is built) so that knowledge lives in one canonical place. The operating
*rules* are not duplicated here — those live in `AGENTS/`.

## Bootstrap

At the start of every chat — or any time I greet you ("Good morning", "Hey Claude",
etc.) — re-read this entire `AGENTS.md` from disk, plus every file in the `AGENTS/`
folder. Read them with the read tool, not from memory or a prior summary.

## Critical file safety rules

### Never delete or overwrite a non-code file without explicit permission

- Always read an existing non-code file before changing it.
- Files like `CLAUDE.md`, `.env`, config files, and documentation may hold weeks of
  work and may not be version-controlled. Treat them as irreplaceable.
- Never delete anything that could legitimately be gitignored without express
  permission.
- When told to "add to" a non-code file, append with an edit — never replace the
  whole file.
- If you are unsure what a non-code file contains, ask first.

### Double-check when editing anything that is not code

This holds even when I have auto-accept on. Config files, docs, and data files can
carry accumulated work that a careless overwrite destroys. Confirm before you touch
them.

## Permissions

Read-only discipline:

- You always have permission to read `.md` files and to read folder structure and
  source files. Do not ask.
- Use the simplest direct command for inspection. Prefer single-purpose reads and
  searches over wrapped shell snippets, loops, or multi-step pipelines.
- A direct read/search is not "running a script." Composed shell logic is — avoid it
  unless the task truly requires it.

Ask first before:

- Editing any `.md` file, unless I clearly asked for that specific edit.
- Reading or editing any non-code file other than `.md`.
- Editing any file that is not version-controlled.
- Renaming a non-code doc, even when edits to it are already approved.

Never, without being explicitly asked:

- Install packages.
- Run a dev server (assume one is already running).
- Run tests, lint, or formatters by default (see `AGENTS/02-WORKFLOWS.md` for the
  one exception: tests you were asked to create under TDD).

## Non-negotiables

- When you state a fact about the code — what a file contains, what a function does,
  what type a field is — you must be able to point to the exact line that supports it.
  If you cannot cite it, do not say it. Re-read before asserting.
- Every file I ask you to read must be opened with the read tool. Prior context,
  system reminders, earlier tool results, and your own compacted memory do not count
  as a read.
- Compacted memory is good enough to continue a conversation. It is not good enough
  for documentation, PR descriptions, or any hard claim about the code. Re-read.

## Project layout

Verify the current structure from disk before assuming it — do not hardcode a folder
map that can go stale. The Project reference at the bottom of this file describes the
subsystems and their key files, but line numbers and exact paths drift; confirm against
the working tree before relying on them. As directories stabilize, add a directory-level
`AGENTS.md` that describes what lives there and the rules specific to it (see the
READ-CHECK convention in `AGENTS/00-README.md`).

## AGENTS file map

Every AGENTS file in the repo, so it never has to be rediscovered by hand. This is a
directory, not a reading list — the read-order and "bring only what the task needs"
rules in `AGENTS/00-README.md` still govern what you actually open.

- `CLAUDE.md` — bootstrap tripwire that redirects here
- `AGENTS.md` — this file (bootstrap, safety rules, permissions, project reference)
- `AGENTS/00-README.md` — collaboration guide and read order
- `AGENTS/01-WORKSPACE-RULES.md` — operating rules, engineering preferences,
  permissions, coding patterns, chat preferences
- `AGENTS/02-WORKFLOWS.md` — the productive loop, TDD doctrine, build/test/style/PR
  rules, before-edit process
- (add directory-level `AGENTS.md` files here as they are created)

## Quality gate

1. We prefer quality to speed.
2. When quality and speed are in tension, choose quality.
3. When tempted to defer something for speed, choose quality instead.

What quality looks like:

- DRY, legible, well-tested code, written in the smallest correct increments. No
  fluff.
- DRY, legible docs with plain naming. No ornamental symbols, no cryptic shorthand.
- Tests that start red and end green. When refactoring, you will see tests that were
  already green — keeping them green is part of the job.
- Reusing what already exists instead of reinventing it. Search before you build.
- Listening to the words I actually say, not paraphrasing them into your own framing.
  If I am wrong, explain why with evidence. If I am right, say why.
- Asking when something is genuinely open, rather than assuming.
- Backing every claim with a concrete reference to where it came from.

---

# Project reference

This is the canonical description of what the codebase is and how it works. Treat it as
a map, not as proof: when behavior matters, confirm against the executing-path code and
the working tree. Paths are stable; line numbers drift.

## Project overview

**Your Hidden Genius** is a monorepo containing a code redemption system for a book
assessment platform. Users redeem codes from physical/digital books or library copies
to access a personalized assessment at a unique URL generated through Google Sheets
automation.

Tech stack:

- Frontend: React 18 + TypeScript, Vite, Framer Motion, Google reCAPTCHA v2/v3
- Backend: Node.js + Express + TypeScript, Puppeteer for automation, Google Sheets API
- Database: Google Sheets (via Google Apps Script webhook)
- Deployment: Render.com (backend + frontend static hosting)

## Commands

Root-level (from the repo root):

- `npm run install-all-three` — install dependencies in root, frontend, and backend
- `npm run build` — build both frontend and backend
- `npm start` — start both servers concurrently (development)
- `npm run build:prod` — production build from scratch
- `npm run start:prod` — production start (backend serves frontend dist)

Backend (`cd backend`):

- `npm run dev` — development mode with hot reload
- `npm run build` — build TypeScript to `./build`
- `npm run clean` — clean build artifacts
- `npm start` — production start (installs Chrome for Puppeteer, then runs built code)

Frontend (`cd frontend`):

- `npm run dev` — Vite development server
- `npm run build` — build for production
- `npm run serve` — preview the production build

## Submission flow (critical path)

1. User enters code in the frontend form, which validates format via regex
   (physical/digital/ARC codes).
2. Frontend sends `POST /api/gas/:code` with email, bookType, purchasedOrBorrowed.
3. Backend checks the email cache (500 most recent entries from Google Sheets,
   refreshed every 24 hours).
4. If the email is unused: backend POSTs to the Google Apps Script webhook (`AS_LINK`);
   Apps Script checks code validity, assigns a unique assessment domain from the
   available pool, and returns the domain; backend caches the email and returns success.
5. If the email is used: returns the existing domain from cache.
6. Success: user receives a unique URL (e.g. `potential-123456.yourhiddengenius.com`).
7. Post-success automation: email added to a Squarespace queue (5-second delay), then
   Puppeteer submits the email to the Squarespace newsletter form.

## Key architectural patterns

Email caching system (`backend/gas.ts`):

- Map-based cache with a 500-entry limit (FIFO eviction).
- Preloaded on startup, refreshed every 24 hours.
- Special command emails trigger non-standard behavior: one triggers CSV export, one
  triggers a manual cache refresh (the exact addresses come from `EMAIL_PROCESSING` and
  `CACHE_REFRESH`).

Request queue (`backend/gas.ts`):

- FIFO queue with duplicate-request detection (`${email}-${code}` key).
- Single-threaded processing to prevent race conditions with Google Sheets.
- Delay between requests: 500ms (queue < 3) or 1000ms (queue >= 3).

Puppeteer automation (`backend/puppet.ts`):

- Headless Chrome with the stealth plugin to bypass bot detection.
- Submits emails to the Squarespace newsletter form post-signup.
- Chrome path is hardcoded for the Render.com deployment under
  `/opt/render/.cache/puppeteer/chrome/...`; it fails on other platforms without
  adjustment.
- Email is obfuscated in logs: `email.slice(0,5) + '*****' + domain`.

Code validation (`backend/gas.ts`):

- Regex patterns come from environment variables: `REGEX_PHYSICAL_COPY`,
  `REGEX_DIGITAL_COPY`, `REGEX_ADVANCE_READER_COPY`.
- Library borrows use a special code supplied via configuration (hardcoded on the
  frontend as `VITE_LIBRARY_CODE`, not regex-validated on the backend).

Google Sheets integration:

- Service account authentication via a JSON keyfile
  (`GOOGLE_APPLICATION_CREDENTIALS`).
- The spreadsheet ID comes from `SPREADSHEET_ID`.
- Cache refresh reads the "Master" sheet, sorts by the date column (index 7), and takes
  the 500 most recent rows.

Security:

- Rate limiting: 1000 requests / 15 minutes per IP.
- CORS whitelist for authorized origins only (see `backend/app.ts`).
- Helmet.js with CSP disabled (needed for reCAPTCHA).
- API-key verification for Google Apps Script calls (`API_KEY`).

## Critical environment variables

Backend (validated on startup; the process exits if any are missing):

- `GOOGLE_APPLICATION_CREDENTIALS` — path to the service-account JSON for the Sheets API
- `SPREADSHEET_ID` — Google Sheets ID for the email cache
- `AS_LINK` — Google Apps Script webhook URL
- `API_KEY` — shared secret for Apps Script authentication
- `EMAIL_PROCESSING`, `CACHE_REFRESH` — special command emails
- `REGEX_PHYSICAL_COPY`, `REGEX_DIGITAL_COPY`, `REGEX_ADVANCE_READER_COPY` — code
  validation patterns

Frontend (Vite env vars):

- `VITE_API_ENV` — `"development"` or `"production"` (determines the API base URL)
- `VITE_V2_SITE_KEY`, `VITE_V3_SITE_KEY` — reCAPTCHA public keys
- `VITE_LIBRARY_CODE` — hardcoded library code
- `VITE_CODE_WORD` — expected "last word of Chapter One" answer for digital purchases

Never commit real values for any of these. Use placeholders in docs and examples and
reference the `.env` file.

## File structure notes

Backend entry points:

- `index.ts` -> `app.ts` (Express setup) -> routes: `/api/gas/*` (`gas.ts`),
  `/api/recaptcha/*` (`recaptcha.ts`).
- Static frontend served from `../../frontend/dist` in production.

Frontend state management:

- `BookContext.tsx` — global state via React Context (email, code, bookType,
  currentContent, etc.).
- `AppJDB.tsx` — main component; handles the submission flow and content transitions.
- `content/contentMap.tsx` — maps content states to form components (e.g. "enterEmail"
  renders the email form).

Custom response system:

- `sendStatuses.ts` — centralized response objects (success/error messages, status
  codes). All API responses use the `SendStatus` interface for consistency.

Frontend content flow states:

```
physicalOrDigital -> purchasedOrBorrowed -> [enterPhysicalCode | enterDigitalCode | enterARCCode] -> enterEmail -> success/error
                  \-> checkEmailAddress (forgot link)
```

## Google Apps Script integration

The backend communicates with a Google Apps Script (GAS) web app via HTTP POST to
`AS_LINK`. The GAS manages code inventory (physical/digital/ARC codes with usage
limits), domain assignment (a pool of subdomains), Master-sheet updates (appends new
redemptions with a timestamp), and returns
`{ success: boolean, message: string, domain?: string, code?: number }`.

Request payload to GAS (values are placeholders; real secrets live in `.env`):

```json
{
  "email": "user@example.com",
  "code": "12345",
  "apiKey": "API_KEY",
  "bookType": "physicalCopy",
  "purchasedOrBorrowed": "purchased",
  "libraryState": "California",
  "libraryName": "SF Public Library"
}
```

GAS error messages are mapped to frontend responses in `gas.ts` (the `errorMessageMap`
inside `handleRequest`):

- "Maximum number of codes reached."
- "Code already used"
- "Email already used"
- "Code not found"
- "No available domains"
- "This code has reached its usage limit."
- "Cannot use a library book code as a purchased book"
- "Cannot convert a purchased book to a library book after it has been used."

## Testing considerations

- There is currently no automated test suite or test harness in this repo. The TDD
  doctrine in `AGENTS/02-WORKFLOWS.md` is the standard to follow as tests are added.
- Special emails trigger non-standard behavior (CSV export, cache refresh).
- Library code validation: the frontend hardcodes the library code; the backend does
  not regex-validate it.
- Race conditions: the queue system prevents concurrent Google Sheets writes.
- Cache staleness: the email cache refreshes every 24 hours; a manual refresh is
  available via the special command email.
- Puppeteer failures are logged but do not block the user flow (the Squarespace
  submission is async).

## Common pitfalls

1. Puppeteer Chrome path is hardcoded for Render and fails on other platforms without
   adjustment.
2. CORS whitelist handling of trailing-slash variants is inconsistent — check
   `backend/app.ts`.
3. reCAPTCHA: v3 executes automatically, v2 requires user interaction; both are
   verified on the backend via `/api/recaptcha`.
4. Log redaction: logs obfuscate email and API key — be careful to preserve that when
   adding new logging.
5. Library input validation: `isValidInput` allows only `[A-Za-z' -]+`, so it rejects
   numbers and special characters.
6. Frontend/backend book-type mismatch: `physicalCopy` / `digitalCopy` /
   `advanceReaderCopy` strings must match exactly across both sides.
7. Duplicated validation: `isValidInput` exists in both `backend/gas.ts` and
   `frontend/src/hooks/inputValiditiy.ts`, and the frontend's `isValidCode` regex does
   not match the backend's env-driven patterns. Keep them in sync when either changes,
   and prefer consolidating per the duplicate-method rule in
   `AGENTS/01-WORKSPACE-RULES.md`.
