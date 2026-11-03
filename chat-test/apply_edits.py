#!/usr/bin/env python3
"""Surgical edits to index.html chat assistant. Idempotent-safe: asserts every
anchor occurs exactly once in the PRISTINE file before replacing.
Writes index.html and chat-test/index-edited.html (identical)."""
import io, sys

ROOT = '/home/hatch/workspace/ringandrespond-site/'
src = io.open(ROOT + 'index.html', encoding='utf-8').read()
html = src

def rep(old, new, label):
    global html
    n = html.count(old)
    assert n == 1, f'{label}: anchor count {n} != 1'
    html = html.replace(old, new)
    print('ok:', label)

# ---------- 1. Greeting ----------
g_old = 'Hi! I\u2019m an automated assistant. I can answer questions about the pilot \u2014 cost, setup, your software, privacy \u2014 or guide you through signup right here.'
g_new = 'Hi! I\u2019m an automated assistant. Ask me about Sunny, what the pilot costs, how buying works, finding your way around the site, or Champion Rewards \u2014 or I can guide you through signup right here.'
rep(g_old, g_new, 'greeting')

# ---------- 2. Chips ----------
start = html.find('<div class="starter-chips"')
assert start != -1
end = html.find('</div>', start) + len('</div>')
old_chips = html[start:end]
assert 'Do you work with Dentrix?' in old_chips and 'data-start-signup' in old_chips
new_chips = (
    '<div class="starter-chips" id="starterChips" aria-label="Suggested questions">\n'
    '        <button class="starter-chip" type="button" data-start-signup>Start my pilot</button>\n'
    '        <button class="starter-chip" type="button">What can Sunny do?</button>\n'
    '        <button class="starter-chip" type="button">How does buying work?</button>\n'
    '        <button class="starter-chip" type="button">What does it cost?</button>\n'
    '        <button class="starter-chip" type="button">Champion rewards</button>\n'
    '        <button class="starter-chip" type="button">Hear the demo</button>\n'
    '        <button class="starter-chip" type="button">Have Yama call me</button>\n'
    '      </div>'
)
html = html[:start] + new_chips + html[end:]
print('ok: chips')

# ---------- 3. Callback state + fields (after signup var) ----------
anchor = "      var signup = { active: false, step: 0, values: {} };"
add = anchor + """
      var callback = { active: false, step: 0, values: {} };
      var callbackFields = [
        { key: 'name', label: 'Name', prompt: 'Of course \\u2014 what is your name?' },
        { key: 'phone', label: 'Phone', prompt: 'What is the best number for Yama to call?', type: 'phone' },
        { key: 'time', label: 'Best time', prompt: 'When is a good time \\u2014 morning, afternoon, or a specific time?' }
      ];"""
rep(anchor, add, 'callback state')

