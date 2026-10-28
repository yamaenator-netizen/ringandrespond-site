#!/usr/bin/env python3
"""Sync the Sunny site chat from ONE source into every page.

The chat (panel HTML + script with the 183-pair knowledge base + the
template pages' chat stylesheet) used to be hand-copied into 18 HTML
files, so every knowledge-base edit meant an 18-file sweep. Edit the
fragments in this folder instead, then run:

    python3 chat-source/sync-chat.py          # write fragments into pages
    python3 chat-source/sync-chat.py --check  # verify pages match source

Commit the fragments and the regenerated pages together. Never edit
the chat block inside a page directly — the next sync would overwrite
it, and --check would flag the drift.

Coverage:
- chat-panel.frag  -> every page with the chat launcher (18 pages)
- chat-script.frag -> every page with the chat script (18 pages)
- chat-style.frag  -> the 17 template pages that carry the standalone
                      "Sunny site chat" <style> block. index.html keeps
                      its chat styles inside its own stylesheets (its
                      CSS is organised differently) and is skipped for
                      the style segment only.
Pages with no chat (champion holding page, onboard, thank-you, the
Google verification file) are left untouched.
"""
import glob
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "chat-source")


def load(name):
    with open(os.path.join(SRC, name), encoding="utf8") as f:
        return f.read()


STYLE_FRAG = load("chat-style.frag")
PANEL_FRAG = load("chat-panel.frag")
SCRIPT_FRAG = load("chat-script.frag")


def blocks(html, tag):
    out = []
    for m in re.finditer(r"<%s(?:\s[^>]*)?>" % tag, html):
        end = html.index("</%s>" % tag, m.start())
        out.append((m.start(), end + len(tag) + 3))
    return out


def swap_block(html, tag, marker, frag, page, label, required):
    hits = [(s, e) for (s, e) in blocks(html, tag) if marker in html[s:e]]
    if not hits:
        if required:
            raise SystemExit("ERROR %s: expected %s block not found" % (page, label))
        return html, False
    if len(hits) > 1:
        raise SystemExit("ERROR %s: %d %s blocks found, expected 1" % (page, len(hits), label))
    s, e = hits[0]
    return html[:s] + frag + html[e:], html[s:e] != frag


def swap_panel(html, page):
    a = html.find('<button class="chat-launcher"')
    if a < 0:
        return html, False, False
    if html.find('<button class="chat-launcher"', a + 1) >= 0:
        raise SystemExit("ERROR %s: more than one chat launcher" % page)
    b = html.find("</section>", a)
    if b < 0:
        raise SystemExit("ERROR %s: chat panel </section> not found" % page)
    b += len("</section>")
    return html[:a] + PANEL_FRAG + html[b:], html[a:b] != PANEL_FRAG, True


def synced(html, page):
    changed = []
    html, ch = swap_block(html, "style", "Sunny site chat", STYLE_FRAG, page, "chat style", required=False)
    if ch:
        changed.append("style")
    html, ch, has_panel = swap_panel(html, page)
    if ch:
        changed.append("panel")
    if has_panel:
        html, ch = swap_block(html, "script", "function answerFor", SCRIPT_FRAG, page, "chat script", required=True)
        if ch:
            changed.append("script")
    return html, changed, has_panel


def segment_hash(html, tag, marker):
    for (s, e) in blocks(html, tag):
        if marker in html[s:e]:
            return hashlib.md5(html[s:e].encode()).hexdigest()[:8]
    return None


def main():
    check_only = "--check" in sys.argv
    pages = sorted(glob.glob(os.path.join(ROOT, "*.html")))
    drift = 0
    chat_pages = 0
    for path in pages:
        page = os.path.basename(path)
        with open(path, encoding="utf8") as f:
            html = f.read()
        new_html, changed, has_panel = synced(html, page)
        if not has_panel:
            print("%-45s no chat — untouched" % page)
            continue
        chat_pages += 1
        pairs = segment_hash(new_html, "script", "function answerFor")
        markers = new_html.count('", "')
        if changed:
            drift += 1
            print("%-45s %s (script %s)" % (page, "WOULD CHANGE: " + ",".join(changed) if check_only else "synced: " + ",".join(changed), pairs))
            if not check_only:
                with open(path, "w", encoding="utf8") as f:
                    f.write(new_html)
        else:
            print("%-45s already in sync (script %s)" % (page, pairs))
    print("---")
    print("chat pages: %d | pages %s sync: %d" % (chat_pages, "out of" if check_only else "changed by", drift))
    if check_only and drift:
        sys.exit(1)


if __name__ == "__main__":
    main()
