// Battery harness: extracts includesAny + FAQ_INDEX + FAQ_STOP + faqAnswer +
// answerFor from the chat brain source and runs NEW + REGRESSION cases.
// Since 2026-10-29 the brain ships as ONE external file: pass the
// generated chat-brain.js as <edited>. (A page HTML with the legacy
// inline brain still works — extraction is text-based.)
// Usage: node harness.js <edited: chat-brain.js> <pristine.html>
// Exits 1 if the shared-file content checks or any case fails.
const fs = require('fs');

function extract(path) {
  const html = fs.readFileSync(path, 'utf8');
  const start = html.indexOf('function includesAny');
  const end = html.indexOf('\n      function validateSignupValue', start);
  if (start < 0 || end < 0) throw new Error('extraction failed for ' + path);
  const code = html.slice(start, end);
  const factory = new Function('contact', code + '\nreturn { answerFor: answerFor, FAQ_INDEX: FAQ_INDEX };');
  return factory('hello@ringandrespond.com');
}

const NEW_CASES = [
  // navigation
  ['where is the demo', '__GOTO_demo__'],
  ['where can i find the pricing', '__GOTO_pricing__'],
  ['take me to the demo', '__GOTO_demo__'],
  ['where is the champion page', 'open yet'],
  ['where do i find the faq', 'below the pricing'],
  ['where is the onboarding page', '__OPEN_onboard__'],
  ['where is the services section', '__GOTO_services__'],
  ['how do i navigate this site to pricing', '__GOTO_pricing__'],
  ['where are the reviews', 'no separate reviews section'],
  ['where can i find the contact email', 'footer'],
  // champion
  ['what is the champion rewards program', 'open yet'],
  ['how do i claim my champion gift card', 'open yet'],
  ['my champion code says already claimed', 'open yet'],
  ['i lost my champion card', 'hello@ringandrespond.com'],
  ['how does the qr code work', 'open yet'],
  ['who qualifies for champion rewards', 'open yet'],
  ['when do i get my champion gift card', 'open yet'],
  ['tell me about the champion program', 'open yet'],
  ['does the champion program include flowers', 'open yet'],
  // sales process
  ['how does buying work', 'privacy agreement'],
  ['what are the steps to buy', '30-day pilot'],
  ['what happens after i pay', 'earns her keep'],
  ['is there a walkthrough', 'walkthrough call with Yama'],
  ['what is the next step', '202-1085'],
  ['how do we get set up', 'journey'],
  ['after paying what happens', 'month comes back'],
  // promo / discount
  ['do you have a promo code', 'at checkout'],
  ['any discounts available', 'standard pricing is the price'],
  ['can i use a coupon', 'promo code'],
  ['is there a special offer', 'promo code'],
  // calculator
  ['how much for 3 locations', '777'],
  ['cost for two offices', '538'],
  ['price for 5 locations', '1255'],
  ['we have four offices, what is the monthly cost', '1016'],
  ['what does it cost for 10 practices', '2450'],
  ['how much for 2 locations', '538'],
  // callback
  ['can you call me', '__START_CALLBACK__'],
  ['have yama call me', '__START_CALLBACK__'],
  ['i want to request a call', '__START_CALLBACK__'],
  // chips verbatim
  ['Start my pilot', '__START_SIGNUP__'],
  ['What can Sunny do?', 'morning callback list'],
  ['How does buying work?', 'journey'],
  ['What does it cost?', '299'],
  ['Champion rewards', 'open yet'],
  ['Hear the demo', '202-1085'],
  ['Have Yama call me', '__START_CALLBACK__'],
  // sunny depth / texting honesty via FAQ
  ['does sunny send texts', 'coming soon'],
  ['can she handle two calls at once', 'simultaneous'],
  // wave-1 answer sharpening
  ['do you book into dentrix', 'No — Sunny doesn'],
  ['does sunny speak dari', 'Dari, covered under Persian'],
  ['how is sunny different from an answering service', 'morning callback list']
];

