<script>
    (function () {
      /* sunny-chat-shell — deferred brain, external file (2026-10-29):
         the launcher button and the panel markup are static HTML -
         they render instantly with the page. Everything the chat
         KNOWS (the 183-pair knowledge base, the answer engine, the
         signup/callback flows) lives in ONE shared, cacheable file,
         /chat-brain.js (generated from chat-source/chat-brain.frag;
         the ?v= below is its content hash, stamped by sync-chat.py).
         This shell fetches that file on the first wake: a tap, click,
         hover, or keyboard focus on the launcher; a click on a "start
         signup" CTA or starter chip; a submitted question; a
         programmatic launcher click (the timed nudge bubble calls
         launcher.click()); or the browser going idle after the page
         has loaded (requestIdleCallback with a 2.5s timeout, armed at
         window load so the wake never lands inside the page's own
         critical load; the brain is awake before anyone realistically
         taps). Anything that happens while the file is in flight is
         queued here and replayed by the brain the moment it
         initializes - no lost first message, no dead first click. */
      var BRAIN_URL = '/chat-brain.js?v=__SUNNY_BRAIN_V__';
      var shellLauncher = document.getElementById('chatLauncher');
      var shellForm = document.getElementById('chatForm');
      var shellInput = document.getElementById('chatInput');
      var shellChips = document.getElementById('starterChips');
      var brainLoading = false;
      var brainAwake = false;
      var pendingToggle = false;
      var pendingSignup = false;
      var pendingAsks = [];

      function ensureBrain() {
        if (brainAwake || brainLoading) return;
        brainLoading = true;
        var script = document.createElement('script');
        script.src = BRAIN_URL;
        script.async = true;
        script.onload = function () {
          brainAwake = true;
          if (window.__sunnyChatInitBrain) {
            window.__sunnyChatInitBrain({
              pendingToggle: pendingToggle,
              pendingSignup: pendingSignup,
              pendingAsks: pendingAsks
            });
          }
        };
        script.onerror = function () { brainLoading = false; };
        (document.head || document.documentElement).appendChild(script);
      }

      if (shellLauncher) {
        shellLauncher.addEventListener('pointerdown', ensureBrain);
        shellLauncher.addEventListener('touchstart', ensureBrain, { passive: true });
        shellLauncher.addEventListener('mouseenter', ensureBrain);
        shellLauncher.addEventListener('focus', ensureBrain);
        shellLauncher.addEventListener('click', function (event) {
          if (brainAwake) return;
          pendingToggle = true;
          if (event.stopImmediatePropagation) event.stopImmediatePropagation();
          ensureBrain();
        });
      }
      if (shellForm) {
        shellForm.addEventListener('submit', function (event) {
          if (brainAwake) return;
          event.preventDefault();
          pendingAsks.push(shellInput ? shellInput.value : '');
          if (event.stopImmediatePropagation) event.stopImmediatePropagation();
          ensureBrain();
        });
      }
      if (shellChips) {
        shellChips.addEventListener('click', function (event) {
          if (brainAwake) return;
          if (event.target.matches('[data-resume-signup]')) return;
          if (event.target.matches('[data-start-signup]')) {
            pendingSignup = true;
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            ensureBrain();
          } else if (event.target.matches('.starter-chip')) {
            pendingAsks.push(event.target.textContent);
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            ensureBrain();
          }
        });
      }
      document.querySelectorAll('[data-start-signup]').forEach(function (button) {
        if (button.closest('#starterChips')) return;
        button.addEventListener('click', function (event) {
          if (brainAwake) return;
          event.preventDefault();
          pendingSignup = true;
          if (event.stopImmediatePropagation) event.stopImmediatePropagation();
          ensureBrain();
        });
      });
      function armIdleWake() {
        if (typeof requestIdleCallback === 'function') requestIdleCallback(ensureBrain, { timeout: 2500 });
        else setTimeout(ensureBrain, 2500);
      }
      if (document.readyState === 'complete') armIdleWake();
      else window.addEventListener('load', armIdleWake);
    }());
  </script>
