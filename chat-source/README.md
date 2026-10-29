# Chat source — single point of truth for the Sunny site chat

The chat that ships on every public page is generated from the
fragments in this folder. Since 2026-10-29 the brain ships as ONE
external, cacheable file; each page carries only the launcher/panel
markup, the styles, and a small shell that fetches the brain on
first wake (visitor intent, or the post-load idle wake):

- `chat-panel.frag` — the launcher button + chat panel HTML (inline in every page)
- `chat-script.frag` — the shell `<script>` block (inline in every page):
  wake triggers, first-action queueing, and the loader for the brain
  file. Its `/chat-brain.js?v=…` is stamped by the sync with the
  brain's content hash — never edit the stamp by hand.
- `chat-brain.frag` — the brain itself (183-pair knowledge base,
  answer engine, signup and callback flows). The sync generates
  `/chat-brain.js` at the repo root from this fragment.
- `chat-style.frag` — the standalone chat `<style>` block used by the
  17 template pages (index.html keeps its chat styles in its own
  stylesheets and is not style-synced)

## To change the chat

1. Edit the fragment(s) here.
2. Run `python3 chat-source/sync-chat.py` from the repo root — it
   regenerates `chat-brain.js`, stamps its content hash into the
   shell, and splices the fragments into every page that carries
   the chat.
3. Run the chat tests (`chat-test/harness.js` against
   `chat-brain.js`, `chat-test/smoke.js` against a synced page).
4. Commit the fragments **and** the generated `chat-brain.js` and
   pages in one commit.

`python3 chat-source/sync-chat.py --check` verifies the brain file
and every page match the source without writing (exit 1 on drift);
it also fails if any page still carries an inline knowledge base.
Never edit the chat block inside a page, or `chat-brain.js`,
directly: the next sync overwrites them and the check flags it.

Why an external file (changed 2026-10-29): the inline generation
put ~94 KB of chat code inside all 18 HTML documents — downloaded
and parsed on every page view, uncacheable. As one shared file the
brain downloads once, is cached across pages (30-day Cache-Control
in `vercel.json`, content-hash `?v=` for instant invalidation on
edits), and only loads when the chat is actually woken. The
verification that used to extract the chat from served pages was
rewired the same day: the harness reads `chat-brain.js` directly,
the smoke test loads the shell from a page and simulates the brain
fetch, and the daily site audit fetches the shared file and checks
that pages reference it and carry no inline knowledge base. (The
2026-10-27 inline rationale is in the Fix #11 note in
`~/workspace/site-rating-20261027/RE-RATING.md` history.)
