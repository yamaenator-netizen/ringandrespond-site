"use strict";
var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- EN / ES toggle: hero + poll parity ---------- */
var LANG = "en";
function setLang(lang) {
  LANG = lang;
  document.documentElement.lang = lang;
  var nodes = document.querySelectorAll("[data-en]");
  for (var i = 0; i < nodes.length; i++) {
    var txt = nodes[i].getAttribute(lang === "es" ? "data-es" : "data-en");
    if (txt) { nodes[i].textContent = txt; }
  }
  var btn = document.getElementById("langToggle");
  btn.querySelector(".lang-alt").textContent = lang === "es" ? "EN" : "ES";
  updatePollProgress();
  calc();
}
document.getElementById("langToggle").addEventListener("click", function () {
  setLang(LANG === "en" ? "es" : "en");
});

/* ---------- Living sun concept demo (illustrative animation) ---------- */
var canvas = document.getElementById("sunCanvas");
var ctx = canvas.getContext("2d");
var playing = false, playTimer = null, phase = 0, lines = [], currentLine = -1;

function drawSun(level) {
  var w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2 + 6, base = 34;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#B45309"; ctx.lineWidth = 5; ctx.lineCap = "round";
  for (var i = 0; i < 12; i++) {
    var a = (Math.PI * 2 * i) / 12 + (reduced ? 0 : phase * 0.15);
    var len = base + 10 + level * 26 * (0.5 + 0.5 * Math.sin(phase * 3 + i * 1.7));
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (base + 8), cy + Math.sin(a) * (base + 8));
    ctx.lineTo(cx + Math.cos(a) * (base + 8 + len * 0.45), cy + Math.sin(a) * (base + 8 + len * 0.45));
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(cx, cy, base, 0, Math.PI * 2); ctx.fillStyle = "#FFC61A"; ctx.fill();
  ctx.fillStyle = "#0A2C21";
  ctx.beginPath(); ctx.arc(cx - 11, cy - 5, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 11, cy - 5, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy + 4, 13, 0.25 * Math.PI, 0.75 * Math.PI);
  ctx.strokeStyle = "#0A2C21"; ctx.lineWidth = 3.4; ctx.stroke();
  ctx.strokeStyle = "#0A604A"; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(cx - 52, cy + 16, 17, -0.5, 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 52, cy + 16, 17, Math.PI - 1.5, Math.PI + 0.5); ctx.stroke();
}
drawSun(0.15);

function stopDemo() {
  playing = false;
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  document.getElementById("playGlyph").textContent = "▶";
  for (var i = 0; i < lines.length; i++) { lines[i].classList.remove("now"); }
  currentLine = -1; drawSun(0.15);
}
document.getElementById("playBtn").addEventListener("click", function () {
  if (playing) { stopDemo(); return; }
  lines = document.querySelectorAll("#transcript li");
  playing = true; currentLine = -1;
  document.getElementById("playGlyph").textContent = "⏸";
  document.getElementById("demoStatus").textContent = LANG === "es"
    ? "Ejemplo de concepto en curso — animación ilustrativa, no una llamada en vivo."
    : "Concept walk-through playing — illustrative animation, not a live call.";
  var statusEl = document.getElementById("demoStatus");
  var stepMs = reduced ? 2600 : 2100;
  function tick() {
    phase += 0.35;
    drawSun(playing ? 0.45 + 0.4 * Math.abs(Math.sin(phase)) : 0.15);
  }
  if (!reduced) { playTimer = setInterval(tick, 120); } else { drawSun(0.3); }
  function next() {
    if (!playing) { return; }
    if (currentLine >= 0 && lines[currentLine]) { lines[currentLine].classList.remove("now"); }
    currentLine++;
    if (currentLine >= lines.length) {
      stopDemo();
      statusEl.textContent = LANG === "es"
        ? "Eso capturó Sunny: nombre, número, motivo y una marca de urgente."
        : "That's what Sunny captured: name, number, reason, and an urgent flag.";
      return;
    }
    lines[currentLine].classList.add("now");
    setTimeout(next, stepMs);
  }
  next();
});

