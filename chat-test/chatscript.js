
    (function () {
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
      var PILOT_PAGE_URL = 'https://www.ringandrespond.com/pilot.html';
      function signupCheckoutLink() {
        var cov = (signup.values.coverage || '').toLowerCase();
        if (cov.indexOf('both') !== -1 || cov.indexOf('overflow') !== -1 || cov.indexOf('complete') !== -1 || cov.indexOf('24/7') !== -1 || cov.indexOf('24-7') !== -1 || cov.indexOf('daytime') !== -1 || cov.indexOf('lunch') !== -1) return STRIPE_LINK_COMPLETE;
        if (cov.indexOf('after') !== -1 || cov.indexOf('night') !== -1 || cov.indexOf('weekend') !== -1) return STRIPE_LINK_AFTER_HOURS;
        return PILOT_PAGE_URL;
      }

      var signup = { active: false, step: 0, values: {} };
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
          link.href = 'mailto:' + contact + '?subject=Front-Desk%20OS%20question';
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

      var FAQ_INDEX = [["Will this replace my front-desk staff?", "No. It covers calls when your team is busy or closed. Your staff stays in control of scheduling and anything that needs a person."], ["Does it give medical advice?", "No. It records what the caller says and follows your urgent-call rules. It does not diagnose or recommend treatment."], ["Can it use our real hours and services?", "Yes. We set it up with the business details and answers you approve."], ["Do we need a new phone number?", "No. Your office line forwards to your receptionist after hours — set it once on a schedule, or toggle it manually when you close. Daytime calls ring your team like normal."], ["What happens during the free pilot?", "The $499 one-time setup covers building and testing your receptionist. After you approve the test calls, it handles a defined group of calls for two weeks with no monthly charge. The $299 monthly plan starts after the pilot unless you cancel by emailing hello@ringandrespond.com before it ends."], ["Do you integrate with Dentrix?", "We don't need to for the pilot. Sunny hands your team a clean call summary and they confirm in Dentrix the way they already work. Deeper integrations are on our roadmap; the pilot doesn't wait for them."], ["What happens when someone calls my dental office after hours?", "With Ring & Respond, your office line forwards to Sunny after hours. She answers on the second ring, identifies the caller's need, books routine appointments, answers common questions, and routes true emergencies to your on-call dentist. You get a clean summary of every call in the morning."], ["Do I need a new phone number?", "No. Your existing office number forwards to Sunny after hours. Daytime calls ring your team exactly like they do now. Patients never need to learn a new number."], ["How does Sunny handle dental emergencies at night?", "You define what counts as an emergency — severe pain, swelling, trauma, uncontrolled bleeding. Sunny triages with targeted questions and immediately routes true emergencies to your on-call number. Routine calls get booked or messaged without waking anyone."], ["What does after-hours answering cost for a dental office?", "Ring & Respond is $499 one-time setup plus $299/month, with a two-week pilot. If Sunny doesn't earn her keep in the two weeks, the $499 is refunded. Traditional answering services typically run $200–$600/month plus per-minute charges."], ["Will patients know they're talking to an AI?", "Sunny introduces herself as your after-hours assistant and speaks naturally. If a patient asks directly whether she's AI, she answers honestly. Most callers simply get their appointment booked and hang up happy."], ["Does Sunny replace my front-desk staff?", "No. Sunny covers the calls your team can't — evenings, weekends, lunch, and overflow when the desk is busy. Your staff stays focused on in-person patients while Sunny absorbs the phone volume."], ["How fast can we go live?", "Most practices are live within days. We configure Sunny with your hours, services, emergency rules, and scheduling preferences in a 2-minute onboarding, then you forward your line after hours."], ["What if Sunny can't handle a call?", "She takes a detailed message — name, callback number, and reason — and it's in your inbox before morning. Anything urgent follows your escalation rules immediately, not the next day."], ["Does after-hours answering cover weekends and holidays?", "Yes. Sunny answers on the same schedule you set for weeknights — evenings, weekends, and holidays — whenever your office is closed. Most practices run her every closed hour, because weekend callers are often new patients with no loyalty to anyone yet."], ["Who answers my dental office phones when we're closed?", "With Ring & Respond, it's Sunny: she answers in your practice's name, captures the caller's name, number, reason for the call, and preferred appointment window, and flags anything urgent by your rules. Your team gets the summary in the morning and confirms appointments — nothing goes to voicemail."], ["Can after-hours calls be forwarded from my existing office number?", "Yes. You keep your existing number and set it to forward to Sunny when you close — on a schedule, or with a manual toggle. Daytime calls ring your team exactly as they do now."], ["What information does Sunny collect from after-hours callers?", "Name, callback number, the reason for the call, and the appointment window they'd prefer. She never collects dates of birth, insurance IDs, or Social Security numbers, and urgent callers are told to call 911 or go to urgent care first."], ["What is an AI phone answering service?", "An AI phone answering service uses voice AI to answer your business calls, understand what callers need, and take action — booking appointments, answering questions, taking messages, and routing urgent calls. Unlike voicemail or basic auto-attendants, it holds a real conversation."], ["How is it different from a traditional answering service?", "Traditional services use human operators who take messages for later callbacks. AI services conduct the call itself — resolving routine needs on the spot. The tradeoff: humans handle sensitive or complex situations better; AI answers instantly, handles unlimited simultaneous calls, and costs a predictable flat rate."], ["What can an AI phone answering service actually do?", "Answer every call 24/7, book and reschedule appointments, answer FAQs from approved answers, take detailed messages, route urgent calls per your rules, and log everything. What it shouldn't do: give professional advice outside its scope — good systems hand those calls to humans."], ["How much does an AI phone answering service cost?", "Pricing ranges from about $149/month for basic services to $1,299/month for enterprise platforms, with many vendors hiding prices behind 'custom quotes.' Ring & Respond publishes its pricing: $499 one-time setup plus $299/month flat, no per-minute fees."], ["Do I need new phone numbers or hardware?", "No. Your existing business number forwards to the service — a standard carrier feature. No new hardware, no app your customers need."], ["Will callers know it's AI?", "Modern voice AI sounds natural and introduces itself by role ('I'm Sunny, the after-hours assistant'). If a caller asks directly whether it's AI, honest systems say so. Most callers simply get helped and hang up."], ["Is it secure / HIPAA compliant?", "For healthcare businesses, the vendor must sign a Business Associate Agreement before handling patient calls, and patient data must never train AI models. Our HIPAA and AI receptionists page covers exactly what to ask any vendor."], ["Which businesses benefit most?", "Appointment-based local businesses with high call volume and after-hours demand — dental and medical offices, home services, legal practices, salons. If missed calls cost you customers, an AI answering service usually pays for itself quickly. Our focus is dental offices."], ["Can an AI phone answering service work for a small business with one phone line?", "Yes — one line is where it helps most, because a single line means every busy moment is a missed call. The service answers when you can't, captures the request, and sends you the summary, with no extra hardware."], ["Does an AI answering service really answer 24/7?", "Yes — nights, weekends, and holidays, with no hold queue and no per-minute meter running. For dental offices that's the whole point: roughly 45% of calls arrive outside office hours."], ["How is an AI virtual receptionist different from a website chatbot?", "A chatbot types on your website; an AI virtual receptionist talks on your phone line, in your business's name, following your approved answers. Callers who prefer to phone — still the majority for local services — get a person-like conversation, not a chat window."], ["What happens to the information from each call?", "Every call is captured the same structured way: caller name, callback number, reason for the call, and what they asked for. You get a summary you can act on, instead of a voicemail you have to transcribe."], ["What is the difference between an AI receptionist and a dental answering service?", "A traditional answering service has human operators who take a message for your team to handle later. An AI receptionist like Sunny conducts the call herself — booking appointments, answering questions, and routing emergencies live, following your rules. The difference is what happens after the call is answered: a message slip vs. a handled call."], ["Is an AI receptionist better than a human answering service for dentists?", "For routine and after-hours volume, usually yes: the AI answers instantly with no queue, books directly instead of taking messages, and costs a flat monthly rate. Human services are better at sensitive or complex conversations. Many practices keep their front desk for in-person care and use AI for everything the desk can't cover."], ["Can an AI receptionist book dental appointments?", "Sunny books routine appointments live on the call using your scheduling rules — providers, emergency slots, new vs. existing patients. Anything she can't book becomes a detailed request for your team, not a vague message slip."], ["How much does each option cost?", "Traditional answering services run $200–$600/month plus per-minute charges. AI receptionists range from ~$149 to $1,299/month. Ring & Respond is $499 one-time setup plus $299/month flat, with a two-week money-back pilot."], ["Will patients prefer a human operator?", "Patients prefer whoever solves their problem fastest. An operator who takes a message means waiting until morning; an AI that books the appointment on the spot usually wins. For emotionally sensitive calls, Sunny hands off to your team with full context."], ["What can't an AI receptionist do?", "Honestly: it shouldn't give clinical advice, negotiate billing disputes, or handle deeply upset patients alone. Sunny is configured to recognize those situations and route them to your team immediately — she knows what she doesn't know."], ["Do I need to change my phone number to switch?", "No — for either option. Your existing office number forwards to the service after hours (or whenever you choose). Patients never dial anything new."], ["How do I switch from an answering service to Ring & Respond?", "Point your after-hours forwarding at Sunny instead of the service — a 5-minute change with your phone provider. Cancel the old service per its terms (watch for annual contracts). Most practices run both for a week to compare before cutting over."], ["AI answering service vs live answering service — what's the real difference?", "A live answering service employs operators who take messages, usually billed per minute, with quality that varies by operator and shift. An AI receptionist follows the same approved flow on every call, answers instantly with no hold queue, and is billed flat — but it works within defined rules rather than improvising like a person."], ["Which option handles simultaneous calls better?", "AI, and it isn't close. A live service has a finite operator pool, so a Monday-morning rush means hold music. Sunny answers unlimited simultaneous calls, so five callers at 9 AM get five answered calls."], ["Who writes down what the caller actually needed?", "With a traditional service, you get whatever the operator typed. With Ring & Respond, every call is captured the same way — name, number, reason, requested window — and summarized for your team, so nothing depends on one operator's note-taking."], ["Can I run an AI receptionist and keep my answering service?", "Some practices do during a transition, but it usually doubles cost without doubling coverage. The cleaner test is the two-week pilot: run Sunny against the calls your service handles today and compare the summaries side by side."], ["How much does a dental answering service cost per month?", "Traditional dental answering services typically cost $200–$600/month plus per-minute or per-call charges. AI receptionist services range from about $149 to $1,299/month depending on features. Ring & Respond charges a flat $499 one-time setup plus $299/month with no per-minute fees."], ["Are there hidden fees with dental answering services?", "Often, yes. Traditional services bill per minute ($0.80–$1.50+) or per call, so a busy month costs more than the advertised base rate. Some charge extra for after-hours, weekends, holidays, or appointment booking. Always ask for the all-in cost at your call volume before signing."], ["Is an AI receptionist cheaper than a human answering service?", "Usually. A traditional service at $400/month costs $4,800/year and only takes messages. An AI receptionist in the $299/month range costs $3,588/year and actually books appointments. A part-time in-house hire runs $2,500–$4,000/month plus benefits."], ["What does Ring & Respond cost?", "$499 one-time setup plus $299/month, flat — no per-minute charges, no contracts. Every plan starts with a two-week pilot: if Sunny doesn't earn her keep in the two weeks, the $499 is refunded."], ["How do I calculate the ROI of an answering service?", "Estimate your missed calls per week, multiply by your new-patient booking rate and average first-visit value. Example: 10 missed calls/week × 30% booking rate × $850 first-visit value = ~$2,550/week in recovered revenue potential. Even capturing a fraction of that dwarfs a $299/month cost."], ["Do dental answering services charge extra for after-hours?", "Many traditional services do — evenings, weekends, and holidays often sit on higher tiers or add per-minute surcharges. Ring & Respond covers 24/7/365 at the same flat $299/month."], ["Can I cancel anytime?", "With Ring & Respond, yes — month to month, no long-term contract. Many traditional answering services and enterprise AI platforms lock you into annual terms, so check before you sign."], ["Why do most AI receptionist companies hide their pricing?", "Many vendors price 'custom based on your practice's needs,' which usually means the quote depends on your size and revenue. We publish ours: $499 setup, $299/month, 2-week money-back pilot. You shouldn't need a sales call to learn a price."], ["How much does an AI receptionist cost for a dental practice per month?", "Ring & Respond is $299/month flat after a $499 setup, with a two-week pilot and no monthly charge during it. There are no per-minute fees, so a busy month costs the same as a quiet one — unlike traditional services that meter every call."], ["Do dental answering services charge per minute or per call?", "Most traditional services charge per minute, plus overage rates when you exceed your plan's minutes — which is why bills spike in your busiest months. Flat-rate AI coverage removes the meter, which makes the cost predictable enough to budget against recovered patients."], ["Is the setup fee refundable?", "At Ring & Respond, yes. The $499 setup is refunded if Sunny doesn't earn her keep during the two-week pilot. That structure matters: the vendor carries the risk of proving value, not you."], ["How does an answering service compare with hiring a receptionist?", "A full-time front-desk hire runs roughly $2,750 a month before payroll taxes, benefits, and turnover — and still only covers one call at a time during office hours. An answering service at $299/month covers after-hours, overflow, and simultaneous calls for about a tenth of that."], ["What does a dental answering service do?", "A dental answering service picks up your calls when your team can't — after hours, weekends, lunch, and overflow. Traditional services have human operators who take messages; AI-based services like Ring & Respond conduct the call: booking appointments, answering questions, and routing emergencies per your rules."], ["How much does a dental answering service cost?", "Traditional services run $200–$600/month plus per-minute charges ($0.80–$1.50+/min). AI receptionists range from about $149 to $1,299/month. Our full pricing breakdown is on our dental answering service cost guide. Ring & Respond is $499 setup + $299/month flat, no per-minute fees."], ["Traditional answering service vs AI receptionist — which is better for dentists?", "It depends on what you want the call to accomplish. Traditional services take messages for morning callbacks; AI receptionists resolve calls live — booking appointments and triaging emergencies. Our full AI receptionist vs answering service comparison covers the tradeoffs honestly."], ["Can an answering service book dental appointments?", "Traditional services generally take messages; your team books in the morning. AI services like Sunny book live on the call using your scheduling rules — providers, emergency slots, new vs. existing patients."], ["How do answering services handle dental emergencies?", "Traditional operators follow a script and page your on-call. Sunny triages against your written protocol — pain, swelling, trauma, bleeding — and bridges true emergencies to your on-call number immediately, without waking you for non-urgent calls."], ["What should I ask before signing with an answering service?", "Ask: (1) all-in cost at my call volume, including per-minute charges; (2) after-hours and holiday surcharges; (3) do you book appointments or just take messages; (4) how are emergencies escalated; (5) will you sign a BAA; (6) contract length and cancellation terms; (7) can I trial it before committing."], ["Is there a trial or money-back guarantee?", "Ring & Respond starts every plan with a two-week pilot: if Sunny doesn't earn her keep in the two weeks, the $499 setup is refunded. Most traditional services and enterprise platforms require annual contracts with no trial — check before you sign."], ["What's the difference between a dental phone answering service and a general call center?", "A dental phone answering service is built around dental calls: appointment requests, tooth pain, insurance questions, and practice-specific hours and services. A general call center reads a generic script for any business, which is why callers so often end up as a message slip instead of a captured patient."], ["Is a dental answering service available 24/7?", "It should be — missed calls don't keep office hours. Ring & Respond covers after-hours, weekends, holidays, and daytime overflow in one flat rate, so there's no separate 24/7 tier to buy."], ["How are calls documented for my front desk?", "Every call produces a summary your team can act on: caller name, callback number, reason for the call, and the appointment window requested. Your staff confirm or adjust the appointment in your own system — Sunny captures the request, your office keeps control of the schedule."], ["Can a dental answering service answer in my practice's name?", "Yes. Sunny greets callers with your practice's name and uses your approved answers about hours, services, and policies. Callers hear a consistent front-desk experience, not a third-party call center."], ["What counts as a dental emergency after hours?", "True after-hours emergencies: severe or worsening pain, facial swelling, trauma or knocked-out tooth, uncontrolled bleeding, signs of infection (fever with tooth pain). Lost fillings, dull aches, and cosmetic issues can almost always wait until morning. Your practice defines the exact list — Sunny follows it."], ["Who should answer dental emergency calls at night?", "Every call should be answered — the question is by whom. Options: your cell (exhausting), a traditional answering service (message-taking with callback delay), or an AI receptionist like Sunny that triages immediately and pages your on-call dentist only for true emergencies."], ["How does Sunny triage a dental emergency?", "She asks targeted questions based on your protocol — pain level, swelling, bleeding, trauma — then follows your rules: page the on-call number immediately for true emergencies, or book the next available slot for urgent-but-stable cases. Non-urgent callers get booked without waking anyone."], ["Will Sunny wake me up for non-emergencies?", "No — that's the point of the protocol. You define what pages you and what doesn't. A lost crown at midnight gets a morning appointment; a swollen face with fever gets you on the phone in seconds."], ["Can patients reach the on-call dentist directly?", "Only through your escalation rules. Sunny never hands out the on-call number — she bridges the urgent call to it herself, so your personal number stays private and only true emergencies come through."], ["What happens with emergency calls on weekends and holidays?", "Same as weeknights: Sunny answers 24/7/365, triages against your protocol, and escalates true emergencies to whoever is on call that day. Your holiday coverage is configured per-date in onboarding."], ["Does Sunny give medical advice?", "No. Sunny never diagnoses or prescribes — she gathers information, applies your triage rules, and routes. Anything clinical goes straight to your on-call dentist."], ["How much does after-hours emergency coverage cost?", "Ring & Respond is $499 one-time setup plus $299/month flat — 24/7/365 answering, emergency triage, and on-call escalation included. No per-minute fees, no holiday surcharges. The two-week pilot is money-back."], ["What should a dental office's after-hours emergency protocol include?", "Four things: which symptoms count as urgent, what the caller is told first (life-threatening symptoms go to 911 or urgent care), how the on-call dentist is reached for true emergencies, and a written record of every call for the morning. Sunny follows the protocol you approve — she doesn't improvise it."], ["How are emergency calls routed to the on-call dentist?", "By your rules. If a caller's situation matches your urgent criteria, Sunny flags it for the on-call route you've set and makes sure the caller knows the next step. Non-urgent callers are captured for a morning callback instead of waking anyone at 2 AM."], ["What's the difference between an urgent and a non-urgent after-hours call?", "Urgent means uncontrolled bleeding, swelling that affects breathing or vision, trauma to the face or jaw, or pain that can't be managed — those need care now. A chipped tooth with no pain or a lost filling is usually a first-appointment-in-the-morning call. Your protocol draws the line; Sunny applies it consistently."], ["Should emergency callers ever be told to call 911?", "Yes — for anything life-threatening, like swelling that is closing an airway or heavy bleeding that won't stop, the right instruction is 911 or urgent care immediately, not a callback queue. Sunny says exactly that, and still flags the call for your office."], ["Why is my dental front desk always overwhelmed?", "Because the front desk has two full-time jobs: in-person patients and the phones. Industry data shows dental practices miss 32–38% of calls — most during business hours, when staff are with patients. The phones don't pause for check-ins, and check-ins don't pause for the phones."], ["Should I hire another front-desk person to handle phones?", "A hire costs $2,500–$4,000/month plus benefits, takes weeks to train, and still leaves nights, weekends, and lunch uncovered. If the problem is call volume rather than in-person workload, adding phone coverage — not headcount — is usually the cheaper fix."], ["How do I reduce phone interruptions for my front desk?", "Route routine calls — scheduling, hours, insurance questions, reschedules — to a dedicated handler. Sunny, our AI receptionist, absorbs that volume 24/7, so your team handles the phones only when a human is truly needed."], ["What calls take up the most front-desk time?", "Appointment scheduling and rescheduling, insurance and pricing questions, hours and directions, and confirmation callbacks. The vast majority are routine and repeatable — exactly the calls an AI receptionist handles well."], ["Will an AI receptionist replace my front-desk staff?", "No. Sunny handles the phones; your team handles the people in front of them. Practices that add AI coverage typically find their staff less stressed and more present — not redundant."], ["Does phone overload cause staff turnover?", "Front-desk burnout is one of the most cited reasons for dental staff turnover: constant interruptions, angry callers who waited on hold, and the impossible choice between the patient in front of them and the ringing phone. Removing the phone burden is a retention move."], ["Can Sunny handle calls during office hours too?", "Yes. Many practices use Sunny for daytime overflow and lunch coverage in addition to after-hours. Your team takes the calls they want; Sunny absorbs the rest — including the 3 PM rush when everyone's with patients."], ["What does it cost to take phones off my team's plate?", "Ring & Respond is $499 one-time setup plus $299/month flat — 24/7 call handling with live booking. Compare that to $2,500–$4,000/month for another hire, and the two-week pilot is money-back."], ["How does phone overload affect front-desk staff turnover?", "Constant interruption is one of the most-cited frustrations in front-desk roles: every ring pulls attention from the patient standing in front of them. Practices that cut phone pressure keep experienced staff longer — and experienced front-desk staff are hard to replace."], ["What happens to patients in the office when the phone won't stop ringing?", "They wait, they watch check-in slow down, and they feel like they're competing with the phone for attention. Overflow coverage protects the in-office experience as much as the caller experience — your team can finish a conversation without a ring cutting through it."], ["Can overflow coverage help without hiring more staff?", "Yes. Overflow handling answers the calls your current team can't reach, during the day and after hours, for $299/month flat — a fraction of another hire, with no training period and no schedule to manage."], ["How do I know if my front desk has a phone problem?", "Check three numbers: how many calls go unanswered in your phone log, how many arrive at lunch and after hours, and how often patients mention hold time in reviews. If any of the three surprises you, the phones are costing more than they look."], ["How many calls do dental offices miss?", "Industry call-tracking studies put the missed-call rate for dental practices at 32–38%. In one study of 4,280 calls across 26 practices, 38% went unanswered — mostly during business hours when the front desk was busy, plus all after-hours volume."], ["Do patients leave voicemails or call back?", "Most don't. Only about 14% of new patients leave a voicemail, and the majority call the next practice on their list instead. A missed call is usually a lost patient, not a delayed one."], ["What is a missed new-patient call worth?", "A single new patient represents the first visit plus years of cleanings, potential major work, and referrals — industry estimates put lifetime value at $3,000 or more. One missed implant or Invisalign inquiry can exceed $5,000."], ["When do most missed calls happen?", "Two peaks: during business hours when the front desk is with in-person patients (calls ring out or hit hold), and after hours — roughly 45% of patient calls come outside office hours, when nobody is there to answer at all."], ["How do I find out how many calls my office misses?", "Check your phone system's call log for unanswered and abandoned calls over 30 days, and compare against appointments booked from phone inquiries. Most practice owners are surprised — the number is almost always higher than the front desk estimates."], ["Can an AI receptionist really recover missed calls?", "It doesn't recover them — it prevents them. Sunny answers on the second ring, 24/7, so the call is never missed in the first place. Routine calls get booked live; everything else becomes a detailed request instead of a hang-up."], ["Isn't hiring another front-desk person the fix?", "A hire covers office hours at $2,500–$4,000/month plus benefits — and still leaves nights, weekends, and lunch uncovered. Most practices find the phone problem is coverage, not headcount."], ["What does it cost to stop missing calls?", "Ring & Respond is $499 one-time setup plus $299/month flat — 24/7 answering with live booking and emergency routing. The two-week pilot is money-back: if Sunny doesn't earn her keep, the $499 is refunded."], ["What percentage of dental calls go unanswered after hours?", "Effectively all of them, at most practices — the office is closed and the call lands in voicemail. That's why after-hours is the largest slice of the 32–38% of dental calls that go unanswered overall: roughly 45% of calls arrive outside office hours."], ["How much revenue does a practice lose from missed calls in a year?", "Run your own numbers: missed new-patient calls per month, times your average case value, times twelve. With patient lifetime value commonly cited at $3,000 or more, even two lost new patients a month is a five-figure annual leak — against $299 a month to close it."], ["Do new patients really call the next office instead of leaving a voicemail?", "Yes — industry data puts voicemail rates at roughly 14% of callers, and new patients have no loyalty to your practice yet. When the first office doesn't answer, the second one usually gets the appointment."], ["How can I calculate what missed calls cost my practice?", "Ask your phone provider for a 30-day call log and count unanswered calls and calls under ten seconds. Multiply the new-patient share by your average first-visit value. Most owners are surprised by the number — it's the fastest way to see whether answering coverage pays for itself."], ["How many new patients call after hours?", "Roughly 45% of all patient calls arrive outside business hours — and new patients disproportionately call in the evening, when they're off work and comparing practices. Those are the highest-intent callers you'll ever get, and they're calling when your office is dark."], ["Do new patients leave voicemails?", "Only about 14% do. The rest hang up and call the next practice on their list. A new patient who reaches voicemail is not a callback for tomorrow — they're someone else's patient by tomorrow."], ["What does a new patient ask on the first call?", "The same five things: Are you taking new patients? Do you take my insurance? Where are you located? When's your next opening? How much will it cost? Sunny answers all five from your approved answers, then books the visit — in one call."], ["Can an AI book a new patient appointment?", "Yes. Sunny books new-patient visits live on the call using your scheduling rules — providers, new-patient blocks, emergency slots. She collects the details your team needs (insurance, reason for visit, contact info) so the appointment arrives complete."], ["What about high-value calls like implants or Invisalign?", "Those are exactly the calls you can't afford to miss — a single implant case can be worth $3,000–$6,000. Sunny treats every new-patient call as high priority: answered on the second ring, booked or captured with full detail, flagged in your morning summary."], ["Will new patients trust an AI on the first call?", "New patients judge the call by one thing: did I get my appointment? Sunny introduces herself as your after-hours assistant, answers their questions, and books them. Callers who get booked in 90 seconds don't ask about the technology — they show up on Tuesday."], ["How fast should a practice respond to a new patient inquiry?", "Immediately. Every minute of delay drops conversion — and voicemail is an infinite delay. Live answer is the only response time that consistently wins the patient."], ["What does new-patient call coverage cost?", "Ring & Respond is $499 one-time setup plus $299/month flat — 24/7 answering, live booking, and new-patient intake included. One captured implant consultation can cover years of the service. The two-week pilot is money-back."], ["How do dental offices lose new patients on the phone?", "Three ways: the call isn't answered at all, it lands in voicemail (only about 14% of callers leave one), or it's answered rushed by a busy front desk. New patients judge the practice by that first call — a competitor who answers warmly wins the appointment."], ["What information should be captured on a new patient call?", "Name, callback number, what they're calling about, and the appointment window they prefer. That's enough for your team to confirm the booking in the morning. Insurance IDs and dates of birth stay out of the first call — your office collects those through its own process."], ["Are high-value calls like implants or Invisalign handled differently?", "They're captured with the same care and flagged in the summary, so your team sees 'implant consult request' at the top of the morning list, not buried in voicemail. One booked implant case can cover years of answering coverage."], ["How quickly does the office see new patient calls?", "Every call is logged as it happens and summarized for your team, so the morning starts with a complete list — who called, what they need, and the number to reach them — instead of a voicemail box and guesswork."], ["What is overflow call handling for a dental office?", "Overflow call handling answers the calls your front desk can't get to — when both lines are busy, the team is with patients, or it's lunch hour. Instead of ringing out or hitting hold, the extra calls route to Sunny, who answers, books, and logs everything."], ["When do dental offices get the most overflow calls?", "Monday mornings (weekend backlog), lunch hours (staff away from desks), late afternoons (after-school appointment rush), post-holiday reopenings, and any time a marketing campaign or Google profile update drives a spike."], ["How does overflow routing work technically?", "Your phone system forwards unanswered or busy calls to Sunny after a set number of rings — typically 3–4. Your team answers what they can; everything else is caught automatically. No new number, no new hardware."], ["Does overflow handling work during office hours?", "That's exactly what it's for. After-hours coverage is a separate schedule; overflow handling runs during the day, catching whatever rings past your team — including the lunch hour when the desk is empty."], ["Will callers notice they've been routed?", "They'll notice someone picked up on the fourth ring instead of the tenth — and that's the whole point. Sunny answers in your practice's name, handles the call, and your team sees the booking or summary."], ["Can overflow handle multiple simultaneous calls?", "Yes — unlimited simultaneous calls. A Monday-morning rush with five callers at once means five answered calls, not four people on hold and one hang-up."], ["What does overflow call handling cost?", "It's included in Ring & Respond's flat $499 setup + $299/month — daytime overflow, lunch coverage, and after-hours answering all in one rate. No per-minute fees, so a rush hour costs the same as a quiet one."], ["How is this different from just letting voicemail catch it?", "Voicemail catches the call; overflow handling resolves it. A voicemail is a callback your team owes tomorrow. An overflow-answered call is an appointment already booked — industry data shows only ~14% of new patients leave voicemails anyway."], ["Who answers dental office phones at lunch?", "At most practices, nobody — the desk is empty right when working patients use their own lunch break to call. Overflow coverage answers lunch-hour calls live, captures the request, and hands your team a summary when they're back."], ["Can overflow coverage run only during peak hours?", "Yes. You control the forwarding rules, so overflow can catch calls only at lunch, only on Monday mornings, or whenever lines are busy or unanswered. Most practices end up running it all day once they see the call log."], ["Does overflow handling also cover weekends?", "It can. Weekend calls are usually new patients and emergencies — the two categories you least want in voicemail. The same forwarding setup that catches a Tuesday lunch rush can catch a Saturday morning toothache."], ["What information does the front desk get after an overflow call?", "A summary for every call: who called, their callback number, what they need, and the appointment window they asked for. Your team confirms the booking in your own system — nothing is left as a sticky note or a half-heard message."], ["Is an AI receptionist HIPAA compliant?", "No AI product is compliant by itself — HIPAA compliance depends on how it's deployed: a signed Business Associate Agreement, proper safeguards, and correct data handling. The right question isn't 'is it compliant' but 'will you sign a BAA, and what safeguards surround patient data?' Any vendor that answers with a badge instead of specifics should worry you."], ["What is a BAA and why does my practice need one?", "A Business Associate Agreement is a HIPAA-required contract between your practice and any vendor that handles protected health information on your behalf — including whoever answers your phones. Without a signed BAA, letting a vendor handle patient calls is a compliance gap."], ["Will Ring & Respond sign a BAA with my practice?", "Yes. We execute a Business Associate Agreement with every practice as part of onboarding, before any patient information flows. No PHI moves until the BAA is signed — that's a hard rule, not a preference."], ["What patient information does Sunny actually handle?", "Only what's needed to do the job: caller name, callback number, appointment details, and the reason for the call. She doesn't access your practice management system, billing records, or clinical notes."], ["Is call audio stored, and where?", "Call handling runs through our voice AI provider, with whom we maintain a BAA. Recordings and transcripts are governed by your BAA terms, including retention and deletion. We can discuss your specific retention requirements during onboarding."], ["Is patient data used to train AI models?", "No. Patient call data is never used to train models — not ours, not our providers'. This is a contractual commitment in our vendor agreements, not just a policy."], ["What questions should I ask any AI receptionist vendor about HIPAA?", "Ask: (1) Will you sign a BAA before any PHI flows? (2) Which sub-vendors touch patient data, and do you have BAAs with them? (3) Is call data used for model training? (4) Where is data stored and how long is it retained? (5) What happens to data if we cancel? Get the answers in writing."], ["Does the AI need to identify itself to callers?", "Disclosure rules vary by state — California, for example, has specific bot-disclosure requirements. Sunny introduces herself as your after-hours assistant and answers honestly if a caller asks whether she's AI. We recommend every practice confirm the current requirements with their own attorney."], ["What should a BAA with an AI receptionist vendor cover?", "How patient information may be used and disclosed, the safeguards protecting it, breach reporting duties, what happens to data when the contract ends, and whether any subcontractors touch the data. If a vendor can't walk through each point in plain language, that's your answer."], ["Is a dental answering service HIPAA compliant by default?", "No — no service is compliant by default. Handling patient calls in a HIPAA-aligned way requires a signed business associate agreement, defined safeguards, and disciplined data handling: what is collected, how long it's kept, and who can see it. Ask every vendor, including us, to show you the process rather than a badge."], ["What patient information does Sunny never collect?", "Dates of birth, insurance ID numbers, and Social Security numbers. Sunny captures what's needed to help the caller — name, callback number, reason for the call, and preferred appointment window — and the office handles anything sensitive through its own channels."], ["Who is responsible if patient data is mishandled?", "Responsibility is shared and it's spelled out in the BAA: your practice remains responsible for its patients' data, and the vendor is responsible for its handling as a business associate. That's exactly why the agreement and the safeguards behind it matter more than marketing claims."], ["How does an AI receptionist work for a dental office?", "Your office number forwards to Sunny when you choose — after hours, overflow, or 24/7. She answers in your practice's name, understands the caller's request, books appointments per your rules, answers routine questions from your approved answers, triages emergencies against your protocol, and sends you a summary of every call."], ["How long does setup take?", "Most practices go live within days. Onboarding is a 2-minute questionnaire: hours, services, new-patient policy, emergency rules, scheduling preferences, and anything Sunny should never say. Then you forward your line."], ["How does Sunny book appointments?", "Using your scheduling rules — which providers take new patients, where new-patient blocks go, how emergency slots work. She collects the details your team needs (name, number, insurance, reason for visit) so every booking arrives complete."], ["What happens when Sunny can't handle a call?", "She doesn't guess. Anything outside her scope — clinical questions, billing disputes, upset callers — becomes a detailed request with full context for your team, or an immediate escalation if it's urgent."], ["Can I change what Sunny says?", "Yes. Your answers to hours, services, insurance, pricing guidance, and emergency rules are all configurable, and updates apply to future calls. Tell us what to change and it's done."], ["Does it work with my practice management software?", "Sunny works from the scheduling rules you define, so she doesn't require PMS integration to start booking correctly on day one. Tell us which software you run during onboarding and we'll configure the workflow around it."], ["How do I forward my office phones to Sunny after hours?", "It's a setting on your existing phone system: forward unanswered or after-hours calls to Sunny on a schedule, or toggle forwarding when you close. Your number doesn't change, daytime calls ring your team as normal, and we test the routing with you before go-live."], ["What training does Sunny need about my practice?", "Your hours, services, address, insurance approach, and the answers you approve to common questions — collected in a short setup, in your words. If a caller asks something outside the approved answers, Sunny captures the question for your team rather than inventing an answer."], ["Can I hear Sunny before we set anything up?", "Yes — call (619) 202-1085 any time and put her through a normal patient call. Most owners test her with a made-up emergency first, which is exactly the call that matters at 9 PM."], ["What happens if our office changes hours or services later?", "Tell us and the approved answers are updated — holiday hours, a new hygienist, a service you no longer offer. Your team isn't editing software; you send the change and it's reflected in what Sunny says."], ["What does a virtual receptionist do for a dental office?", "A virtual receptionist handles your practice's phone calls remotely — answering on your behalf, booking appointments, taking messages, and routing urgent calls. Human virtual receptionists work scheduled shifts; AI virtual receptionists like Sunny cover 24/7 without shifts, breaks, or sick days."], ["How much does a virtual receptionist cost for a dental office?", "Human virtual receptionist services typically run $300–$1,000+/month depending on minutes and coverage hours. AI receptionists range from about $149 to $1,299/month. Ring & Respond is $499 one-time setup plus $299/month flat — 24/7, no per-minute fees."], ["Human virtual receptionist vs AI — which is better?", "Humans bring judgment and empathy to sensitive calls; AI brings instant pickup, unlimited simultaneous calls, and flat pricing. For routine scheduling and after-hours coverage, AI usually wins on cost and consistency. Many practices use AI for volume and keep humans for in-person care."], ["Can a virtual receptionist book dental appointments?", "Yes. Sunny books live on the call using your scheduling rules — providers, new-patient blocks, emergency slots. Human virtual receptionists can too, though usually through your PMS or a callback workflow rather than instant booking."], ["Does a virtual receptionist work after hours?", "AI virtual receptionists do — 24/7/365 at the flat rate. Human services typically charge premium tiers for evenings, weekends, and holidays, or don't cover them at all."], ["Do I keep my existing phone number?", "Yes. Your office number forwards to the virtual receptionist whenever you choose. Patients never dial anything new."], ["Will patients know it's a virtual receptionist?", "Sunny introduces herself as your after-hours assistant and answers honestly if asked whether she's AI. Most callers just get booked and hang up — the experience feels like a good front desk, not a robot."], ["How quickly can a virtual receptionist start?", "Ring & Respond practices typically go live within days: a 2-minute onboarding captures your hours, services, emergency rules, and scheduling preferences, then you forward your line. Human services often need 1–2 weeks for agent training on your practice."], ["What's the difference between a virtual receptionist and a remote front-desk employee?", "A remote employee is one person working set hours from home — they still get sick, take lunch, and can only take one call at a time. A virtual receptionist service covers the role itself: every call answered, including simultaneous calls, evenings, and weekends, with no hiring or training."], ["Can a virtual receptionist work with Dentrix, Eaglesoft, or Open Dental?", "Sunny captures the appointment request — patient, reason, preferred window — and delivers it to your team, who confirm it in Dentrix, Eaglesoft, Open Dental, or whatever you run. She doesn't write directly into your practice software, and any vendor who promises that on day one deserves a hard follow-up question."], ["Does a virtual receptionist cover lunch breaks and days off?", "Yes — that's one of its main jobs. Lunch hour is when working patients call, and it's exactly when a small front desk is empty. Overflow coverage catches those calls the same way it catches after-hours calls."], ["What does a virtual front desk actually include?", "Call answering in your practice's name, appointment-request capture, emergency flagging by your rules, and a morning summary of everything that came in. With Ring & Respond it's one flat $299/month after the $499 setup — no per-minute metering."]];

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
          return 'If a caller describes a true emergency, Sunny tells them to call 911 or go to urgent care right away. Urgent dental problems — severe pain, swelling, a knocked-out tooth — get flagged as top priority on your team’s morning list.';
        }
        if (includesAny(q, ['dentrix', 'eaglesoft', 'open dental', 'curve dental', 'denticon', 'carestack', 'software', 'pms', 'integrate', 'integration', 'compatible'])) {
          return 'Sunny works alongside the software you already run — Dentrix, Eaglesoft, Open Dental, Curve Dental. She captures the caller’s name, number, and request, and your team confirms it in your own system in the morning. No migration, no new logins. Deeper integrations are on our roadmap.';
        }
        if (includesAny(q, ['hipaa', 'baa', 'privacy', 'private', 'secure', 'security', 'patient data', 'recording', 'recorded'])) {
          return 'Privacy is built into the pilot: we sign a business associate agreement (BAA) with your practice before real patient calls, calls are recorded only so your team can follow up, and Sunny never asks for Social Security numbers, insurance IDs, or dates of birth.';
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
          return 'Setup is white-glove: we build Sunny around your hours, services, FAQs, and call rules, you approve a few test calls, and then the two-week pilot starts. Most offices are ready within a few days, and your team does almost none of the work.';
        }
        if (includesAny(q, ['greeting', 'custom', 'script', 'my hours', 'my services', 'our hours', 'our services', 'real hours', 'real services', 'faq', 'train', 'teach her', 'program her'])) {
          return 'Everything is built around your office: your greeting, your hours, your services, your FAQs, and your call rules. You approve test calls before Sunny ever talks to a real patient.';
        }
        if (includesAny(q, ['hours', '24 7', '24/7', 'weekend', 'sunday', 'saturday', 'holiday', 'overnight', 'after hours', 'after-hours', 'lunch', 'closed', 'busy', 'overflow', 'every call', 'always answers', 'never miss', 'sick', 'vacation'])) {
          return 'Sunny covers the hours your team can’t: nights, weekends, holidays, lunch breaks, and the busy stretches when phones ring off the hook. She never sleeps and never calls out. Whenever you’re open and available, your staff handles calls exactly as they do now.';
        }
        if (includesAny(q, ['remind', 'reminder', 'outbound', 'call patients', 'confirmation call'])) {
          return 'Not yet — Sunny handles inbound calls today. Outbound appointment reminders are on our roadmap; for now she captures every inbound request so your team can confirm and follow up the way you already do.';
        }
        if (includesAny(q, ['appointment', 'booking', 'reschedule', 'schedule a', 'schedule an', 'book a', 'book an', 'make an appointment', 'cancel my appointment', 'cancel an appointment', 'calendar', 'book into', 'book directly', 'directly into'])) {
          return 'Sunny captures the appointment request — name, callback number, what they need, and the time they’d like — and your team confirms it in your own software. She never promises a slot that isn’t confirmed, so there are no double-bookings.';
        }
        if (includesAny(q, ['what information', 'what does she collect', 'what details', 'does she collect', 'does she ask', 'intake', 'information does she'])) {
          return 'On every call Sunny captures the caller’s name, callback number, whether they’re a new or existing patient, the reason for calling, and the day and time window they’d prefer — so your team starts the morning with a ready callback list, not a pile of voicemails.';
        }
        if (includesAny(q, ['summary', 'summaries', 'report', 'transcript', 'callback list', 'morning', 'what do i get', 'what do we get', 'what does the office get', 'what happens after', 'follow up list', 'follow-up list', 'how do i know', 'will i know'])) {
          return 'After every call you get a clean summary: the caller’s name, callback number, what they need, how urgent it is, and the time they asked for. Urgent calls are flagged, and your team starts the morning with one organized callback list.';
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
        if (includesAny(q, ['price', 'pricing', 'cost', 'how much', '$299', '$399', '$499', 'per month', 'monthly', 'subscription', 'fees', 'charge', 'pay', 'payment', 'billing', 'plans'])) {
          return 'The one-time setup is $499 — fully refundable if the two-week pilot doesn’t prove itself. After setup, the service itself is free for two weeks. The $299/month voice plan starts after the pilot unless you cancel before it ends.';
        }
        if (includesAny(q, ['pilot', 'trial', 'try it', 'two week', '2 week', 'free trial', 'free pilot', 'free'])) {
          return 'We build the receptionist with your hours, services, FAQs, and call rules. You approve test calls, then run a two-week pilot with no monthly charge — the $499 setup is fully refundable if it doesn’t prove itself. The $299/month plan starts after the pilot unless you cancel before it ends.';
        }
        if (includesAny(q, ['refund', 'money back', 'guarantee', 'cancel', 'contract', 'commitment', 'locked in'])) {
          return 'The $499 setup is fully refundable — if Sunny doesn’t earn her keep during the two-week pilot, it comes straight back. After the pilot, the $299/month plan is month-to-month and you can cancel anytime. No long contract.';
        }
        if (includesAny(q, ['insurance', 'insured', 'ppo', 'hmo', 'in network', 'in-network'])) {
          return 'Sunny answers from the practice information you approve — including the insurance basics you give us — and logs anything she can’t answer for a morning callback, so callers always get accurate information from your team.';
        }
        if (includesAny(q, ['answering service', 'call center', 'human receptionist', 'real receptionist', 'difference', 'compare', 'versus', 'vs ', 'voicemail', 'voice mail'])) {
          return 'A human answering service typically runs $280–$610/month to take messages. Sunny answers instantly, holds a real conversation, captures and validates the caller’s details, and sorts urgency before your office opens. And unlike voicemail — which about 86% of callers never leave — she actually picks up.';
        }
        if (includesAny(q, ['missed call', 'miss a call', 'missed calls', 'unanswered', 'dont answer', 'do not answer', 'nobody answers', 'no one answers'])) {
          return 'That’s exactly the problem Sunny removes: she answers when your team is busy or closed, captures the caller’s details, and puts them on your morning callback list — so a missed call stops meaning a lost patient.';
        }
        if (includesAny(q, ['text back', 'text-back', 'textback', 'text message', 'sms', 'texting', 'send a text', 'send texts'])) {
          return 'Missed-call text-back is coming soon as part of Front-Desk OS — it isn’t part of today’s voice pilot. Today, Sunny answers the call live, so there’s usually nothing to text back about.';
        }
        if (includesAny(q, ['review', 'google', 'yelp', 'rating', 'feedback'])) {
          return 'The review tool is coming soon. It will ask happy customers for a Google review and help you draft replies.';
        }
        if (includesAny(q, ['worth it', 'roi', 'how many calls do', 'percentage of calls', 'missed calls cost', 'lose money', 'losing patients', 'statistics'])) {
          return 'The math is why offices do this: about 38% of dental calls go unanswered, and most callers never leave a voicemail — they call the next office. One saved new patient is worth $3,000+ over their lifetime, so Sunny only has to rescue one patient a month to pay for herself many times over.';
        }
        if (includesAny(q, ['hire', 'hiring', 'another receptionist', 'front desk person', 'employee cost', 'staff cost'])) {
          return 'A full-time front-desk hire runs roughly $2,750/month before benefits — and still sleeps, takes lunch, and calls out sick. Sunny covers the gaps for $299/month and never misses a shift. Most offices use her alongside their team, not instead of them.';
        }
        if (includesAny(q, ['two offices', 'two locations', 'multiple offices', 'multiple locations', 'second office', 'both offices', 'both locations'])) {
          return 'One setup can cover two offices — the $499 setup fee covers both locations for the pilot, and each office keeps its own greeting and call rules.';
        }
        if (includesAny(q, ['san diego', 'where are you', 'located', 'your area', 'service area', 'near me', 'who are you', 'your company', 'ring and respond'])) {
          return 'We’re Ring & Respond, based in the San Diego area, onboarding local dental offices for pilots right now. Sunny is our AI receptionist — the voice part of Front-Desk OS, our front-desk platform for local service businesses.';
        }
        if (includesAny(q, ['spanish', 'espanol', 'arabic', 'farsi', 'dari', 'persian', 'language', 'bilingual', 'languages'])) {
          return 'Sunny speaks English, Spanish, Arabic, and Farsi (Persian). She greets in English and switches the moment your patient speaks one of the other three — then stays in their language for the whole call. Try her on the demo line: (619) 202-1085.';
        }
        if (includesAny(q, ['new patient', 'existing patient', 'first time caller', 'first-time caller'])) {
          return 'She asks whether the caller is a new or existing patient and logs it in the summary — so your team can welcome first-time callers properly and see the new-patient calls Sunny rescued overnight.';
        }
        if (includesAny(q, ['what can sunny do', 'what does sunny do', 'what can she do', 'what does she do', 'capabilities', 'abilities', 'features', 'everything', 'what do you offer', 'what does it include', 'services include', 'full list'])) {
          return 'Here’s Sunny in one breath: she answers every call your office misses — nights, weekends, lunch, busy hours — on your own number. She holds a natural conversation, captures the name, validated callback number, new-or-existing status, reason, and preferred time, sorts urgency into tiers (true emergencies go straight to 911), answers your approved FAQs, and hands your team a clean morning callback list. She never diagnoses and never pretends to book — your team confirms in your own system.';
        }
        if (includesAny(q, ['sunny', 'glow', 'voice', 'receptionist', 'answer calls', 'phone'])) {
          return 'Sunny is the dental AI receptionist available for pilots now. It answers after-hours or overflow calls, handles approved FAQs, captures caller details, and organizes the next step for your team.';
        }
        if (includesAny(q, ['who is it for', 'who it is for', 'dentist', 'dental', 'med spa', 'medspa', 'local business', 'service business', 'industry', 'orthodontist', 'endodontist'])) {
          return 'The current pilot is for dental offices. Front-Desk OS can later expand to med spas and other local service businesses.';
        }
        if (includesAny(q, ['what is', 'what does', 'how does', 'how it works', 'explain', 'tell me about', 'module', 'service', 'front-desk os', 'front desk os'])) {
          return 'Front-Desk OS starts with an AI receptionist that answers calls and collects customer details. Missed-call text-back and review tools are coming later.';
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
          appendMessage('Let’s get your dental pilot ready. I’ll collect six quick details, show you the pilot terms in plain language, and then take you to the $499 Stripe setup checkout.', 'assistant');
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
          '$499 is the one-time setup payment for this location.',
          'The $499 setup is fully refundable if the pilot doesn’t prove itself — email hello@ringandrespond.com before the two weeks end.',
          'Your two-week service pilot starts after setup, testing, and your approval.',
          'There is no monthly charge during the pilot.',
          'After the pilot, the voice plan continues at $299/month unless you cancel by email before the pilot ends.',
          'The receptionist follows your approved information and call rules; it does not give medical advice.'
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
        checkout.textContent = 'Pay $499 setup in Stripe';
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

      function ask(question) {
        var cleanQuestion = question.trim();
        if (!cleanQuestion) return;
        appendMessage(cleanQuestion, 'visitor');
        if (chips) chips.hidden = true;
        input.value = '';
        if (signup.active) handleSignupAnswer(cleanQuestion);
        else {
          var answer = answerFor(cleanQuestion);
          if (answer === '__START_SIGNUP__') startSignup();
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
    }());
  