const REG_CASES = [
  ['how much does it cost', '299'],
  ['what is the price of the pilot', 'money-back guarantee'],
  ['do you work with dentrix', 'confirm'],
  ['does it integrate with eaglesoft', 'alongside'],
  ['is it hipaa compliant', 'BAA'],
  ['what about privacy', 'BAA'],
  ['can i get a refund', 'fully refundable'],
  ['is there a contract', 'No long contract'],
  ['does sunny send text messages', 'coming soon'],
  ['what happens in an emergency', '911'],
  ['does sunny speak spanish', 'Dari'],
  ['how many calls do offices miss', '38%'],
  ['i want to sign up', '__START_SIGNUP__'],
  ['can i hear a demo', '202-1085'],
  ['what happens when i miss a call', 'callback list'],
  ['how does the pilot work', 'capture report'],
  ['who is it for', 'dental offices'],
  ['how much is it monthly', '299'],
  ['we have two offices', '538'], // canonical: first location full price + additional at -20%
  ['do you replace my front desk staff', 'night shift'],
  ['can she book appointments directly into dentrix', 'captures'],
  ['what information does she collect', 'callback number'],
  ['is sunny available on weekends', 'weekends'],
  ['how long does setup take', 'white-glove'],
  ['do i keep my number', 'You keep your number'],
  ["what if she doesn't know the answer", 'honestly'],
  ['can sunny give medical advice', 'never diagnoses'],
  ['does she work with open dental', 'Open Dental'],
  ['will she send appointment reminders', 'Not yet'],
  ['tell me about google reviews', 'coming soon']
];

function run(engine, cases, label) {
  let pass = 0;
  const failures = [];
  for (const [q, expect] of cases) {
    const ans = engine.answerFor(q);
    if (ans && ans.indexOf(expect) !== -1) pass++;
    else failures.push({ q, expect, got: ans });
  }
  console.log(label + ': ' + pass + '/' + cases.length);
  return { pass, failures };
}

const editedPath = process.argv[2];
const pristinePath = process.argv[3];
const edited = extract(editedPath);
const pristine = extract(pristinePath);

// Shared-file content checks: the brain must carry the full KB and
// the rule blocks (signup/callback flows, navigation tokens).
const editedRaw = fs.readFileSync(editedPath, 'utf8');
const ruleMarkers = ['function answerFor', 'FAQ_STOP', 'function validateSignupValue',
  '__START_SIGNUP__', '__START_CALLBACK__', '__GOTO_', 'chat-callback'];
const missingMarkers = ruleMarkers.filter(m => editedRaw.indexOf(m) === -1);
const contentOk = edited.FAQ_INDEX.length === 183 && missingMarkers.length === 0;
console.log('CONTENT (edited): FAQ pairs ' + edited.FAQ_INDEX.length + '/183, rule blocks ' +
  (missingMarkers.length ? 'MISSING ' + missingMarkers.join(', ') : 'all present') +
  ' -> ' + (contentOk ? 'PASS' : 'FAIL'));

console.log('FAQ pairs: pristine ' + pristine.FAQ_INDEX.length + ' -> edited ' + edited.FAQ_INDEX.length);

const newRes = run(edited, NEW_CASES, 'NEW (edited)');
const regEdited = run(edited, REG_CASES, 'REGRESSION (edited)');
const regPristine = run(pristine, REG_CASES.filter(([q]) => q !== 'we have two offices'), 'REGRESSION (pristine, excl. spec-changed case)');

console.log('\n--- answer diffs on regression questions (pristine vs edited) ---');
for (const [q] of REG_CASES) {
  const a = pristine.answerFor(q);
  const b = edited.answerFor(q);
  if (a !== b) console.log('DIFF for "' + q + '":\n  pristine: ' + a + '\n  edited:   ' + b);
}

function dump(title, failures) {
  if (!failures.length) return;
  console.log('\n--- FAILURES: ' + title + ' ---');
  for (const f of failures) {
    console.log('Q: ' + f.q + '\n  expected substring: ' + f.expect + '\n  got: ' + f.got);
  }
}
dump('NEW', newRes.failures);
dump('REGRESSION edited', regEdited.failures);
dump('REGRESSION pristine', regPristine.failures);

// Gate on the edited brain only: content checks + NEW + REGRESSION.
// The pristine side is a historical snapshot printed for drift
// visibility; its diffs/failures document intentional KB updates.
if (!contentOk || newRes.failures.length || regEdited.failures.length) {
  process.exitCode = 1;
}
