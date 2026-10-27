# Working rules for this project

Adapted 2026-10-21 from the Karpathy coding guidelines (MIT, github.com/multica-ai/andrej-karpathy-skills), merged with this project's own rules. These bias toward caution over speed; for trivial fixes, use judgment.

## 1. Think before coding
- State assumptions explicitly. If uncertain, ask rather than guess.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop, name what's confusing, and ask.

## 2. Simplicity first
- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked, no abstractions for single-use code, no unrequested configurability, no error handling for impossible scenarios.
- If you wrote 200 lines and it could be 50, rewrite it.

## 3. Surgical changes
- Touch only what you must. Clean up only your own mess.
- Don't improve adjacent code, comments, or formatting. Don't refactor what isn't broken. Match the existing style.
- Notice unrelated dead code? Mention it — don't delete it. Remove only the orphans your own changes created.
- The test: every changed line traces directly to the request.

## 4. Goal-driven execution
- Define success criteria up front, then loop until verified (a failing test first, then make it pass).
- For multi-step work, state a brief plan with a verify step per item.
- Not verified = not done. Say plainly what was checked and what wasn't.

## This project (ringandrespond-site)
- index.html is ~6 MB with embedded base64 media. NEVER edit it in GitHub's /edit/ web editor and never use a "type" automation action on it — edit locally, verify with `git diff` (only the intended lines), then commit via GitHub "Add file → Upload files" and re-sync the clone with `git fetch` + `git reset --hard origin/main`.
- Never touch google55bda6d299a6af98.html (Search Console verification).
- No vendor logos anywhere (trademark rules). Plain-text names only, with the non-affiliation disclaimer where PMS vendors are named.
- Honesty in copy: Sunny captures appointment *requests*; the office confirms. Never promise direct PMS booking/integration. Never claim "HIPAA compliant" — BAA-process language only.
- Prices are decided, don't improvise them: $0 setup (done-for-you); paid 30-day pilot — first month up front, unconditional money-back guarantee; then $199/mo (After-Hours Capture) or $299/mo (24/7 Complete) per location, extra locations −20% ($159/$239), annual prepay = 2 months free ($1,990/$2,990), month-to-month, no exit fee.
