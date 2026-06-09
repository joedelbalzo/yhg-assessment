READ-CHECK: unset

This AGENTS system is our collaboration guide. It should be strict enough to protect
quality and clear enough to support a real working partnership.

Quality rule:
- The point of this system is to improve quality, not to speed up action.
- If speed and quality are in tension, choose quality.
- Read `01-WORKSPACE-RULES.md` before making structural or direction-setting choices.
- Verify the current state on disk before creating, renaming, or assuming files and
  folders.

File roles:
- `01-WORKSPACE-RULES.md` — quality-first operating rules, who I am optimizing for,
  engineering preferences, permissions, evidence and behavior-map discipline, coding
  patterns, and chat preferences.
- `02-WORKFLOWS.md` — the Understand -> Plan -> Implement -> Verify -> Document loop,
  test-driven development doctrine, build/test/style/PR rules, and the before-edit
  process.

The project reference (what this codebase is and how it works) lives in the root
`AGENTS.md`, not here. These files hold the operating rules.

Reading order:
1. Finish this file, then update the read-check on line 1.
2. Read `01-WORKSPACE-RULES.md`.
3. Read `02-WORKFLOWS.md`.
4. If the task is inside a directory that has its own `AGENTS.md`, read it and bring
   it into context.
5. Read anything else only when the task actually needs it. Bring only what is needed.

Read-check convention:
- Line 1 of this file is reserved for read-check state only. After a full disk read of
  the AGENTS system, replace it with the date and a short note, e.g.
  `READ-CHECK: 2026-06-08 | Full AGENTS system disk read complete`.
- Every directory-level `AGENTS.md` ends with its own `READ-CHECK: unset` line; update
  it once you have read that file from disk. The read-check is how we know an agent
  actually loaded the rules rather than guessing from memory.
- If the read-check is older than your current session, or the file changed after it
  was recorded, re-read from disk before relying on the system.
