/**
 * animations.js
 *  - Scroll reveal (IntersectionObserver)
 *  - Animated number counters
 *  - Light image parallax
 *  - Pauses decorative SVG motion when the visitor prefers reduced motion
 * All motion respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hasIO = 'IntersectionObserver' in window;

  /* ------------------------------------------------------------------ *
   * Scroll reveal
   * ------------------------------------------------------------------ */
  (function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!hasIO || reduceMotion.matches) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ------------------------------------------------------------------ *
   * Counters
   * ------------------------------------------------------------------ */
  (function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    function format(el, value) {
      el.textContent = value + (el.getAttribute('data-suffix') || '');
    }

    if (!hasIO || reduceMotion.matches) {
      counters.forEach(function (el) { format(el, el.getAttribute('data-count')); });
      return;
    }

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var duration = 1500;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        format(el, Math.round(target * eased));
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) {
      format(el, 0);
      io.observe(el);
    });
  })();

  /* ------------------------------------------------------------------ *
   * Parallax (updates only elements that are near the viewport)
   * ------------------------------------------------------------------ */
  (function initParallax() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length || !hasIO) return;

    var visible = new Set();
    var ticking = false;

    function update() {
      ticking = false;
      if (reduceMotion.matches) return;
      var vh = window.innerHeight;
      visible.forEach(function (el) {
        var factor = parseFloat(el.getAttribute('data-parallax')) || 0.05;
        var rect = el.getBoundingClientRect();
        var offset = (rect.top + rect.height / 2 - vh / 2) * -factor;
        offset = Math.max(-28, Math.min(28, offset));
        el.style.setProperty('--py', offset.toFixed(1) + 'px');
      });
    }

    function request() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      request();
    }, { rootMargin: '100px 0px' });

    items.forEach(function (el) { io.observe(el); });
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
  })();

  /* ------------------------------------------------------------------ *
   * Decorative SVG (SMIL) orbits: pause for reduced motion
   * ------------------------------------------------------------------ */
  (function initOrbits() {
    var svgs = document.querySelectorAll('svg.orbit');
    if (!svgs.length) return;

    function apply() {
      svgs.forEach(function (svg) {
        if (typeof svg.pauseAnimations !== 'function') return;
        if (reduceMotion.matches) svg.pauseAnimations();
        else svg.unpauseAnimations();
      });
    }

    apply();
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', apply);
    else if (reduceMotion.addListener) reduceMotion.addListener(apply);
  })();
})();
