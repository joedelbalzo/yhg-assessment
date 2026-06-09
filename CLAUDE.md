# CLAUDE.md

Read `AGENTS.md` now — from disk, not from memory or cache — and follow it.

This file exists only as a bootstrap tripwire. Some agents reliably read `CLAUDE.md`
but skip `AGENTS.md`; this redirect guarantees the AGENTS system loads regardless of
which file the tool reaches for first.

Keep this file thin. The real operating rules and the project reference live in
`AGENTS.md` and the `AGENTS/` folder — do not copy them here, or the two will drift and
you will not know which is canonical. This file is tracked in git so every clone gets
the redirect; do not delete it, or an agent that only reads `CLAUDE.md` starts a session
with no rules at all.
