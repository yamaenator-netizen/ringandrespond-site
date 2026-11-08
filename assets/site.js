// Ring & Respond — minimal site script: mobile tap-to-call bar + EN/ES toggle.
(function () {
  var bar = document.getElementById('call-bar');
  if (bar) {
    var onScroll = function () {
      if (window.scrollY > 480) { bar.classList.add('show'); } else { bar.classList.remove('show'); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var btnEn = document.getElementById('btn-en');
  var btnEs = document.getElementById('btn-es');
  if (btnEn && btnEs) {
    var setLang = function (es) {
      document.body.classList.toggle('es', es);
      btnEn.setAttribute('aria-pressed', es ? 'false' : 'true');
      btnEs.setAttribute('aria-pressed', es ? 'true' : 'false');
      document.documentElement.lang = es ? 'es' : 'en';
    };
    btnEn.addEventListener('click', function () { setLang(false); });
    btnEs.addEventListener('click', function () { setLang(true); });
  }
})();
