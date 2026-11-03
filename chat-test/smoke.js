// Smoke test: run the real chat from the edited page under DOM stubs
// and drive the callback flow end to end. Since 2026-10-29 the page
// carries only the shell; the brain ships as /chat-brain.js. The stub
// simulates the shell's fetch: when the shell appends its <script>,
// the real generated chat-brain.js (next to the page) is evaluated
// and onload fires — the same sequence a browser runs.
// Usage: node smoke.js <edited.html>
const fs = require('fs');
const path = require('path');

const pagePath = process.argv[2];
const html = fs.readFileSync(pagePath, 'utf8');
let a = -1;
for (const m of html.matchAll(/<script>/g)) {
  const end = html.indexOf('</script>', m.index);
  if (html.slice(m.index, end).includes('sunny-chat-shell')) { a = m.index; break; }
}
if (a < 0) throw new Error('chat shell script block not found');
const b = html.indexOf('</script>', a);
const src = html.slice(a + 8, b);
const brainSrc = fs.readFileSync(path.join(path.dirname(path.resolve(pagePath)), 'chat-brain.js'), 'utf8');

function makeEl(id) {
  return {
    id: id, hidden: false, value: '', placeholder: '', textContent: '',
    className: '', children: [], style: {}, scrollTop: 0, scrollHeight: 0,
    setAttribute: function () {}, getAttribute: function () { return null; },
    addEventListener: function (ev, fn) { (this.handlers = this.handlers || {})[ev] = fn; },
    querySelector: function () { return makeEl('span'); },
    appendChild: function (c) { this.children.push(c); return c; },
    insertBefore: function (c) { this.children.push(c); return c; },
    focus: function () {}, closest: function () { return null; },
    matches: function () { return false; }
  };
}

const els = {};
['chatLauncher', 'chatPanel', 'chatClose', 'chatForm', 'chatInput', 'chatLog', 'starterChips']
  .forEach(function (id) { els[id] = makeEl(id); });

const fetchCalls = [];
global.document = {
  getElementById: function (id) { return els[id] || null; },
  createElement: function () { return makeEl('div'); },
  querySelectorAll: function () { return []; },
  addEventListener: function () {},
  // Simulated brain fetch: the shell appends <script src="/chat-brain.js?v=…">;
  // evaluate the real file and fire onload, like a browser would.
  head: {
    appendChild: function (el) {
      if (el && el.src && el.src.indexOf('chat-brain.js') !== -1) {
        eval(brainSrc);
        if (el.onload) el.onload();
      }
      return el;
    }
  },
  documentElement: { appendChild: function (el) { return el; } }
};
global.window = { open: function () {}, addEventListener: function () {} };
global.localStorage = {
  getItem: function () { return null; },
  setItem: function () {}, removeItem: function () {}
};
global.fetch = function (url, opts) {
  fetchCalls.push({ url: url, body: JSON.parse(opts.body) });
  return Promise.resolve({ ok: true });
};

eval(src);

const form = els.chatForm, input = els.chatInput, log = els.chatLog;
function say(text) {
  input.value = text;
  form.handlers.submit({ preventDefault: function () {} });
}
function lastMsgs(n) {
  return log.children.slice(-n).map(function (c) { return c.textContent; });
}

(async function () {
  say('Have Yama call me');
  console.log('after trigger:', JSON.stringify(lastMsgs(2)));
  say('Jane Doe');
  console.log('after name:   ', JSON.stringify(lastMsgs(1)));
  say('123');
  console.log('after bad ph: ', JSON.stringify(lastMsgs(1)));
  say('619-555-1234');
  console.log('after phone:  ', JSON.stringify(lastMsgs(1)));
  say('tomorrow morning');
  await new Promise(function (r) { setTimeout(r, 50); });
  console.log('after time:   ', JSON.stringify(lastMsgs(1)));
  console.log('fetch calls:  ', JSON.stringify(fetchCalls));
  const ok = fetchCalls.length === 1 &&
    fetchCalls[0].url === '/api/chat-callback' &&
    fetchCalls[0].body.name === 'Jane Doe' &&
    fetchCalls[0].body.phone === '619-555-1234' &&
    fetchCalls[0].body.time === 'tomorrow morning';
  console.log(ok ? 'SMOKE PASS' : 'SMOKE FAIL');
  process.exit(ok ? 0 : 1);
})().catch(function (e) { console.error('SMOKE ERROR', e); process.exit(1); });