/* ---------- Owner poll ---------- */
var answers = { trade: "", missed: "", when: "", handoff: "", terms: "" };
var stepNow = 1;
var TOTAL = 4;
function updatePollProgress() {
  var el = document.getElementById("pollProgress");
  if (stepNow > TOTAL) {
    el.textContent = LANG === "es" ? "Encuesta completa" : "Poll complete";
  } else {
    el.textContent = (LANG === "es" ? "Pregunta " : "Question ") + stepNow +
      (LANG === "es" ? " de " : " of ") + TOTAL;
  }
  document.querySelectorAll(".poll-step").forEach(function (fs) {
    fs.hidden = Number(fs.getAttribute("data-step")) !== stepNow;
  });
}
function pollSummaryText() {
  var open = document.getElementById("pollOpen").value.trim();
  var parts = [];
  parts.push((LANG === "es" ? "Oficio: " : "Trade: ") + answers.trade);
  parts.push((LANG === "es" ? "Llamadas sin contestar por semana: " : "Unanswered calls per week: ") + answers.missed);
  parts.push((LANG === "es" ? "Lo que más duele: " : "Hurts most: ") + answers.when);
  parts.push((LANG === "es" ? "Entregaría primero: " : "Hand off first: ") + answers.handoff);
  if (answers.terms) { parts.push("Terms: " + answers.terms); }
  if (open) { parts.push("In my words: " + open); }
  return parts.join("\n");
}
function refreshSendLink() {
  var a = document.getElementById("pollSend");
  var body = encodeURIComponent(pollSummaryText());
  a.setAttribute("href", "mailto:hello@ringandrespond.com?subject=" +
    encodeURIComponent("Owner poll answers") + "&body=" + body);
  document.getElementById("pollSummary").textContent = pollSummaryText().split("\n").join(" · ");
}
document.querySelectorAll(".chip").forEach(function (chip) {
  chip.setAttribute("aria-pressed", "false");
  chip.addEventListener("click", function () {
    var q = chip.getAttribute("data-q");
    answers[q] = chip.getAttribute("data-v");
    var group = chip.parentElement.querySelectorAll(".chip");
    group.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    chip.setAttribute("aria-pressed", "true");
    if (q !== "terms") {
      stepNow = Math.min(TOTAL + 1, stepNow + 1);
      if (stepNow > TOTAL) {
        document.getElementById("pollDone").hidden = false;
        refreshSendLink();
      }
      updatePollProgress();
    } else {
      refreshSendLink();
    }
  });
});
document.getElementById("pollOpen").addEventListener("input", refreshSendLink);

/* ---------- Night timeline ---------- */
var NIGHT = {
  "17": ["5:00 PM — closing time", "The last jobs wrap up. From here on, the shop phone would ring into an empty room — Sunny takes over the line so the evening callers still reach a voice."],
  "19": ["7:00 PM — dinner hour", "A homeowner's water heater quits. Not an emergency yet — Sunny captures the details and it waits, written down, for the morning list."],
  "21": ["9:00 PM — the quote question", "Someone planning tomorrow's panel upgrade calls late. No prices get quoted — the callback request is captured with the job written in the caller's words."],
  "0": ["12:00 AM — quiet hours", "Mostly quiet. A wrong number, a robocall — nothing reaches the owner's phone. The list stays clean."],
  "2": ["2:00 AM — the burst pipe", "A homeowner finds water through the ceiling. Sunny answers on the second ring, says she's the shop's automated assistant, flags it urgent, and captures the callback number digit by digit. The owner wakes to one clear message instead of a voicemail they'll hear at nine — if the caller left one at all."],
  "6": ["6:00 AM — the morning list", "The owner opens one list: every call from the night, urgent first, each with a name, a number, and a reason. Callbacks start with the burst pipe."]
};
document.querySelectorAll(".hour").forEach(function (btn) {
  btn.setAttribute("aria-pressed", btn.getAttribute("data-hour") === "2" ? "true" : "false");
  btn.addEventListener("click", function () {
    document.querySelectorAll(".hour").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    btn.setAttribute("aria-pressed", "true");
    var item = NIGHT[btn.getAttribute("data-hour")];
    document.getElementById("nightTitle").textContent = item[0];
    document.getElementById("nightText").textContent = item[1];
  });
});

/* ---------- Honest calculator ---------- */
function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function calc() {
  var missed = Number(document.getElementById("cMissed").value);
  var share = Number(document.getElementById("cShare").value);
  var value = Number(document.getElementById("cValue").value);
  document.getElementById("cMissedOut").textContent = missed;
  document.getElementById("cShareOut").textContent = share + "%";
  document.getElementById("cValueOut").textContent = fmt(value);
  var total = Math.round(missed * (share / 100) * value * 52);
  document.getElementById("calcOut").textContent = fmt(total);
}
["cMissed", "cShare", "cValue"].forEach(function (id) {
  document.getElementById(id).addEventListener("input", calc);
});
calc();
updatePollProgress();
