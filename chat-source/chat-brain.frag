/* Sunny site chat - BRAIN (knowledge base + engine + signup/callback
   flows). This fragment is the source for /chat-brain.js at the repo
   root; chat-source/sync-chat.py generates that file from this
   fragment (plus a generated-file header) and stamps its content
   hash into the shell that every page carries. Edit HERE, run the
   sync, commit the fragment, the generated chat-brain.js and the
   regenerated pages together. Never edit chat-brain.js directly.

   The shell (chat-script.frag, inline in every page) fetches this
   file the first time the chat is woken - a visitor intent signal or
   the post-load idle wake - and calls __sunnyChatInitBrain(state)
   with the actions the visitor already took, which the brain
   replays at the end of init. Nothing here runs at page load. */
(function () {
      function initBrain(state) {
      var launcher = document.getElementById('chatLauncher');
      var panel = document.getElementById('chatPanel');
      var closeButton = document.getElementById('chatClose');
      var form = document.getElementById('chatForm');
      var input = document.getElementById('chatInput');
      var log = document.getElementById('chatLog');
      var chips = document.getElementById('starterChips');
      var contact = 'hello@ringandrespond.com';

      /* OWNER: Stripe Payment Links, one per plan. The signup sends each
         office to the link for the coverage it picked; when the coverage
         answer is unclear, the office goes to the plan-picker page. */
      var STRIPE_LINK_AFTER_HOURS = 'https://buy.stripe.com/aFa00c2jjaiygee5lHdQQ01';
      var STRIPE_LINK_COMPLETE = 'https://buy.stripe.com/8x29AM6zz76mbXYaG1dQQ02';
      var PILOT_PAGE_URL = 'https://www.ringandrespond.com/pricing';
      function signupCheckoutLink() {
        var cov = (signup.values.coverage || '').toLowerCase();
        if (cov.indexOf('both') !== -1 || cov.indexOf('overflow') !== -1 || cov.indexOf('complete') !== -1 || cov.indexOf('24/7') !== -1 || cov.indexOf('24-7') !== -1 || cov.indexOf('daytime') !== -1 || cov.indexOf('lunch') !== -1) return STRIPE_LINK_COMPLETE;
        if (cov.indexOf('after') !== -1 || cov.indexOf('night') !== -1 || cov.indexOf('weekend') !== -1) return STRIPE_LINK_AFTER_HOURS;
        return PILOT_PAGE_URL;
      }

      var signup = { active: false, step: 0, values: {} };
      var callback = { active: false, step: 0, values: {} };
      var callbackFields = [
        { key: 'name', label: 'Name', prompt: 'Of course \u2014 what is your name?' },
        { key: 'phone', label: 'Phone', prompt: 'What is the best number for us to call you?', type: 'phone' },
        { key: 'time', label: 'Best time', prompt: 'When is a good time \u2014 morning, afternoon, or a specific time?' }
      ];
      var SIGNUP_STORE_KEY = 'rdr_signup_progress_v1';
      function saveSignupProgress() {
        try { localStorage.setItem(SIGNUP_STORE_KEY, JSON.stringify({ step: signup.step, values: signup.values })); } catch (e) {}
      }
      function loadSignupProgress() {
        try {
          var raw = localStorage.getItem(SIGNUP_STORE_KEY);
          if (!raw) return null;
          var data = JSON.parse(raw);
          if (!data || typeof data.step !== 'number' || data.step <= 0 || data.step >= signupFields.length || !data.values) return null;
          return data;
        } catch (e) { return null; }
      }
      function clearSignupProgress() {
        try { localStorage.removeItem(SIGNUP_STORE_KEY); } catch (e) {}
      }
      var signupFields = [
        { key: 'practice', label: 'Practice', prompt: 'What is the name of your dental practice?' },
        { key: 'location', label: 'Location', prompt: 'What city and state is the practice in?' },
        { key: 'contactName', label: 'Contact', prompt: 'Who should we work with on setup?' },
        { key: 'email', label: 'Email', prompt: 'What is the best email for pilot updates?', type: 'email' },
        { key: 'phone', label: 'Phone', prompt: 'What is the best callback number?', type: 'phone' },
        { key: 'coverage', label: 'Call coverage', prompt: 'Where do you need the most help: after-hours calls, overflow calls, or both?' }
      ];

      function setOpen(open, focusInput) {
        panel.hidden = !open;
        launcher.setAttribute('aria-expanded', String(open));
        launcher.querySelector('span').textContent = open ? 'Close chat' : 'Ask a question';
        if (open && focusInput !== false) input.focus();
        if (!open) launcher.focus();
      }

      function appendMessage(text, type) {
        var message = document.createElement('div');
        message.className = 'message ' + type;
        if (type === 'assistant' && text.indexOf(contact) !== -1) {
          var parts = text.split(contact);
          message.appendChild(document.createTextNode(parts[0]));
          var link = document.createElement('a');
          link.href = 'mailto:' + contact + '?subject=Sunny%20question';
          link.textContent = contact;
          message.appendChild(link);
          message.appendChild(document.createTextNode(parts[1] || ''));
        } else {
          message.textContent = text;
        }
        log.appendChild(message);
        log.scrollTop = log.scrollHeight;
      }

      function includesAny(text, terms) {
        return terms.some(function (term) { return text.indexOf(term) !== -1; });
      }

      var FAQ_INDEX = [["What is Sunny?", "Sunny is an AI receptionist for dental offices — Sunny by Ring & Respond. She answers the calls your front desk can't get to — overflow, lunch, and after hours — in your practice's own name."], ["Who is Sunny for?", "Dental offices. Sunny is built for the moments a dental front desk can't reach the phone: a patient at the counter, the lunch gap, the Monday-morning rush, and everything after closing."], ["What does Sunny do?", "Sunny answers in your practice's name, holds a real conversation, and captures each caller properly: their name, a callback number read back digit by digit, whether they're a new or existing patient, and their preferred callback window. She sorts every call into three urgency tiers, captures insurance questions word for word, and hands your team one morning callback list — urgencies first."], ["What does Sunny capture on a call?", "On every call: the caller's name, their callback number read back digit by digit for accuracy, whether they're a new or existing patient, and the callback window they'd prefer. Urgent callers are flagged at the top of your list."], ["Does Sunny read the callback number back?", "Yes — she reads the callback number back digit by digit, so the number your team calls back is the number the caller actually gave. Getting it right is the whole point of the callback list."], ["How does Sunny handle emergencies?", "Sunny sorts calls into three urgency tiers. A true emergency is directed to call 911 or go to urgent care right away, and your team gets an instant alert. Urgent callers sit at the top of your callback list. Routine calls are captured without waking anyone."], ["What is the urgency sort?", "Every call is sorted into one of three tiers by urgency. True emergencies are directed to 911 or urgent care with an instant alert to your team; urgent requests are flagged at the top of the morning callback list; everything else is captured cleanly for a normal callback."], ["What happens when someone calls after hours?", "Sunny answers in your practice's name and holds a real conversation — no voicemail box. She captures the caller's details, sorts the urgency, and the call lands on your morning callback list, urgencies first, ready before the office opens."], ["What happens when the front desk is busy or at lunch?", "That's the overflow Sunny covers. When line two rings while a patient stands at the counter — or the phones are uncovered over lunch — she answers in your name and captures the caller properly instead of letting the call ring out."], ["What do we get in the morning?", "One morning callback list, urgencies first, ready before the office opens — every caller Sunny caught, with their name, callback number, and what they need."], ["What is the owner proof report?", "A report of the week's calls: what came in, what callers requested, and the urgency mix — so the owner can see exactly what Sunny caught."], ["Does Sunny book appointments?", "No — and we say so plainly. Sunny does not book into your practice's schedule, and she never touches your patient database. She captures the caller's request and preferred time, and your team calls back and confirms. Your team stays in control."], ["Does Sunny book into Dentrix?", "No. Sunny doesn't book into Dentrix or any other practice software today. She captures the caller's details and request, and your team confirms in your own system. Booking into Open Dental is coming — developer access is in progress, and nothing is booked by Sunny until that is live and proven."], ["Does Sunny work with Open Dental?", "Not yet for booking. Booking into Open Dental is coming — developer access is in progress. Today Sunny works alongside whatever you run: she captures the caller and the request, and your team confirms in Open Dental the way you already work."], ["What does Sunny not do?", "Plainly: Sunny does not book into your schedule, never touches your patient database, doesn't diagnose or give medical advice, and doesn't verify insurance eligibility today — she captures insurance questions word for word for your team. Texting features are coming, not live. Your team calls back, in control."], ["Does Sunny give medical advice?", "No. Sunny never diagnoses or recommends treatment. She records what the caller says, follows your urgency rules, and directs true emergencies to 911 or urgent care."], ["Will patients know they're talking to an AI?", "Sunny is honest about what she is: calls carry an honest AI and recording disclosure, and if a caller asks directly, she answers honestly. What callers get is a real conversation in your practice's name — not a voicemail box."], ["Does Sunny replace my front desk staff?", "No. Sunny covers the calls your team can't get to — overflow, lunch, after hours. Your staff stays in control of scheduling and everything that needs a person."], ["What languages does Sunny speak?", "Sunny holds full conversations in English, Spanish, Arabic, and Farsi. You can hear her live on the demo line: (619) 202-1085."], ["Does Sunny speak Spanish?", "Yes — Sunny holds full conversations in Spanish, and also in English, Arabic, and Farsi."], ["How much does Sunny cost?", "Two plans, published plainly: After-Hours Capture is $199/month, and 24/7 Complete is $299/month. Setup is $0, and your first month is a paid 30-day pilot with an unconditional money-back guarantee. Full details are on the Pricing page."], ["What does After-Hours Capture cost?", "After-Hours Capture is $199/month, with $0 setup. It covers your after-hours answering in your practice's name, with 500 talk minutes included each month."], ["What does 24/7 Complete cost?", "24/7 Complete is $299/month, with $0 setup. Sunny answers around the clock — after hours plus daytime overflow — with 1,000 talk minutes included each month."], ["Is there a setup fee?", "No. Setup is $0. We build Sunny around your office — your hours, services, and call rules — and you approve test calls before she talks to a real patient."], ["Are there per-minute charges?", "Your plan includes generous minutes — 500 a month on After-Hours Capture, 1,000 on 24/7 Complete. Past them, a small overage of $0.25 a minute. That's the whole pricing picture: no setup fee, no surprises."], ["What happens if we use more minutes than the plan includes?", "Generous minutes are included — 500 a month on After-Hours Capture and 1,000 on 24/7 Complete — and past them, a small overage of $0.25 a minute."], ["What is the pilot?", "Your first month is the pilot: paid up front, with an unconditional money-back guarantee. We set Sunny up around your office, you approve test calls, and then she handles your calls for 30 days. If she hasn't earned her keep, email hello@ringandrespond.com within the 30 days and the month comes back."], ["Can I try Sunny before committing?", "Yes — the first month is a paid 30-day pilot with an unconditional money-back guarantee, and the plan is month-to-month after that. You can also hear Sunny live right now: call (619) 202-1085 and talk to her the way a patient would."], ["What is the money-back guarantee?", "Unconditional. If Sunny doesn't earn her keep in the first 30 days, email hello@ringandrespond.com within the pilot month and the month is refunded."], ["Is there a contract?", "No long contract. After the pilot, your plan continues month-to-month unless you cancel — just email us. No exit fee."], ["How do we get started?", "Four steps: 1) Call (619) 202-1085 and hear Sunny live. 2) We build her around your office — your hours, services, and call rules — and you approve test calls. 3) The privacy agreement (BAA) is signed before any patient information flows. 4) You turn on call forwarding and the 30-day pilot runs. Most offices are live in days, not weeks."], ["How long does setup take?", "Go-live is measured in days, not weeks. We configure Sunny with your hours, services, and emergency rules, you approve a few test calls, and then you forward your line."], ["Do we need a new phone number?", "No. You keep your number. Your office line forwards to Sunny — overflow and after hours. Daytime calls ring your team like normal, and if you ever change your mind, you turn forwarding off."], ["How does switching work?", "You keep your number and turn on forwarding — overflow plus after-hours. That's the whole switch. Change your mind by turning forwarding off."], ["Is Sunny HIPAA compliant?", "Your patients' information is protected: a signed Business Associate Agreement (BAA) is in place before any patient information flows to Sunny. The BAA is signed before the pilot takes real patient calls."], ["What is a BAA?", "A Business Associate Agreement is the signed privacy agreement between your practice and us. Your patients' information is protected: a signed Business Associate Agreement (BAA) is in place before any patient information flows to Sunny."], ["How is patient privacy handled?", "Your patients' information is protected: a signed Business Associate Agreement (BAA) is in place before any patient information flows to Sunny. Call summaries go to your team so they can follow up."], ["How does Sunny handle insurance questions?", "She captures them — the carrier and the caller's exact question, word for word — and puts them on your team's list to answer. That's capture, not verification: she doesn't quote benefits or guess at coverage."], ["Does Sunny verify insurance eligibility?", "Not today. Eligibility verification is in our sandbox now, and production comes with a signed pilot office. Today, Sunny captures the caller's insurance question — carrier plus the exact question, word for word — for your team to answer."], ["Does Sunny send text messages?", "Not yet. Missed-call text-back is coming — it rides on carrier texting approval, and the resubmission goes in November 13. Today Sunny answers the call live, so there's usually nothing to text back about."], ["Does Sunny send appointment confirmations?", "Not yet. Appointment confirmations and same-day backfill of cancelled slots are coming — they ride on the texting approval plus reading your schedule. Today Sunny captures every request so your team can confirm the way you already work."], ["Does Sunny do recall or reactivation calls?", "Not yet. Recall and reactivation runs — working your office's own list of due and lapsed patients — are coming. Today Sunny's job is answering and capturing every incoming call."], ["Does Sunny ask for reviews?", "Review requests by text are coming. A QR version works today — ask us at hello@ringandrespond.com and we'll set it up."], ["Does Sunny call patients back herself?", "Sunny answers incoming calls today. The follow-up call is your team's — she hands them a clean, urgency-sorted callback list so no caller waits on a robot's promise."], ["What is the office dashboard?", "One place to see it all — today's calls, the callback list with urgencies first, the proof report, and Settings with your office's toggles. It's in build now and will live at app.ringandrespond.com. Every call will be shown with its intent label."], ["Is the dashboard available now?", "The office dashboard is in build — it isn't live yet, and we label it that way. Today your team gets the morning callback list and the owner proof report. The dashboard will live at app.ringandrespond.com when it ships."], ["What is warm transfer?", "Warm transfer is an option your office controls — ON or OFF, your choice. ON means a true emergency can be connected live to the on-call dentist. OFF means Sunny captures the details, flags it urgent, and alerts the team instead. It's a spec item until the transfer path is built and tested end to end."], ["Will Sunny recognize repeat callers?", "That's coming, in phases. Phase 1, with the office dashboard: an intent label on every call — book, reschedule, billing, insurance, emergency, or other — plus repeat-caller memory from Sunny's own call history. Phase 2, with the Open Dental connection: a full patient match. Neither phase is live today — Sunny does not match patient records today."], ["How many calls do dental offices miss?", "The one number we publish: in Patient Prism's 2025 analysis of 11.5 million dental calls across 8,280 locations, 31 of every 100 callers hung up before reaching anyone. That's vendor platform data — and it's the gap Sunny exists to close."], ["What if Sunny can't answer a caller's question?", "She captures the question with the caller's details and puts it on your callback list, so your team calls back with the real answer. Nothing gets guessed at, and nothing falls through."], ["Can Sunny cover multiple locations?", "Yes — the same Sunny at every location, with each location's own greeting and call rules. Each location is on its own plan ($199 or $299/month), and setup is $0 across the group. The pilot usually starts at one location, then rolls out."], ["What's the difference between Sunny and a human answering service?", "A human answering service takes a message for your team to handle later. Sunny answers in your practice's name, holds a real conversation, captures and validates the caller's details, sorts urgency, and builds your morning callback list — urgencies first — before your office opens."], ["What's the difference between Sunny and voicemail?", "Voicemail asks a caller to leave a message and hope. Sunny is a real conversation: she answers, captures the request properly, and your team starts the morning with an organized callback list instead of a message box."], ["How can I hear Sunny?", "Call (619) 202-1085 — that's our live demo line. Talk to Sunny the way a patient would; it's the fastest way to judge her."], ["Is there a demo?", "Yes — call (619) 202-1085 and hear Sunny take a real call, live. No signup, no pitch: just call and talk to her."], ["How do I contact you?", "Email us at hello@ringandrespond.com — we reply fast. Or call (619) 202-1085 to hear Sunny live first."], ["Who makes Sunny?", "Sunny is made by Ring & Respond — 'Sunny by Ring & Respond.' Our slogan is the standard she answers to: Answered with a smile."], ["Do you build websites?", "This site has a Websites page with concept samples if you'd like to see that work. For anything about websites, email hello@ringandrespond.com and we'll talk it through."], ["Is Sunny available on weekends and holidays?", "Yes. On 24/7 Complete, Sunny answers around the clock — nights, weekends, and holidays. On After-Hours Capture, she covers whenever your office is closed, on the schedule you set."], ["Does Sunny know if a caller is a new patient?", "Yes — she asks whether the caller is a new or existing patient and captures it with the call, so your team can welcome first-time callers properly and see the new-patient calls she caught."], ["Can Sunny help with billing questions?", "She captures billing questions with the caller's details for your team's callback list. A patient billing portal — where patients pay the office directly — is coming in a later phase."], ["What packages do you offer?", "Four packages, honestly labeled. Live today: After-Hours Capture at $199/month and 24/7 Complete at $299/month — both with $0 setup and a paid 30-day pilot with an unconditional money-back guarantee. Coming, priced now and sold only when they are real: Booked at $449/month, and the Complete System at $549/month. Nothing labeled coming is charged for before it exists."], ["What is the Booked plan?", "Booked is our coming package at $449/month, with 1,000 talk minutes included. It starts when Sunny can book directly into your practice’s system — Open Dental first. That connection is not live yet, so Booked is not sold today: until it is, Sunny captures every request and your team books, exactly like today. And if you are already a Capture or Complete customer on a supported system, you keep your current introductory price when Booked launches — no jump."], ["How much is the Complete System?", "The Complete System is $549/month — 1,500 talk minutes and 300 insurance eligibility checks included each month, with extra checks at $1.95 each. It is labeled coming, and it is not sold today at any price: we sell it only once its automated checking passes our own measured labor test. The plans you can start today are After-Hours Capture ($199/month) and 24/7 Complete ($299/month)."], ["Can I buy the Complete System today?", "Not yet — honestly. The Complete System ($549/month) is sold only once its automated checking passes our own measured labor test, and until that gate passes it is not sold at any price. What you can start today is After-Hours Capture ($199/month) or 24/7 Complete ($299/month), each with a paid 30-day pilot and an unconditional money-back guarantee. Email hello@ringandrespond.com and we will tell you the moment the Complete System opens."], ["What add-ons are there?", "The add-on card, each item labeled: missed-call text-back $59/month or bundled with a plan (coming) · appointment confirmations $0.75 per appointment with a $49/month minimum (coming) · recall and reactivation $89–99/month (coming) · treatment follow-up $129/month (coming) · post-op check-ins $79/month (coming) · review requests $59/month bundled or $89 alone — the text version is coming, and a QR-code version works today · balance reminders $69/month (coming) · standalone insurance checks $1.50–$2.25 per check, with human-handled Depth-2 checks at $25 (available with a signed pilot) · warm transfer $29/month or included in the Complete System, 8 transfers included then $4 each (an office-controlled option). Nothing labeled coming is charged for before it exists."], ["How much is text-back?", "Missed-call text-back is $59/month, or bundled with a plan. It is labeled coming — it rides on carrier texting approval, and the resubmission goes in November 13 — so it is not charged for today. Today Sunny answers the call live, so there is usually nothing to text back about."], ["How much do appointment confirmations cost?", "Appointment confirmations are priced at $0.75 per appointment, with a $49/month minimum. They are labeled coming — they ride on the texting approval plus reading your schedule — so there is nothing to pay today. Today Sunny captures every request so your team can confirm the way you already work."], ["How much are standalone insurance checks?", "Standalone insurance eligibility checks run $1.50–$2.25 per check, and a human-handled Depth-2 check — the kind that needs a person working a payer portal — is $25 per check. They are available with a signed pilot office: verification runs in our sandbox today, and production starts with that signed pilot. On the answering plans, Sunny captures insurance questions word for word today — that is capture, not verification."], ["How much is warm transfer?", "Warm transfer is $29/month, or included in the Complete System — 8 transfers included each month, then $4 per transfer. It is an option your office controls, ON or OFF. It is a spec item until the transfer path is built and tested end to end, so it is not switched on for anyone yet."]];

      var FAQ_STOP = { what: 1, is: 1, the: 1, a: 1, an: 1, do: 1, does: 1, can: 1, how: 1, i: 1, my: 1, our: 1, your: 1, you: 1, it: 1, to: 1, of: 1, for: 1, in: 1, on: 1, if: 1, are: 1, will: 1, would: 1, should: 1, when: 1, why: 1, get: 1, with: 1, and: 1, or: 1, me: 1, we: 1, us: 1, about: 1, really: 1, just: 1, much: 1, many: 1 };

      function faqAnswer(q) {
        var words = q.split(' ').filter(function (w) { return w.length > 2 && !FAQ_STOP[w]; });
        if (!words.length) return null;
        var best = null, bestScore = 0;
        for (var i = 0; i < FAQ_INDEX.length; i++) {
          var fq = FAQ_INDEX[i][0].toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
          var fwords = fq.split(' ').filter(function (w) { return w.length > 2 && !FAQ_STOP[w]; });
          if (!fwords.length) continue;
          var hit = 0;
          for (var j = 0; j < fwords.length; j++) { if (q.indexOf(fwords[j]) !== -1) hit++; }
          var score = hit / fwords.length;
          if (hit >= 2 && score > bestScore) { bestScore = score; best = FAQ_INDEX[i][1]; }
        }
        return bestScore >= 0.5 ? best : null;
      }

      function answerFor(question) {
        var q = question.toLowerCase().replace(/[^a-z0-9$@.\s-]/g, ' ');
        if (includesAny(q, ['sign up', 'signup', 'start my pilot', 'get started', 'checkout', 'enroll'])) return '__START_SIGNUP__';
        if (includesAny(q, ['call me', 'call back', 'callback', 'give me a call', 'have yama call', 'request a call', 'phone call with', 'yama call me']) && !includesAny(q, ['callback list', 'call back patients', 'call patients back', 'does sunny call', 'will sunny call', 'sunny call back'])) return '__START_CALLBACK__';
        if (includesAny(q, ['where is', 'where are', 'where can i', 'where do i'])) {
          if (includesAny(q, ['demo', 'hear sunny', 'listen'])) return '__GOTO_demo__';
          if (includesAny(q, ['pricing', 'price', 'cost', 'plans'])) return '__GOTO_pricing__';
          if (includesAny(q, ['services', 'features', 'what sunny does', 'what she does', 'how it works'])) return '__GOTO_services__';
          if (includesAny(q, ['faq', 'frequently asked', 'questions'])) return 'There’s an FAQ section on the home page — or skip the scrolling: ask me the question right here and I’ll answer it.';
          if (includesAny(q, ['review', 'testimonial'])) return 'There’s no separate reviews section on this site yet — the honest shortcut is the demo: call (619) 202-1085 and hear exactly what your patients will hear.';
          if (includesAny(q, ['contact', 'email', 'get in touch', 'reach you'])) return 'You’ll find ' + contact + ' in the footer of every page — or stay right here: ask a question, start your pilot, or type “call me” and we’ll call you.';
        }
        if (includesAny(q, ['how does buying work', 'buying process', 'sales process', 'how do i buy', 'how to buy', 'steps to start', 'how do we start'])) {
          return 'Here’s the whole journey: 1) Call (619) 202-1085 and hear Sunny live. 2) Start your pilot here or email ' + contact + ' — we collect your practice details. 3) We build Sunny around your office — your hours, services, and call rules — and you approve test calls. 4) The privacy agreement (BAA) is signed before any patient information flows — no real patient calls before that. 5) Pay your first month at checkout: $199 for After-Hours Capture or $299 for 24/7 Complete; setup is $0. 6) Turn on forwarding and the 30-day pilot runs; each week you get the owner proof report of everything she caught. 7) If she earns her keep it continues month-to-month at the same rate — if not, email us within the 30 days and the month comes back.';
        }
        if (includesAny(q, ['demo', 'hear her', 'hear sunny', 'live call', 'test call', 'listen to', 'example call', 'try her', 'try sunny'])) {
          return 'You can hear Sunny on a real call right now — call (619) 202-1085 and talk to her the way a patient would. That’s our live demo line.';
        }
        if (includesAny(q, ['human', 'talk to', 'speak to', 'contact', 'email you', 'your email', 'email address', 'send an email', 'call you', 'real person', 'actual person'])) {
          return 'You can reach us at ' + contact + ' — we reply fast.';
        }
        if (includesAny(q, ['robot', 'is it ai', 'is this ai', 'is she ai', 'is sunny ai', 'artificial intelligence', 'a bot', 'chatbot', 'is she real', 'is it real', 'is she a person', 'is it a person'])) {
          return 'Sunny is an AI receptionist, and she’s upfront about it — if a caller asks whether she’s a person or an AI, she says she’s the office’s automated assistant. And a real person from your team always follows up.';
        }
        if (includesAny(q, ['emergency', 'emergencies', 'urgent', 'severe pain', 'tooth pain', 'swelling', 'swollen', 'bleeding', 'knocked out', 'broken tooth', 'choking', 'can t breathe', 'cant breathe', 'fever', 'trauma', 'accident'])) {
          return 'If a caller describes a true emergency, Sunny tells them to call 911 or go to urgent care right away — and your team gets an instant alert. Urgent dental problems — severe pain, swelling, a knocked-out tooth — get flagged as top priority on your team’s morning list.';
        }
        if (includesAny(q, ['dentrix', 'eaglesoft', 'open dental', 'curve dental', 'denticon', 'carestack', 'software', 'pms', 'integrate', 'integration', 'compatible'])) {
          return 'No — Sunny doesn’t book into Dentrix or your other practice software. She works alongside the software you already run — Dentrix, Eaglesoft, Open Dental, Curve Dental. She captures the caller’s name, number, and request, and your team confirms it in your own system in the morning. No migration, no new logins. Booking into Open Dental is coming — developer access is in progress, and nothing is booked by Sunny until that is live and proven.';
        }
        if (includesAny(q, ['privacy policy', 'terms of service', 'terms and conditions'])) {
          return 'The short version, plainly: your patients’ information is protected — a signed Business Associate Agreement (BAA) is in place before any patient information flows to Sunny, and call summaries go to your team so they can follow up. For the details, email ' + contact + ' and we’ll walk you through them.';
        }
        if (includesAny(q, ['hipaa', 'baa', 'privacy', 'private', 'secure', 'security', 'patient data', 'recording', 'recorded'])) {
          return 'Privacy is built into the pilot: your patients’ information is protected — a signed Business Associate Agreement (BAA) is in place before any patient information flows to Sunny. No real patient calls happen before it is signed, and calls carry an honest AI and recording disclosure.';
        }
        if (includesAny(q, ['my data', 'our data', 'who owns', 'data belong', 'sell my data', 'share my data', 'sell our data', 'share our data'])) {
          return 'Your call data belongs to your practice. Summaries go to your team for follow-up, and we don’t sell or share your callers’ information.';
        }
        if (includesAny(q, ['wrong number', 'number wrong', 'wrong phone', 'read back', 'read the number', 'validate', 'confirm the number', 'confirm their number', 'digit'])) {
          return 'She reads the callback number back digit by digit and only moves on once the caller confirms it — and if it isn’t a full 10 digits, she asks once more, simply. A wrong number is a lost patient, so she treats it carefully.';
        }
        if (includesAny(q, ['keep my number', 'keep our number', 'keep the number', 'forward', 'new number', 'change my number', 'change our number', 'phone number', 'our number', 'my number'])) {
          return 'You keep your number. Your office line simply forwards to Sunny after hours — daytime calls ring your staff exactly as they do now. Your patients never have to learn a new number.';
        }
        if (includesAny(q, ['how long', 'setup take', 'set up', 'install', 'onboarding', 'go live'])) {
          return 'We build Sunny around your hours, services, FAQs, and call rules — setup is done-for-you and $0. You approve a few test calls, and then your 30-day pilot starts. Go-live is measured in days, not weeks, and your team does almost none of the work.';
        }
        if (includesAny(q, ['greeting', 'custom', 'script', 'my hours', 'my services', 'our hours', 'our services', 'real hours', 'real services', 'faq', 'train', 'teach her', 'program her'])) {
          return 'Everything is built around your office: your greeting, your hours, your services, your FAQs, and your call rules. You approve test calls before Sunny ever talks to a real patient.';
        }
        var locCount = null;
        var locDigit = q.match(/(\d+)\s*(location|office|practice)/);
        if (locDigit) locCount = parseInt(locDigit[1], 10);
        if (!locCount) {
          var locWords = [['two', 2], ['three', 3], ['four', 4], ['five', 5], ['six', 6], ['seven', 7], ['eight', 8], ['nine', 9], ['ten', 10]];
          for (var li = 0; li < locWords.length; li++) {
            if (includesAny(q, [locWords[li][0] + ' location', locWords[li][0] + ' office', locWords[li][0] + ' practice'])) { locCount = locWords[li][1]; break; }
          }
        if (includesAny(q, ['complete system', '$549', '549'])) {
          return 'The Complete System is $549/month \u2014 1,500 talk minutes and 300 insurance eligibility checks included each month, extra checks $1.95 each. It is labeled COMING, and honestly it is not sold today at any price: we sell it only once its automated checking passes our own measured labor test. The plans you can start today are After-Hours Capture ($199/month) and 24/7 Complete ($299/month).';
        }
        if (includesAny(q, ['booked', '$449', '449'])) {
          return 'Booked is our COMING package at $449/month, with 1,000 talk minutes included (past them, $0.25 a minute). It starts when Sunny can book directly into your practice\u2019s system \u2014 Open Dental first \u2014 and that connection is not live yet, so Booked is not sold today: until it is, Sunny captures every request and your team books. If you are already a Capture or Complete customer on a supported system, you keep your current introductory price when Booked launches \u2014 no jump.';
        }
        if (includesAny(q, ['package', 'packages', 'how many plans', 'what plans'])) {
          return 'Four packages, honestly labeled. Live today: After-Hours Capture at $199/month and 24/7 Complete at $299/month — both with $0 setup and a paid 30-day pilot with an unconditional money-back guarantee. Coming, priced now and sold only when they are real: Booked at $449/month, and the Complete System at $549/month. Nothing labeled coming is charged for before it exists.';
        }
        if (includesAny(q, ['add-on', 'add-ons', 'addon', 'addons', 'add on', 'extras']) || (includesAny(q, ['price', 'cost', 'how much', 'per month', 'monthly', 'charge']) && includesAny(q, ['text-back', 'textback', 'text back', 'confirmation', 'recall', 'review request', 'balance reminder', 'post-op', 'post op', 'treatment follow', 'standalone', 'insurance check', 'eligibility check', 'warm transfer']))) {
          return 'The add-on card, each item labeled: missed-call text-back $59/month or bundled with a plan (COMING) \u00b7 appointment confirmations $0.75 per appointment, $49/month minimum (COMING) \u00b7 recall & reactivation $89\u201399/month (COMING) \u00b7 treatment follow-up $129/month (COMING) \u00b7 post-op check-ins $79/month (COMING) \u00b7 review requests $59/month bundled or $89 alone \u2014 the text version is COMING, a QR-code version works today \u00b7 balance reminders $69/month (COMING) \u00b7 standalone insurance checks $1.50\u2013$2.25 per check, human-handled Depth-2 checks $25 (available with a signed pilot) \u00b7 warm transfer $29/month or included in the Complete System, 8 included then $4 each (OPTION \u2014 your office controls it). Nothing labeled COMING is charged for before it exists.';
        }
        if (includesAny(q, ['price', 'pricing', 'cost', 'how much', '$199', '$299', '$399', 'per month', 'monthly', 'subscription', 'fees', 'charge', 'pay', 'payment', 'billing', 'plans'])) {
          return 'There is no setup fee — setup is done-for-you and included. You pick your coverage: After-Hours Capture is $199/month per location (500 talk minutes included monthly), and 24/7 Complete is $299/month (1,000 included). Generous minutes included — past them, a small overage of $0.25 a minute. Your first month is a paid 30-day pilot with an unconditional money-back guarantee; after the pilot it continues month-to-month unless you cancel.';
        }
        if (includesAny(q, ['hours', '24 7', '24/7', 'weekend', 'sunday', 'saturday', 'holiday', 'overnight', 'after hours', 'after-hours', 'lunch', 'closed', 'busy', 'overflow', 'every call', 'always answers', 'never miss', 'sick', 'vacation'])) {
          return 'Sunny covers the hours your team can’t: nights, weekends, holidays, lunch breaks, and the busy stretches when phones ring off the hook. She never sleeps and never calls out. Whenever you’re open and available, your staff handles calls exactly as they do now.';
        }
        if (includesAny(q, ['remind', 'reminder', 'outbound', 'call patients', 'confirmation', 'confirmations', 'confirmation call'])) {
          return 'Not yet — appointment confirmations are coming (they ride on the texting approval plus reading your schedule). Today Sunny answers incoming calls and captures every request, so your team can confirm and follow up the way you already do.';
        }
        if (includesAny(q, ['appointment', 'booking', 'reschedule', 'schedule a', 'schedule an', 'book a', 'book an', 'make an appointment', 'cancel my appointment', 'cancel an appointment', 'calendar', 'book into', 'book directly', 'directly into'])) {
          return 'Sunny captures the appointment request — name, callback number, what they need, and the time they’d like — and your team confirms it in your own software. She doesn’t book into your schedule and never touches your patient database, so your real schedule stays accurate and under your control.';
        }
        if (includesAny(q, ['what information', 'what does she collect', 'what details', 'does she collect', 'does she ask', 'intake', 'information does she'])) {
          return 'On every call Sunny captures the caller’s name, callback number, whether they’re a new or existing patient, the reason for calling, and the day and time window they’d prefer — so your team starts the morning with a ready callback list, not a pile of voicemails.';
        }
        if (includesAny(q, ['summary', 'summaries', 'report', 'transcript', 'callback list', 'morning', 'what do i get', 'what do we get', 'what does the office get', 'what happens after', 'follow up list', 'follow-up list', 'how do i know', 'will i know'])) {
          return 'After every call you get a clean summary: the caller’s name, callback number, what they need, how urgent it is, and the time they asked for. It all lands on one morning callback list — urgencies first — ready before your office opens.';
        }
        if (includesAny(q, ['doesn t know', 'don t know', 'can t answer', 'can not answer', 'cannot answer', 'unable to answer', 'not know the', 'no answer for'])) {
          return 'If Sunny doesn’t know something — a price, a policy — she says so honestly and logs the question with the caller’s details, so your team can call back with the answer. Nothing falls through.';
        }
        if (includesAny(q, ['medical advice', 'diagnose', 'diagnosis', 'prescribe', 'treatment', 'medical question'])) {
          return 'No. Sunny never diagnoses, recommends treatment, or quotes exact prices. She records what the caller says, follows your urgency rules, and directs true emergencies to 911 or urgent care.';
        }
        if (includesAny(q, ['replace', 'fire my', 'lay off', 'instead of staff', 'instead of my staff', 'front desk staff', 'my receptionist'])) {
          return 'No — she’s the night shift, not a replacement. She covers the calls your team can’t get to, and your staff stays in control of scheduling and everything that needs a person.';
        }
        }
        if (locCount && locCount >= 2 && locCount <= 20) {
          return 'For ' + locCount + ' locations the math is simple: setup is $0 for the whole group, the same Sunny covers every location, and each location is on its own plan — $299/month per location on 24/7 Complete ($' + (299 * locCount) + '/month for all ' + locCount + ') or $199/month per location on After-Hours Capture ($' + (199 * locCount) + '/month). Your first month is a paid 30-day pilot with a money-back guarantee — the pilot usually starts at one location, then rolls out to the rest.';
        }
        if (includesAny(q, ['discount', 'promo', 'coupon', 'offer code', 'discount code', 'special offer', 'any deals', 'price break', 'anything cheaper', 'cheaper plan'])) {
          return 'Our standard pricing is the price: $0 setup, then $199/month per location for After-Hours Capture or $299/month for 24/7 Complete. Generous minutes are included — past them, a small overage of $0.25 a minute. We don’t run public promo codes; the pilot’s money-back guarantee is the offer.';
        }
        if (includesAny(q, ['go up', 'price change', 'prices change', 'price changes', 'price increase', 'prices increase', 'price hike', 'raise the price', 'raise prices', 'rates go up'])) {
          return 'Your price won’t change without 30 days’ notice by email — and you can cancel anytime, month-to-month, no exit fee.';
        }
        if (includesAny(q, ['pilot', 'trial', 'try it', '30 day', '30-day', 'free'])) {
          return 'We build the receptionist with your hours, services, FAQs, and call rules — setup is free and done-for-you. You approve test calls, then your first month is the pilot: paid up front ($199 or $299 depending on coverage) with an unconditional money-back guarantee. Each week you get the owner proof report of what she caught; if Sunny hasn’t earned her keep by day 30, email us and the month comes straight back. After the pilot the plan continues month-to-month unless you cancel.';
        }
        if (includesAny(q, ['refund', 'money back', 'guarantee', 'cancel', 'contract', 'commitment', 'locked in'])) {
          return 'Your first month is the pilot, and it is fully refundable — if Sunny doesn’t earn her keep in the 30 days, email hello@ringandrespond.com and the month comes straight back. After the pilot, your plan ($199 or $299/month) is month-to-month and you can cancel anytime. No long contract, no exit fee.';
        }
        if (includesAny(q, ['insurance', 'insured', 'ppo', 'hmo', 'in network', 'in-network'])) {
          return 'Sunny captures insurance questions — the carrier and the caller’s exact question, word for word — for your team to answer. She doesn’t quote benefits or guess at coverage. Eligibility verification itself is in our sandbox today; production comes with a signed pilot office.';
        }
        if (includesAny(q, ['answering service', 'call center', 'human receptionist', 'real receptionist', 'difference', 'compare', 'versus', 'vs ', 'voicemail', 'voice mail'])) {
          return 'A human answering service takes messages for your team to handle later. Sunny answers in your practice’s name, holds a real conversation, captures and validates the caller’s details, sorts urgency, and builds your morning callback list — urgencies first — before your office opens. And unlike a voicemail box, she actually picks up and talks to the caller.';
        }
        if (includesAny(q, ['missed call', 'miss a call', 'missed calls', 'unanswered', 'dont answer', 'do not answer', 'nobody answers', 'no one answers'])) {
          return 'That’s exactly the problem Sunny removes: she answers when your team is busy or closed, captures the caller’s details, and puts them on your morning callback list — so a missed call stops meaning a lost patient.';
        }
        if (includesAny(q, ['text back', 'text-back', 'textback', 'text message', 'sms', 'texting', 'send a text', 'send texts'])) {
          return 'Missed-call text-back is coming — it rides on carrier texting approval, and the resubmission goes in November 13. It isn’t part of today’s service. Today, Sunny answers the call live, so there’s usually nothing to text back about.';
        }
        if (includesAny(q, ['review', 'google', 'yelp', 'rating', 'feedback'])) {
          return 'Review requests by text are coming. A QR version works today — email ' + contact + ' and we’ll set it up for your office.';
        }
        if (includesAny(q, ['worth it', 'roi', 'how many calls do', 'percentage of calls', 'missed calls cost', 'lose money', 'losing patients', 'statistics'])) {
          return 'The honest math is about the calls themselves: in Patient Prism’s 2025 analysis of 11.5 million dental calls across 8,280 locations, 31 of every 100 callers hung up before reaching anyone. Every one of those callers Sunny answers is a conversation your office keeps — captured properly, on your morning callback list, instead of gone.';
        }
        if (includesAny(q, ['hire', 'hiring', 'another receptionist', 'front desk person', 'employee cost', 'staff cost'])) {
          return 'A front-desk hire is a person — they take lunch, finish at close, and call out sick, and the phones don’t pause for any of it. Sunny covers exactly those gaps for $199–$299/month: the overflow, the lunch hour, and every hour you’re closed. Most offices use her alongside their team, not instead of them.';
        }
        if (includesAny(q, ['two offices', 'two locations', 'multiple offices', 'multiple locations', 'second office', 'both offices', 'both locations'])) {
          return 'Setup is $0 for both offices — your first location is $199 or $299/month depending on coverage, and the second location is on its own plan at the same rates. Each office keeps its own greeting and call rules under the same Sunny, and your first month is a guaranteed 30-day pilot.';
        }
        if (includesAny(q, ['san diego', 'where are you', 'located', 'your area', 'service area', 'near me', 'who are you', 'your company', 'ring and respond'])) {
          return 'We’re Ring & Respond — Sunny by Ring & Respond. Sunny is our AI receptionist for dental offices, and we’re onboarding dental offices for pilots right now. The fastest way to reach us is ' + contact + '.';
        }
        if (includesAny(q, ['spanish', 'espanol', 'arabic', 'farsi', 'dari', 'persian', 'language', 'bilingual', 'languages'])) {
          return 'Sunny holds full conversations in English, Spanish, Arabic, and Farsi. Try her on the demo line: (619) 202-1085 — talk to her the way a patient would.';
        }
        if (includesAny(q, ['new patient', 'existing patient', 'first time caller', 'first-time caller'])) {
          return 'She asks whether the caller is a new or existing patient and logs it in the summary — so your team can welcome first-time callers properly and see the new-patient calls Sunny rescued overnight.';
        }
        if (includesAny(q, ['overage', 'go over', 'more minutes', 'minutes included', 'how many minutes', 'over our minutes', 'minute limit'])) {
          return 'Generous minutes are included — 500 a month on After-Hours Capture, 1,000 on 24/7 Complete — and past them, a small overage of $0.25 a minute. No setup fee, no other meter running.';
        }
        if (includesAny(q, ['dashboard'])) {
          return 'The office dashboard is in build — it isn’t live yet, and we label it that way. When it ships at app.ringandrespond.com, it’s one place to see it all: today’s calls, the callback list with urgencies first, the proof report, and Settings with your office’s toggles. Every call will carry its intent label.';
        }
        if (includesAny(q, ['warm transfer', 'transfer me', 'transfer the call', 'connect me to the dentist', 'on-call dentist', 'on call dentist'])) {
          return 'Warm transfer is an option your office controls — ON or OFF, your choice. ON means a true emergency can be connected live to the on-call dentist; OFF means Sunny captures the details, flags it urgent, and alerts the team instead. It’s a spec item until the transfer path is built and tested end to end.';
        }
        if (includesAny(q, ['recognize', 'recognition', 'repeat caller', 'known caller', 'intent label'])) {
          return 'Caller recognition is coming, in phases. Phase 1, with the office dashboard: an intent label on every call — book, reschedule, billing, insurance, emergency, or other — plus repeat-caller memory from Sunny’s own call history. Phase 2, with the Open Dental connection: a full patient match. Neither phase is live today — Sunny does not match patient records today.';
        }
        if (includesAny(q, ['recall', 'reactivation', 'reactivate', 'lapsed patients', 'due patients'])) {
          return 'Recall and reactivation runs are coming — working your office’s own list of due and lapsed patients. They aren’t live today; today Sunny answers and captures every incoming call.';
        }
        if (includesAny(q, ['what can sunny do', 'what does sunny do', 'what can she do', 'what does she do', 'capabilities', 'abilities', 'features', 'everything', 'what do you offer', 'what does it include', 'services include', 'full list'])) {
          return 'Here’s Sunny in one breath: she answers every call your office misses — nights, weekends, lunch, busy hours — on your own number. She holds a natural conversation, captures the name, validated callback number, new-or-existing status, reason, and preferred time, sorts urgency into tiers (true emergencies are directed to 911 or urgent care, with an instant alert to your team), answers your approved FAQs, and hands your team a clean morning callback list. She never diagnoses and never pretends to book — your team confirms in your own system.';
        }
        var faqEarly = faqAnswer(q);
        if (faqEarly) return faqEarly;
        if (includesAny(q, ['sunny', 'glow', 'voice', 'receptionist', 'answer calls', 'phone'])) {
          return 'Sunny is the dental AI receptionist available for pilots now. It answers after-hours or overflow calls, handles approved FAQs, captures caller details, and organizes the next step for your team.';
        }
        if (includesAny(q, ['who is it for', 'who it is for', 'dentist', 'dental', 'med spa', 'medspa', 'local business', 'service business', 'industry', 'orthodontist', 'endodontist'])) {
          return 'The pilot is for dental offices. Sunny is an AI receptionist built for the dental front desk — the overflow, lunch, and after-hours calls a dental team can’t get to.';
        }
        if (includesAny(q, ['what is', 'what does', 'how does', 'how it works', 'explain', 'tell me about', 'module', 'service', 'front-desk os', 'front desk os'])) {
          return 'Sunny is an AI receptionist for dental offices: she answers the calls your team can’t get to, captures each caller properly, and hands your team an urgency-sorted morning callback list. Text-back and review requests are coming later — today is about never missing the call.';
        }
        var fromSite = faqAnswer(q);
        if (fromSite) return fromSite;
        return 'I don’t have that one yet — but you can hear Sunny handle questions live at (619) 202-1085, or reach us at ' + contact + ' and we’ll reply fast.';
      }

      function validateSignupValue(field, value) {
        if (value.length < 2) return 'Please add a little more detail so we can set this up correctly.';
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a complete email address, such as name@practice.com.';
        if (field.type === 'phone' && value.replace(/\D/g, '').length < 7) return 'Please enter a complete callback number.';
        return '';
      }

      function startSignup(resume) {
        setOpen(true, false);
        var saved = resume === true ? loadSignupProgress() : null;
        signup.active = true;
        signup.step = saved ? saved.step : 0;
        signup.values = saved ? saved.values : {};
        if (chips) chips.hidden = true;
        if (!saved) clearSignupProgress();
        if (saved) {
          appendMessage('Welcome back — picking up where you left off. ' + saved.step + ' of ' + signupFields.length + ' details already saved.', 'assistant');
        } else {
          appendMessage('Let’s get your dental pilot ready. I’ll collect six quick details, show you the pilot terms in plain language, and then take you to secure checkout — first month up front, setup free.', 'assistant');
        }
        appendMessage(signupFields[signup.step].prompt, 'assistant');
        input.placeholder = 'Type your answer…';
        input.focus();
      }

      function addSummaryRow(container, label, value) {
        var row = document.createElement('div');
        var name = document.createElement('b');
        var detail = document.createElement('span');
        name.textContent = label;
        detail.textContent = value;
        row.appendChild(name);
        row.appendChild(detail);
        container.appendChild(row);
      }

      function renderTerms() {
        signup.active = false;
        clearSignupProgress();
        var card = document.createElement('div');
        card.className = 'signup-card';

        var heading = document.createElement('h3');
        heading.textContent = 'Review your pilot';
        card.appendChild(heading);

        var intro = document.createElement('p');
        intro.textContent = 'Your setup details';
        card.appendChild(intro);

        var summary = document.createElement('div');
        summary.className = 'signup-summary';
        signupFields.forEach(function (field) { addSummaryRow(summary, field.label, signup.values[field.key]); });
        card.appendChild(summary);

        var termsHeading = document.createElement('h3');
        termsHeading.textContent = 'Pilot terms, plainly stated';
        card.appendChild(termsHeading);

        var terms = document.createElement('ul');
        terms.className = 'terms-list';
        [
          'Your first month is the pilot. It’s paid up front on your card — $199 (After-Hours Capture) or $299 (24/7 Complete) for this location.',
          'Setup is free. We build Sunny around your office — done-for-you — and you approve test calls before she ever talks to a real patient.',
          'If Sunny doesn’t earn her keep in the first 30 days, email hello@ringandrespond.com and the month comes straight back. Unconditional — no forms, no exit interview.',
          'Every week you get the owner proof report: the calls Sunny caught, what callers requested, and the urgency mix.',
          'After the pilot, your plan continues month-to-month at the same rate unless you cancel by email. No contract, no exit fee, ever.',
          'Sunny captures requests; your team confirms appointments in your own system. No real patient calls happen before your practice’s privacy agreement (BAA) is signed.',
          'Your patients’ information is protected: a signed Business Associate Agreement (BAA) is in place before any patient information flows to Sunny.',
          'Minutes included each month: 500 on After-Hours Capture, 1,000 on 24/7 Complete. Generous minutes included — past them, a small overage of $0.25 a minute.'
        ].forEach(function (text) {
          var item = document.createElement('li');
          item.textContent = text;
          terms.appendChild(item);
        });
        card.appendChild(terms);

        var acceptLabel = document.createElement('label');
        acceptLabel.className = 'terms-accept';
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.setAttribute('aria-label', 'Accept the pilot terms');
        var acceptText = document.createElement('span');
        acceptText.textContent = 'I have authority for this practice and accept the pilot terms above.';
        acceptLabel.appendChild(checkbox);
        acceptLabel.appendChild(acceptText);
        card.appendChild(acceptLabel);

        var checkout = document.createElement('button');
        checkout.type = 'button';
        checkout.className = 'btn btn-primary checkout-button';
        checkout.textContent = 'Start my pilot in Stripe';
        checkout.disabled = true;
        card.appendChild(checkout);

        var checkoutLink = signupCheckoutLink();
        if (!checkoutLink) {
          var placeholder = document.createElement('span');
          placeholder.className = 'placeholder-label';
          placeholder.textContent = 'STRIPE PAYMENT LINK PLACEHOLDER';
          card.appendChild(placeholder);
        }

        var note = document.createElement('p');
        note.className = 'checkout-note';
        note.textContent = 'Your billing details are entered securely in Stripe.';
        card.appendChild(note);

        var restart = document.createElement('button');
        restart.type = 'button';
        restart.className = 'restart-signup';
        restart.textContent = 'Start over and change details';
        card.appendChild(restart);

        checkbox.addEventListener('change', function () { checkout.disabled = !checkbox.checked; });
        checkout.addEventListener('click', function () {
          if (!checkbox.checked) return;
          if (!checkoutLink) {
            appendMessage('The secure Stripe checkout link is being connected. Your signup answers remain in this chat for this session. For immediate help, email ' + contact + '.', 'assistant');
            return;
          }
          window.open(checkoutLink, '_blank', 'noopener');
        });
        restart.addEventListener('click', startSignup);

        log.appendChild(card);
        log.scrollTop = log.scrollHeight;
        input.placeholder = 'Ask another question…';
      }

      function handleSignupAnswer(answer) {
        var field = signupFields[signup.step];
        var problem = validateSignupValue(field, answer);
        if (problem) {
          appendMessage(problem, 'assistant');
          return;
        }
        signup.values[field.key] = answer;
        signup.step += 1;
        saveSignupProgress();
        if (signup.step < signupFields.length) appendMessage(signupFields[signup.step].prompt, 'assistant');
        else {
          appendMessage('Thanks — here is everything together. Please review it before checkout.', 'assistant');
          renderTerms();
        }
      }

      function startCallback() {
        setOpen(true, false);
        callback.active = true;
        callback.step = 0;
        callback.values = {};
        if (chips) chips.hidden = true;
        appendMessage('Of course — three quick things and we will call you back.', 'assistant');
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
          appendMessage('You’re booked in, ' + done.name + ' — we will call ' + done.phone + ' (' + done.time + '). If it’s urgent before then, email us at ' + contact + '.', 'assistant');
        }).catch(function () {
          appendMessage('I couldn’t send that just now — please email us at ' + contact + ' and we will call you back. The demo line is (619) 202-1085 if you’d like to hear Sunny meanwhile.', 'assistant');
        });
      }

      function ask(question) {
        var cleanQuestion = question.trim();
        if (!cleanQuestion) return;
        appendMessage(cleanQuestion, 'visitor');
        if (chips) chips.hidden = true;
        input.value = '';
        if (signup.active) handleSignupAnswer(cleanQuestion);
        else if (callback.active) handleCallbackAnswer(cleanQuestion);
        else {
          var answer = answerFor(cleanQuestion);
          if (answer === '__START_SIGNUP__') startSignup();
          else if (answer === '__START_CALLBACK__') startCallback();
          else if (answer === '__GOTO_demo__' || answer === '__GOTO_pricing__' || answer === '__GOTO_services__') {
            var gotoId = answer.slice(7, answer.length - 2);
            var gotoLines = {
              demo: 'You can hear Sunny on a real call right now — call (619) 202-1085 and talk to her the way a patient would. That’s our live demo line.',
              pricing: 'Taking you to pricing — the whole cost is on the page, nothing hidden.',
              services: 'Taking you to what Sunny does — the three jobs she handles for your front desk.'
            };
            appendMessage(gotoLines[gotoId], 'assistant');
            var gotoEl = document.getElementById(gotoId);
            var gotoUrls = { demo: '/#hero', pricing: '/pricing', services: '/how-it-works' };
            if (gotoEl) gotoEl.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = gotoUrls[gotoId] || '/';
          }
          else appendMessage(answer, 'assistant');
        }
        input.focus();
      }

      launcher.addEventListener('click', function () { setOpen(panel.hidden); });
      closeButton.addEventListener('click', function () { setOpen(false); });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        ask(input.value);
      });
      chips.addEventListener('click', function (event) {
        if (event.target.matches('[data-resume-signup]')) return;
        if (event.target.matches('[data-start-signup]')) startSignup();
        else if (event.target.matches('.starter-chip')) ask(event.target.textContent);
      });
      document.querySelectorAll('[data-start-signup]').forEach(function (button) {
        if (button.closest('#starterChips')) return;
        button.addEventListener('click', function (event) {
          event.preventDefault();
          startSignup();
        });
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !panel.hidden) setOpen(false);
      });
      if (chips && loadSignupProgress()) {
        var resumeChip = document.createElement('button');
        resumeChip.className = 'starter-chip';
        resumeChip.type = 'button';
        resumeChip.setAttribute('data-resume-signup', '');
        resumeChip.textContent = 'Continue my signup';
        resumeChip.addEventListener('click', function () { startSignup(true); });
        chips.insertBefore(resumeChip, chips.firstChild);
      }
      /* Deferred-brain replay: the visitor's first action arrived
         before the brain existed; perform it now. */
      if (state.pendingToggle) { state.pendingToggle = false; setOpen(panel.hidden); }
      if (state.pendingSignup) { state.pendingSignup = false; startSignup(); }
      while (state.pendingAsks.length) ask(state.pendingAsks.shift());
      }
      window.__sunnyChatInitBrain = initBrain;
})();