# ---------- 4. answerFor early block (after signup rule) ----------
anchor = "        if (includesAny(q, ['sign up', 'signup', 'start my pilot', 'get started', 'checkout', 'enroll'])) return '__START_SIGNUP__';"
early = anchor + r"""
        if (includesAny(q, ['call me', 'call back', 'callback', 'give me a call', 'have yama call', 'request a call', 'phone call with', 'yama call me']) && !includesAny(q, ['callback list', 'call back patients', 'call patients back', 'does sunny call', 'will sunny call', 'sunny call back'])) return '__START_CALLBACK__';
        if (includesAny(q, ['where is', 'where are', 'where can i', 'where do i', 'find the', 'find your', 'take me to', 'go to the', 'navigate', 'navigation', 'menu', 'jump to', 'scroll to'])) {
          if (includesAny(q, ['champion'])) return '__OPEN_champion__';
          if (includesAny(q, ['onboard'])) return '__OPEN_onboard__';
          if (includesAny(q, ['demo', 'hear sunny', 'listen'])) return '__GOTO_demo__';
          if (includesAny(q, ['pricing', 'price', 'cost', 'plans'])) return '__GOTO_pricing__';
          if (includesAny(q, ['services', 'features', 'what sunny does', 'what she does'])) return '__GOTO_services__';
          if (includesAny(q, ['faq', 'frequently asked', 'questions'])) return 'The FAQ is on this page, just below the pricing section — look for “Before you hand over the phone.” Or skip the scrolling: ask me the question right here and I’ll answer it.';
          if (includesAny(q, ['review', 'testimonial'])) return 'There’s no separate reviews section on this page yet — the honest shortcut is the demo: call (619) 202-1085 and hear exactly what your patients will hear.';
          if (includesAny(q, ['contact', 'email', 'get in touch', 'reach you'])) return 'You’ll find ' + contact + ' in the footer of the page — or stay right here: ask a question, start your pilot, or type “call me” and Yama will call you.';
        }
        if (includesAny(q, ['already claimed', 'code not working', 'code doesn t work', 'code wont work', 'lost my card', 'lost the card', 'lost my champion', 'lost my invitation', 'card is lost', 'invalid code', 'code says already'])) {
          return 'If the claim page says your code has already been claimed, it has already been used — each Champion invitation code works exactly once. If that wasn’t you, or you’ve lost your card, email ' + contact + ' and we’ll sort it out.';
        }
        if (includesAny(q, ['claim', 'scan the', 'scan it', 'invitation card', 'invitation code', 'redeem'])) {
          return 'To claim your Champion invitation: scan the QR code on your invitation card — it opens ringandrespond.com/champion with your code filled in. Add your name, practice, role, and the best contact for your gift card, then submit. Each code works exactly once, and our team follows up with you directly.';
        }
        if (includesAny(q, ['champion', 'gift card', 'giftcard', 'reward', 'rewards', 'award', 'awards', 'qr'])) {
          return 'Champion Rewards thanks the front-desk person or office manager who champions Sunny inside their practice: a $50 gift card twice a year, plus a gift to the office — flowers, for example — each cycle. The first cycle starts after your office’s pilot converts and the first monthly payment clears, and your practice owner agrees to the program in the pilot agreement. It’s by invitation — champions receive a card with a QR code to claim.';
        }
        if (includesAny(q, ['how does buying work', 'buying process', 'sales process', 'purchase process', 'signup process', 'what are the steps', 'step by step', 'steps to', 'after i pay', 'after paying', 'walkthrough', 'next step', 'next steps', 'how do we start', 'how do i start', 'get set up', 'how do we get started'])) {
          return 'Here’s the whole journey: 1) Call (619) 202-1085 and hear Sunny live. 2) A short walkthrough call with Yama to fit her to your office. 3) Sign the pilot agreement and the privacy agreement (BAA) — no real patient calls before that. 4) Pay the $499 setup at checkout (fully refundable; enter a promo code if our team gave you one). 5) Two-minute onboarding: your hours, services, and emergency rules. 6) Forward your office line and the two-week pilot runs. 7) If she earns her keep it continues at $299/month per location — if not, the $499 comes back.';
        }"""
rep(anchor, early, 'answerFor early block')

# ---------- 5. Calculator + discount before generic pricing rule ----------
anchor = "        if (includesAny(q, ['price', 'pricing', 'cost', 'how much', '$299', '$399', '$499', 'per month', 'monthly', 'subscription', 'fees', 'charge', 'pay', 'payment', 'billing', 'plans'])) {"
pre = r"""        var locCount = null;
        var locDigit = q.match(/(\d+)\s*(location|office|practice)/);
        if (locDigit) locCount = parseInt(locDigit[1], 10);
        if (!locCount) {
          var locWords = [['two', 2], ['three', 3], ['four', 4], ['five', 5], ['six', 6], ['seven', 7], ['eight', 8], ['nine', 9], ['ten', 10]];
          for (var li = 0; li < locWords.length; li++) {
            if (includesAny(q, [locWords[li][0] + ' location', locWords[li][0] + ' office', locWords[li][0] + ' practice'])) { locCount = locWords[li][1]; break; }
          }
        }
        if (locCount && locCount >= 2 && locCount <= 20) {
          return 'For ' + locCount + ' locations the math is simple: one $499 setup covers the whole group — fully refundable during the pilot — and after the two-week pilot it is $299/month per location, so $' + (299 * locCount) + '/month for all ' + locCount + '. The pilot usually starts at one location, then rolls out to the rest.';
        }
        if (includesAny(q, ['discount', 'promo', 'coupon', 'offer code', 'discount code', 'special offer', 'any deals', 'price break', 'anything cheaper', 'cheaper plan'])) {
          return 'Our standard pricing is the price: $499 setup (fully refundable during the pilot), then $299/month per location with no per-minute fees. If our team gave you a promo code, enter it at checkout and it takes money off the setup — codes come from our team directly; there isn’t a public one.';
        }
""" + anchor
rep(anchor, pre, 'calculator + discount')

