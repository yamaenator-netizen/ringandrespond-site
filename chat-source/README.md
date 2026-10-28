# Chat source — single point of truth for the Sunny site chat

The chat that ships on every public page (launcher + panel, the script
with the 183-pair knowledge base, signup and callback flows, and the
template pages' chat stylesheet) is generated from the fragments in
this folder:

- `chat-panel.frag` — the launcher button + chat panel HTML
- `chat-script.frag` — the full chat `<script>` block (knowledge base lives here)
- `chat-style.frag` — the standalone chat `<style>` block used by the
  17 template pages (index.html keeps its chat styles in its own
  stylesheets and is not style-synced)

## To change the chat

1. Edit the fragment(s) here.
2. Run `python3 chat-source/sync-chat.py` from the repo root — it
   splices the fragments into every page that carries the chat.
3. Run the chat tests (`chat-test/harness.js`, `chat-test/smoke.js`)
   against the regenerated pages.
4. Commit the fragments **and** the regenerated pages in one commit.

`python3 chat-source/sync-chat.py --check` verifies every page matches
the source without writing (exit 1 on drift). Never edit the chat
block inside a page directly: the next sync overwrites it and the
check flags it.

Why generated inline instead of an external JS file: the chat is
verified by extracting it from the served pages (test harness, daily
site audit), and generation keeps the served bytes identical while
making the knowledge base a one-file edit. See the Fix #11 note in
`~/workspace/site-rating-20261027/RE-RATING.md` history (2026-10-27).
