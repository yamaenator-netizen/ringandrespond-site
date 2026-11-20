<style>
/* Sunny site chat — identical to the homepage chat (panel, knowledge base, signup + callback). */
:root{--paper:#EFF7FB;--surface:rgba(255,255,255,.97);--surface-2:#EFF7FB;--muted:#6E8FA3;--teal-dark:#0B7FA8;--shadow:0 24px 70px rgba(12,80,110,.25)}
    .chat-launcher,.chat-panel{--ink:#0C2B3E;--line:rgba(12,43,62,.16);--teal:#0E9BC9}
    .skip { position: absolute; left: 8px; top: 8px; z-index: 100; transform: translateY(-180%); background: var(--surface); padding: 10px 14px; }
    .skip:focus { transform: translateY(0); }
    .chat-launcher {
      position: fixed; right: 22px; bottom: calc(22px + env(safe-area-inset-bottom)); z-index: 80;
      min-height: 52px; padding: 0 19px; border: 1.5px solid var(--line); border-radius: 999px;
      display: inline-flex; align-items: center; gap: 9px; cursor: pointer;
      background: var(--surface); color: var(--ink); box-shadow: 0 10px 30px rgba(12,80,110,.22), 0 0 22px rgba(53,196,243,.25); backdrop-filter: blur(14px) saturate(1.3); -webkit-backdrop-filter: blur(14px) saturate(1.3);
      font: 700 14px "DM Sans", sans-serif;
    }
    .chat-launcher svg { width: 19px; height: 19px; }
    .chat-launcher[aria-expanded="true"] { background: var(--surface-2); }
    .chat-panel {
      position: fixed; right: 22px; bottom: calc(86px + env(safe-area-inset-bottom)); z-index: 79;
      width: min(380px, calc(100vw - 28px)); max-height: min(590px, calc(100dvh - 110px));
      display: grid; grid-template-rows: auto minmax(0, 1fr) auto auto; padding: 0;
      overflow: hidden; border: 1px solid var(--line); border-radius: 22px;
      background: var(--surface); box-shadow: 0 24px 70px rgba(12,80,110,.28), 0 0 44px rgba(53,196,243,.14); backdrop-filter: blur(18px) saturate(1.35); -webkit-backdrop-filter: blur(18px) saturate(1.35);
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
    .message.visitor { align-self: flex-end; background: linear-gradient(135deg, #35C4F3, #0E9BC9); color: #FFFFFF; border-bottom-right-radius: 5px; }
    .message a { color: var(--teal-dark); font-weight: 700; }
    .starter-chips { display: flex; flex-wrap: wrap; gap: 7px; padding-top: 2px; }
    .starter-chip { border: 1px solid var(--line); border-radius: 999px; padding: 7px 10px; cursor: pointer; background: var(--surface); color: var(--ink); font: 600 12px "DM Sans", sans-serif; }
    .starter-chip:hover, .starter-chip:focus-visible { border-color: var(--teal); }
    .chat-footnote { margin: 0; padding: 8px 12px 10px; font-size: 12px; line-height: 1.45; color: var(--muted); border-top: 1px solid var(--line); background: var(--surface); }
    .chat-footnote a { color: inherit; text-decoration: underline; }
    .chat-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; padding: 12px; border-top: 1px solid var(--line); background: var(--surface); }
    .chat-form input { min-width: 0; height: 44px; border: 1px solid var(--line); border-radius: 999px; padding: 0 14px; background: var(--paper); color: var(--ink); font: 500 14px "DM Sans", sans-serif; }
    .chat-form input:focus { outline: 2px solid var(--teal); outline-offset: 1px; }
    .chat-send { width: 44px; height: 44px; border: 0; border-radius: 50%; display: grid; place-items: center; cursor: pointer; background: var(--teal); color: #FFFFFF; }
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
    .placeholder-label { display: inline-flex; margin-top: 8px; padding: 4px 7px; border-radius: 6px; background: rgba(18,165,214,.12); color: var(--teal-dark); font-size: 10px; font-weight: 800; letter-spacing: .02em; }
    .restart-signup { margin-top: 8px; border: 0; padding: 0; background: transparent; color: var(--teal-dark); font: 700 12px "DM Sans", sans-serif; cursor: pointer; text-decoration: underline; }
.chat-form input::placeholder { color: #6E8FA3; }
@media (max-width: 560px) {
      .chat-launcher { right: 14px; bottom: calc(14px + env(safe-area-inset-bottom)); min-height: 48px; padding-inline: 16px; }
      .chat-panel { right: 14px; bottom: calc(74px + env(safe-area-inset-bottom)); width: calc(100vw - 28px); max-height: calc(100dvh - 94px); }
      .chat-log { min-height: 190px; }
}
.chat-launcher { transition: opacity .25s ease, transform .25s ease; }
body.bar-on .chat-launcher { opacity: 0; pointer-events: none; transform: translateY(10px); }
.signup-card a.checkout-button{display:block;text-align:center;text-decoration:none}
/* === Variant B header (hdrB-) — Logo only · Guides dropdown · static pill, evolved === */
.hdrB-header{padding:0 16px;margin-top:12px;position:relative;z-index:40;background:transparent;border-bottom:0}
.hdrB-pill{max-width:1140px;margin:0 auto;display:flex;align-items:center;gap:10px;min-height:62px;background:rgba(255,255,255,.94);border:1px solid var(--line,#CFE6F0);border-radius:999px;padding:8px 10px 8px 18px;box-shadow:0 12px 34px rgba(12,80,110,.13)}
.hdrB-brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--ink,#0C2B3E);flex:none}
.hdrB-brand img{width:42px;height:42px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px rgba(18,165,214,.35)}
.hdrB-brand b{display:block;font-size:17px;line-height:1.12;white-space:nowrap}
.hdrB-brand small{display:block;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--link,#096E94);font-weight:700;white-space:nowrap}
.hdrB-nav{margin-left:auto;display:flex;align-items:center;gap:4px}
.hdrB-link{color:var(--body,#33566B);text-decoration:none;font-size:15px;font-weight:600;padding:10px 11px;white-space:nowrap;border-radius:999px}
.hdrB-link:hover{color:var(--ink,#0C2B3E)}
.hdrB-guides{position:relative}
.hdrB-guides-btn{appearance:none;background:transparent;border:0;font-family:inherit;color:var(--body,#33566B);font-size:15px;font-weight:600;padding:10px 11px;cursor:pointer;white-space:nowrap;border-radius:999px;display:inline-flex;align-items:center;gap:5px;min-height:44px}
.hdrB-guides-btn:hover{color:var(--ink,#0C2B3E)}
.hdrB-guides-btn .hdrB-caret{font-size:11px;line-height:1}
.hdrB-drop{position:absolute;top:calc(100% + 10px);left:auto;right:0;width:350px;max-width:calc(100vw - 32px);background:#fff;border:1px solid var(--line,#CFE6F0);border-radius:18px;box-shadow:0 18px 50px rgba(12,80,110,.16);padding:8px;opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .15s ease,transform .15s ease,visibility .15s;z-index:60}
.hdrB-guides.open .hdrB-drop,.hdrB-guides:focus-within .hdrB-drop{opacity:1;visibility:visible;transform:none}
.hdrB-noanim .hdrB-drop{transition:none}
@media(hover:hover) and (min-width:561px){.hdrB-guides:hover .hdrB-drop{opacity:1;visibility:visible;transform:none}}
.hdrB-drop a{display:flex;align-items:center;min-height:44px;padding:11px 14px;color:var(--body,#33566B);text-decoration:none;font-size:14.5px;font-weight:600;border-radius:12px;line-height:1.3}
.hdrB-drop a:hover,.hdrB-drop a:focus-visible{background:var(--panel2,#EFF7FB);color:var(--ink,#0C2B3E)}
.hdrB-header .lang-toggle{flex:none}
a.btn.hdrB-cta,.hdrB-cta{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:11px 20px;border-radius:999px;background:var(--cta,#0B7FA8);color:#fff;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 2px 14px rgba(12,80,110,.07);white-space:nowrap;flex:none;border:0}
.hdrB-burger{display:none;appearance:none;background:transparent;border:1px solid var(--line,#CFE6F0);border-radius:999px;width:42px;height:42px;min-height:42px;font-size:19px;line-height:1;color:var(--ink,#0C2B3E);cursor:pointer;flex:none;align-items:center;justify-content:center;font-family:inherit}
.hdrB-panel{display:none}
.hdrB-subbar{padding:10px 16px 0;position:sticky;top:0;z-index:60;background:var(--bg,transparent)}
.hdrB-subbar-in{max-width:1140px;margin:0 auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:flex-end;background:rgba(255,255,255,.94);border:1px solid var(--line,#CFE6F0);border-radius:999px;padding:6px 8px;box-shadow:0 2px 14px rgba(12,80,110,.07)}
/* Tablet band 561–900px: tighten, do not collapse */
@media(max-width:900px) and (min-width:701px){
  .hdrB-pill{gap:6px;padding:8px 8px 8px 14px}
  .hdrB-brand{gap:8px}
  .hdrB-link{padding:10px 7px;font-size:14.5px}
  .hdrB-guides-btn{padding:10px 7px;font-size:14.5px}
  .hdrB-header .lang-toggle button{min-width:38px;padding:8px 7px}
  a.btn.hdrB-cta,.hdrB-cta{padding:10px 14px;font-size:14px}
}
/* Narrow tablet 561–700px: harder tightening (brand small line hides, as on phone) */
@media(max-width:700px) and (min-width:561px){
  .hdrB-header{padding:0 10px}
  .hdrB-pill{gap:5px;padding:8px 6px 8px 12px}
  .hdrB-brand{gap:6px}
  .hdrB-brand img{width:36px;height:36px}
  .hdrB-brand small{display:none}
  .hdrB-link{padding:10px 5px;font-size:14px}
  .hdrB-guides-btn{padding:10px 5px;font-size:14px}
  .hdrB-header .lang-toggle{margin:0 2px}
  .hdrB-header .lang-toggle button{min-width:32px;min-height:40px;padding:7px 5px;font-size:12.5px}
  a.btn.hdrB-cta,.hdrB-cta{padding:9px 11px;font-size:13.5px;min-height:42px}
}
/* Phone ≤560px (site's existing header breakpoint) */
@media(max-width:560px){
  .hdrB-nav{display:none}
  .hdrB-burger{display:inline-flex;width:40px}
  .hdrB-pill{gap:4px;padding:6px 6px 6px 10px;min-height:56px}
  .hdrB-brand{gap:6px}
  .hdrB-brand small{display:none}
  .hdrB-header .lang-toggle{margin:0}
  .hdrB-header .lang-toggle button{min-width:36px;min-height:40px;padding:7px 6px;font-size:12.5px}
  a.btn.hdrB-cta,.hdrB-cta{min-height:40px;padding:9px 11px;font-size:13.5px}
  .hdrB-panel{max-width:1140px;margin:8px auto 0;background:#fff;border:1px solid var(--line,#CFE6F0);border-radius:20px;box-shadow:0 18px 50px rgba(12,80,110,.16);padding:8px}
  .hdrB-panel.open{display:block}
  .hdrB-panel a{display:flex;align-items:center;min-height:44px;padding:11px 14px;color:var(--body,#33566B);text-decoration:none;font-size:15px;font-weight:600;border-radius:12px}
  .hdrB-panel a:hover,.hdrB-panel a:focus-visible{background:var(--panel2,#EFF7FB);color:var(--ink,#0C2B3E)}
  .hdrB-panel .hdrB-group{font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--link,#096E94);padding:12px 14px 4px}
  .hdrB-panel a.hdrB-sub{padding-left:28px;font-size:14.5px}
}
@media(max-width:380px){
  .hdrB-header{padding:0 10px}
  .hdrB-pill{gap:5px;padding:6px 6px 6px 10px}
  .hdrB-brand img{width:36px;height:36px}
  .hdrB-brand b{font-size:16px}
  .hdrB-header .lang-toggle button{min-width:32px;padding:6px 5px;font-size:12px}
  a.btn.hdrB-cta,.hdrB-cta{padding:8px 10px;font-size:13px}
  .hdrB-burger{width:38px;height:40px;min-height:40px}
}
</style>