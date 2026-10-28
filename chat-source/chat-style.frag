<style>
/* Sunny site chat — identical to the homepage chat (panel, knowledge base, signup + callback). */
:root{--paper:#f5faf7;--surface:#ffffff;--surface-2:#e9f3ee;--muted:#4d625d;--teal-dark:#07564f;--shadow:0 18px 52px rgba(19,45,40,.12)}
    .skip { position: absolute; left: 8px; top: 8px; z-index: 100; transform: translateY(-180%); background: var(--surface); padding: 10px 14px; }
    .skip:focus { transform: translateY(0); }
    .chat-launcher {
      position: fixed; right: 22px; bottom: calc(22px + env(safe-area-inset-bottom)); z-index: 50;
      min-height: 52px; padding: 0 19px; border: 1.5px solid var(--line); border-radius: 999px;
      display: inline-flex; align-items: center; gap: 9px; cursor: pointer;
      background: var(--surface); color: var(--ink); box-shadow: 0 6px 20px rgba(16, 36, 32, .08);
      font: 700 14px "DM Sans", sans-serif;
    }
    .chat-launcher svg { width: 19px; height: 19px; }
    .chat-launcher[aria-expanded="true"] { background: var(--surface-2); }
    .chat-panel {
      position: fixed; right: 22px; bottom: calc(86px + env(safe-area-inset-bottom)); z-index: 49;
      width: min(380px, calc(100vw - 28px)); max-height: min(590px, calc(100dvh - 110px));
      display: grid; grid-template-rows: auto minmax(0, 1fr) auto auto; padding: 0;
      overflow: hidden; border: 1px solid var(--line); border-radius: 22px;
      background: var(--surface); box-shadow: 0 24px 70px rgba(16, 36, 32, .22);
    }
    .chat-panel[hidden] { display: none; }
    .chat-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 18px 18px 15px; border-bottom: 1px solid var(--line); }
    .chat-header strong { display: block; font-family: "Archivo", sans-serif; font-size: 17px; }
    .chat-header span { display: block; color: var(--muted); font-size: 12px; }
    .chat-close { width: 36px; height: 36px; border: 0; border-radius: 50%; display: grid; place-items: center; cursor: pointer; background: var(--surface-2); color: var(--ink); }
    .chat-close svg { width: 17px; height: 17px; }
    .chat-log { min-height: 220px; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 11px; overscroll-behavior: contain; }
    .message { max-width: 88%; padding: 11px 13px; border-radius: 15px; font-size: 14px; line-height: 1.45; }
    .message.assistant { align-self: flex-start; background: var(--surface-2); color: var(--ink); border-bottom-left-radius: 5px; }
    .message.visitor { align-self: flex-end; background: var(--ink); color: var(--paper); border-bottom-right-radius: 5px; }
    .message a { color: var(--teal-dark); font-weight: 700; }
    .starter-chips { display: flex; flex-wrap: wrap; gap: 7px; padding-top: 2px; }
    .starter-chip { border: 1px solid var(--line); border-radius: 999px; padding: 7px 10px; cursor: pointer; background: var(--surface); color: var(--ink); font: 600 12px "DM Sans", sans-serif; }
    .starter-chip:hover, .starter-chip:focus-visible { border-color: var(--teal); }
    .chat-footnote { margin: 0; padding: 8px 12px 10px; font-size: 12px; line-height: 1.45; color: var(--muted); border-top: 1px solid var(--line); background: var(--surface); }
    .chat-footnote a { color: inherit; text-decoration: underline; }
    .chat-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; padding: 12px; border-top: 1px solid var(--line); background: var(--surface); }
    .chat-form input { min-width: 0; height: 44px; border: 1px solid var(--line); border-radius: 999px; padding: 0 14px; background: var(--paper); color: var(--ink); font: 500 14px "DM Sans", sans-serif; }
    .chat-form input:focus { outline: 2px solid var(--teal); outline-offset: 1px; }
    .chat-send { width: 44px; height: 44px; border: 0; border-radius: 50%; display: grid; place-items: center; cursor: pointer; background: var(--teal); color: #fff; }
    .chat-send svg { width: 18px; height: 18px; }
    .signup-card {
      align-self: stretch; padding: 15px; border: 1px solid var(--line); border-radius: 15px;
      background: var(--surface); color: var(--ink);
    }
    .signup-card h3 { font-size: 17px; letter-spacing: -.02em; margin-bottom: 8px; }
    .signup-card p { color: var(--muted); font-size: 13px; margin: 0 0 10px; }
    .signup-summary { display: grid; gap: 6px; margin: 12px 0; padding: 12px; border-radius: 11px; background: var(--surface-2); }
    .signup-summary div { display: grid; grid-template-columns: 96px 1fr; gap: 8px; font-size: 12px; }
    .signup-summary b { color: var(--muted); font-weight: 600; }
    .terms-list { list-style: none; display: grid; gap: 8px; padding: 0; margin: 12px 0; }
    .terms-list li { display: flex; gap: 8px; font-size: 12px; color: var(--muted); }
    .terms-list li::before { content: "✓"; color: var(--teal); font-weight: 900; }
    .terms-accept { display: flex; align-items: flex-start; gap: 9px; padding: 11px; border-radius: 11px; background: var(--surface-2); font-size: 12px; font-weight: 600; cursor: pointer; }
    .terms-accept input { width: 17px; height: 17px; flex: 0 0 auto; margin: 1px 0 0; accent-color: var(--teal); }
    .checkout-button { width: 100%; margin-top: 11px; border: 0; cursor: pointer; }
    .checkout-button:disabled { cursor: not-allowed; opacity: .48; transform: none; }
    .checkout-note { margin: 9px 0 0 !important; font-size: 11px !important; text-align: center; }
    .placeholder-label { display: inline-flex; margin-top: 8px; padding: 4px 7px; border-radius: 6px; background: rgba(11,118,108,.10); color: var(--teal-dark); font-size: 10px; font-weight: 800; letter-spacing: .02em; }
    .restart-signup { margin-top: 8px; border: 0; padding: 0; background: transparent; color: var(--teal-dark); font: 700 12px "DM Sans", sans-serif; cursor: pointer; text-decoration: underline; }
@media (max-width: 560px) {
      .chat-launcher { right: 14px; bottom: calc(14px + env(safe-area-inset-bottom)); min-height: 48px; padding-inline: 16px; }
      .chat-panel { right: 14px; bottom: calc(74px + env(safe-area-inset-bottom)); width: calc(100vw - 28px); max-height: calc(100dvh - 94px); }
      .chat-log { min-height: 190px; }
}
.chat-launcher { transition: opacity .25s ease, transform .25s ease; }
body.bar-on .chat-launcher { opacity: 0; pointer-events: none; transform: translateY(10px); }
</style>