# ---------- 6. FAQ_INDEX additions ----------
pairs = [
    ('Where is the pricing on this page?', 'It is in the pricing section — ask me to take you there, or scroll to the section headed ‘Start with the call that would have gone unanswered.’ The short version: $499 setup, then $299/month per location after the pilot.'),
    ('How do I get to the demo?', 'The demo section is on this page — ‘Hear what your callers will hear.’ Or skip the scrolling: call (619) 202-1085 and talk to Sunny live, the way a patient would.'),
    ('Where do I claim my Champion invitation?', 'At ringandrespond.com/champion — or scan the QR code on your invitation card, which takes you straight there with your code filled in.'),
    ('What is the Champion Rewards program?', 'It thanks the front-desk person or office manager who champions Sunny inside their practice: a $50 gift card twice a year, plus a gift to the office each cycle. The first cycle starts after the office’s pilot converts and the first monthly payment clears.'),
    ('How do I claim my $50 gift card?', 'Scan the QR code on your invitation card to open ringandrespond.com/champion, check your code, and leave your name, practice, role, and the best contact for the gift card. Each code works once, and our team follows up with you.'),
    ('My Champion code says already claimed', 'Each Champion code works exactly once, so that message means the code has already been used. If that wasn’t you, email hello@ringandrespond.com and we’ll check it for you.'),
    ('When does my first Champion reward arrive?', 'Your first cycle starts after your office’s pilot converts and the first monthly payment clears. From there, rewards repeat twice a year while the office stays on the plan.'),
    ('Who can be a Champion?', 'The front-desk person or office manager who champions Sunny inside their practice. The practice owner agrees to the program in the pilot agreement, and the champion receives an invitation card with a QR code.'),
    ('What happens after I pay the setup fee?', 'We build Sunny around your office, you approve test calls, and after the two-minute onboarding you forward your line — then the two-week pilot starts. If she doesn’t earn her keep, the $499 comes back.'),
    ('Do I sign anything before the pilot?', 'Yes — a short pilot agreement and a privacy agreement (BAA). No real patient calls reach Sunny before those are signed.'),
    ('How long until we go live?', 'Most offices are ready within a few days: sign the agreement, pay the setup, do the two-minute onboarding, approve test calls, and forward the line.'),
    ('Can I cancel after the pilot?', 'Yes. Cancel before the pilot ends and the $499 setup is refunded and nothing continues. After the pilot it is month-to-month at $299/month — cancel anytime.'),
    ('Can Sunny handle two calls at once?', 'Yes. She answers every call that comes in, including simultaneous calls, so no caller hears a busy signal or lands in voicemail while another call is in progress.'),
    ('What happens in a dental emergency at night?', 'Sunny follows your emergency rules: true emergencies are told to call 911 or go to urgent care right away, and urgent dental problems are flagged as top priority on your team’s morning callback list.'),
    ('Does Sunny work for pediatric dentists?', 'Yes — she is built for dental offices, including pediatric practices. She answers in your practice’s name and captures the details your team needs for morning follow-up.'),
    ('Can Sunny cover lunch hour?', 'Yes — lunch is one of her main jobs. Calls forward to her while your team is out, and every caller lands on your callback list instead of in voicemail.'),
    ('What does Sunny say when she answers?', 'She greets callers in your practice’s name, includes the recording disclosure, and follows the greeting and call rules you approved — you hear and approve test calls before she ever talks to a real patient.'),
    ('Does Sunny send texts?', 'Not yet. Missed-call text-back is in the works as part of Front-Desk OS, and pilot offices will be first to get it. Today, Sunny answers the call live instead.'),
    ('Can patients text the office?', 'Not through Sunny today — texting is on our roadmap. For now patients call, Sunny answers live and captures the details, and your team follows up.'),
    ('Do you offer a discount for multiple locations?', 'One $499 setup covers a multi-location group, and after the pilot each location is $299/month. If our team gave you a promo code, it also takes money off the setup at checkout.'),
    ('Where is the FAQ on this page?', 'Just below the pricing section — look for ‘Before you hand over the phone.’ Or ask your question right here and I’ll answer it.'),
    ('How do I contact a real person?', 'Email hello@ringandrespond.com anytime — or type ‘call me’ here and I’ll take your number so Yama can call you.'),
    ('What is the demo phone number?', '(619) 202-1085 — that’s our live demo line. Call it and talk to Sunny the way a patient would.'),
    ('Is there a contract or commitment?', 'No long contract. The pilot runs two weeks with a fully refundable $499 setup; after that it’s $299/month, month-to-month, and you can cancel anytime.'),
]
def jsq(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'
pairs_js = ', '.join('[' + jsq(q) + ', ' + jsq(a) + ']' for q, a in pairs)
anchor = 'no per-minute metering."]];'
new = 'no per-minute metering."], ' + pairs_js + '];'
rep(anchor, new, 'FAQ additions (24)')

# ---------- 7. Callback functions + ask() upgrade ----------
anchor = '      function ask(question) {'
funcs = r"""      function startCallback() {
        setOpen(true, false);
        callback.active = true;
        callback.step = 0;
        callback.values = {};
        if (chips) chips.hidden = true;
        appendMessage('Of course — three quick things and Yama will call you personally.', 'assistant');
        appendMessage(callbackFields[callback.step].prompt, 'assistant');
        input.placeholder = 'Type your answer…';
        input.focus();
      }

      function handleCallbackAnswer(answer) {
        var field = callbackFields[callback.step];
        var problem = validateSignupValue(field, answer);
        if (problem) {
          appendMessage(problem, 'assistant');
          return;
        }
        callback.values[field.key] = answer;
        callback.step += 1;
        if (callback.step < callbackFields.length) {
          appendMessage(callbackFields[callback.step].prompt, 'assistant');
          return;
        }
        callback.active = false;
        var done = callback.values;
        fetch('/api/chat-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: done.name, phone: done.phone, time: done.time })
        }).then(function (r) {
          if (!r.ok) throw new Error('callback send failed');
          appendMessage('You’re booked in, ' + done.name + ' — Yama will call ' + done.phone + ' (' + done.time + '). If it’s urgent before then, his direct line is (619) 366-2218.', 'assistant');
        }).catch(function () {
          appendMessage('I couldn’t send that just now — please email us at ' + contact + ' or call (619) 366-2218 and ask for Yama. The demo line is (619) 202-1085 if you’d like to hear Sunny meanwhile.', 'assistant');
        });
      }

""" + anchor
rep(anchor, funcs, 'callback functions')

old_ask_tail = """        if (signup.active) handleSignupAnswer(cleanQuestion);
        else {
          var answer = answerFor(cleanQuestion);
          if (answer === '__START_SIGNUP__') startSignup();
          else appendMessage(answer, 'assistant');
        }"""
new_ask_tail = """        if (signup.active) handleSignupAnswer(cleanQuestion);
        else if (callback.active) handleCallbackAnswer(cleanQuestion);
        else {
          var answer = answerFor(cleanQuestion);
          if (answer === '__START_SIGNUP__') startSignup();
          else if (answer === '__START_CALLBACK__') startCallback();
          else if (answer === '__GOTO_demo__' || answer === '__GOTO_pricing__' || answer === '__GOTO_services__') {
            var gotoId = answer.slice(7, answer.length - 2);
            var gotoLines = {
              demo: 'Taking you to the demo — you can hear Sunny take a real call right there.',
              pricing: 'Taking you to pricing — the whole cost is on the page, nothing hidden.',
              services: 'Taking you to what Sunny does — the three jobs she handles for your front desk.'
            };
            appendMessage(gotoLines[gotoId], 'assistant');
            var gotoEl = document.getElementById(gotoId);
            if (gotoEl) gotoEl.scrollIntoView({ behavior: 'smooth' });
          }
          else if (answer === '__OPEN_champion__' || answer === '__OPEN_onboard__') {
            var isChampion = answer === '__OPEN_champion__';
            appendMessage(isChampion ? 'Opening the Champion claim page in a new tab — that’s where the code from your invitation card goes.' : 'Opening the onboarding page in a new tab.', 'assistant');
            window.open(isChampion ? '/champion' : '/onboard.html', '_blank');
          }
          else appendMessage(answer, 'assistant');
        }"""
rep(old_ask_tail, new_ask_tail, 'ask() token handling')

io.open(ROOT + 'index.html', 'w', encoding='utf-8').write(html)
io.open(ROOT + 'chat-test/index-edited.html', 'w', encoding='utf-8').write(html)
print('written. old len', len(src), 'new len', len(html), 'delta', len(html) - len(src))
