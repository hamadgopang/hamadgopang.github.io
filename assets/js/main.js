/**
 * main.js
 * Shared by the homepage and /periodic-table/.
 *  - Header: solid background on scroll
 *  - Mobile navigation (hamburger) with keyboard support
 *  - Active section indicator in the navigation
 *  - Back-to-top button
 *  - Footer year
 *  - Mini periodic table preview on the homepage
 *  - Service worker registration for offline shell support
 * Every feature is guarded so the script is safe on pages that lack the markup.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktopQuery = window.matchMedia('(min-width: 960px)');

  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('primaryNav');
  var toggle = document.querySelector('.nav-toggle');
  var toTop = document.querySelector('.to-top');
  var alwaysSolid = header ? header.classList.contains('is-solid') : false;

  /* ------------------------------------------------------------------ *
   * Header state + back-to-top (single rAF-throttled scroll handler)
   * ------------------------------------------------------------------ */
  var ticking = false;

  function onScrollFrame() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header && !alwaysSolid) header.classList.toggle('is-solid', y > 24);
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
  }

  function requestScrollFrame() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame, { passive: true });
  onScrollFrame();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ *
   * Mobile navigation
   * ------------------------------------------------------------------ */
  function setMenu(open, returnFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    if (header) header.classList.toggle('is-open', open);
    if (!open && returnFocus) toggle.focus();
  }

  function menuIsOpen() {
    return !!toggle && toggle.getAttribute('aria-expanded') === 'true';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(!menuIsOpen(), false);
    });

    // Close after choosing a link
    nav.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) setMenu(false, false);
    });

    // Escape closes and returns focus to the toggle
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menuIsOpen()) setMenu(false, true);
    });

    // Click outside closes
    document.addEventListener('click', function (ev) {
      if (menuIsOpen() && !nav.contains(ev.target) && !toggle.contains(ev.target)) setMenu(false, false);
    });

    // Reset when the layout switches to the desktop navigation
    var onQueryChange = function () { if (desktopQuery.matches) setMenu(false, false); };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onQueryChange);
    else if (desktopQuery.addListener) desktopQuery.addListener(onQueryChange);
  }

  /* ------------------------------------------------------------------ *
   * Active section indicator
   * ------------------------------------------------------------------ */
  (function initActiveNav() {
    if (!nav || !('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-link[href^="#"]'));
    if (!links.length) return;

    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    function setActive(key) {
      links.forEach(function (a) {
        var on = a === byId[key];
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var key = entry.target.getAttribute('data-nav') || entry.target.id;
        setActive(key);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    document.querySelectorAll('main section[id]').forEach(function (s) { observer.observe(s); });
  })();

  /* ------------------------------------------------------------------ *
   * Header logo: always load/reload the home page (no #home)
   * ------------------------------------------------------------------ */
  (function initBrandHome() {
    if (!header) return;
    var brand = header.querySelector('.brand');
    if (!brand) return;

    function normPath(path) {
      return String(path || '/')
        .replace(/\\/g, '/')
        .replace(/\/index\.html$/i, '/')
        .replace(/\/+$/, '') || '/';
    }

    brand.addEventListener('click', function (e) {
      e.preventDefault();
      var url = new URL(brand.getAttribute('href') || './', location.href);
      url.hash = '';
      if (normPath(url.pathname) === normPath(location.pathname)) {
        location.reload();
        return;
      }
      location.assign(url.pathname + url.search);
    });
  })();

  /* ------------------------------------------------------------------ *
   * Homepage: clear a bare #home hash without reloading
   * ------------------------------------------------------------------ */
  if (document.getElementById('home') && location.hash === '#home' && window.history && history.replaceState) {
    history.replaceState(null, '', location.pathname + location.search);
  }

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });

  /* ------------------------------------------------------------------ *
   * Homepage: mini periodic table preview (decorative, links to /periodic-table/)
   * ------------------------------------------------------------------ */
  (function initMiniTable() {
    var mini = document.getElementById('miniPt');
    if (!mini || !window.fetch) return;
    var section = mini.closest('.pt-feature');

    function hidePreview() {
      if (section) section.classList.add('is-no-preview');
      var visual = mini.closest('.pt-feature-visual');
      if (visual) visual.hidden = true;
    }

    fetch(mini.getAttribute('data-src'))
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var frag = document.createDocumentFragment();
        data.elements.forEach(function (e) {
          var cell = document.createElement('span');
          cell.className = 'mini-cell mc-' + e.col + ' mr-' + e.row;
          cell.setAttribute('data-cat', e.category);
          cell.title = e.name.en + ' (' + e.z + ')';
          cell.textContent = e.symbol;
          frag.appendChild(cell);
        });
        mini.appendChild(frag);
      })
      .catch(hidePreview);
  })();

  /* ------------------------------------------------------------------ *
   * Service worker (offline shell) — register once from site root
   * ------------------------------------------------------------------ */
  if ('serviceWorker' in navigator) {
    var swRoot = './';
    var scripts = document.getElementsByTagName('script');
    for (var s = 0; s < scripts.length; s += 1) {
      var src = scripts[s].getAttribute('src') || '';
      var at = src.indexOf('assets/js/');
      if (at !== -1) {
        swRoot = src.slice(0, at) || './';
        break;
      }
    }
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(swRoot + 'sw.js', { scope: swRoot }).catch(function () {
        /* Registration failures are non-fatal for the live site. */
      });
    });
  }
})();
