/* Bender Elektro V2 — Interaktion (kein Framework, CSP-fest) */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* Nav: scrolled-Zustand */
  var nav = document.getElementById('nav');
  var navScrolled = false;
  /* Hysterese: ein bei 24px, aus erst bei 8px — sonst flackert die
     Leiste, wenn man um die Schwelle herum scrollt. */
  function onScroll() {
    if (!nav) return;
    var y = window.scrollY;
    if (!navScrolled && y > 24) { navScrolled = true; nav.classList.add('scrolled'); }
    else if (navScrolled && y < 8) { navScrolled = false; nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Burger-Menü */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navlinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* Reveal beim Scrollen */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Bild-Slots: Datei da -> zeigen, sonst gestylter Platzhalter */
  document.querySelectorAll('.frame[data-slot]').forEach(function (frame) {
    var img = frame.querySelector('img');
    if (!img) return;
    frame.classList.add('empty');
    function ok() { frame.classList.remove('empty'); }
    if (img.complete && img.naturalWidth > 0) { ok(); }
    else { img.addEventListener('load', ok); }
  });

  /* Jahr im Footer */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
