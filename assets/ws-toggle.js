"use strict";
/* Websites showcase page — EN / ES toggle.
   Same mechanism as the home page's app.js setLang(): every [data-en] node
   swaps its text for the matching data-es / data-en string, and the
   langToggle button flips. One addition: on <img> nodes the pair drives the
   alt text instead of textContent. The home page's app.js also drives the
   demo canvas and the poll, which this page does not have, so it is not
   loaded here. See INTEGRATION.md for the merge options. */
var LANG = "en";
function setLang(lang) {
  LANG = lang;
  document.documentElement.lang = lang;
  var nodes = document.querySelectorAll("[data-en]");
  for (var i = 0; i < nodes.length; i++) {
    var txt = nodes[i].getAttribute(lang === "es" ? "data-es" : "data-en");
    if (!txt) { continue; }
    if (nodes[i].tagName === "IMG") { nodes[i].setAttribute("alt", txt); }
    else { nodes[i].textContent = txt; }
  }
  var btn = document.getElementById("langToggle");
  btn.querySelector(".lang-alt").textContent = lang === "es" ? "EN" : "ES";
}
document.getElementById("langToggle").addEventListener("click", function () {
  setLang(LANG === "en" ? "es" : "en");
});
