<button class="chat-launcher" id="chatLauncher" type="button" aria-expanded="false" aria-controls="chatPanel">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
    <span>Ask a question</span>
  </button>

  <section class="chat-panel" id="chatPanel" role="dialog" aria-label="Front-Desk OS quick answers" hidden>
    <div class="chat-header">
      <div><strong>Your pilot guide</strong><span>Questions, signup, and checkout</span></div>
      <button class="chat-close" id="chatClose" type="button" aria-label="Close chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <div class="chat-log" id="chatLog" aria-live="polite" aria-relevant="additions">
      <div class="message assistant">Hi! I’m an automated assistant. Ask me about Sunny, what the pilot costs, how buying works, finding your way around the site — or I can guide you through signup right here.</div>
      <div class="starter-chips" id="starterChips" aria-label="Suggested questions">
        <button class="starter-chip" type="button" data-start-signup>Start my pilot</button>
        <button class="starter-chip" type="button">What can Sunny do?</button>
        <button class="starter-chip" type="button">How does buying work?</button>
        <button class="starter-chip" type="button">What does it cost?</button>
        <button class="starter-chip" type="button">Hear the demo</button>
        <button class="starter-chip" type="button">Have Yama call me</button>
      </div>
    </div>
    <form class="chat-form" id="chatForm">
      <label class="skip" for="chatInput">Ask about Front-Desk OS</label>
      <input id="chatInput" name="question" type="text" maxlength="180" autocomplete="off" placeholder="Type your question…" required />
      <button class="chat-send" type="submit" aria-label="Send question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
      </button>
    </form>
    <p class="chat-footnote">You’re chatting with an automated assistant, not a person — California law asks us to say so plainly. For a human, email <a href="mailto:hello@ringandrespond.com">hello@ringandrespond.com</a> or type ‘call me’ here and Yama will call you.</p>
  </section>