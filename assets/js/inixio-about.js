/**
 * Inixio Technologies about dialog — footer credit opener (site-wide).
 */
(function () {
  'use strict';

  var dialog = null;
  var lastTrigger = null;

  function assetBase() {
    var scripts = document.getElementsByTagName('script');
    var i;
    for (i = scripts.length - 1; i >= 0; i -= 1) {
      var src = scripts[i].src || '';
      var marker = src.indexOf('/assets/js/inixio-about.js');
      if (marker !== -1) return src.slice(0, marker + '/assets'.length) + '/';
    }
    return 'assets/';
  }

  function portfolioVersion() {
    var el = document.querySelector('[data-asset-version]');
    var raw = el ? String(el.textContent || '').trim() : '';
    if (!raw) return 'v1.0.0';
    return raw.charAt(0) === 'v' ? raw : 'v' + raw;
  }

  function lock() {
    document.documentElement.classList.add('is-locked');
  }

  function unlock() {
    document.documentElement.classList.remove('is-locked');
  }

  function buildDialog() {
    if (dialog) return dialog;
    if (typeof HTMLDialogElement === 'undefined') return null;

    var base = assetBase();
    var logo = base + 'image/inixio/logo.png';
    var ceo = base + 'image/inixio/ceo.png';
    var version = portfolioVersion();

    dialog = document.createElement('dialog');
    dialog.id = 'inixioAboutDialog';
    dialog.className = 'inixio-dialog';
    dialog.setAttribute('aria-labelledby', 'inixioAboutTitle');
    dialog.setAttribute('aria-describedby', 'inixioAboutBlurb');
    dialog.innerHTML =
      '<div class="inixio-head">' +
        '<img class="inixio-logo" src="' + logo + '" alt="Inixio Technologies" width="220" height="48" decoding="async">' +
        '<button class="inixio-close" type="button" data-inixio-close aria-label="Close Inixio Technologies details">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="inixio-body">' +
        '<h2 class="inixio-title" id="inixioAboutTitle">Inixio Technologies</h2>' +
        '<p class="inixio-blurb" id="inixioAboutBlurb">Inixio Technologies is a software development company specializing in web and mobile applications, DevOps solutions, AI-driven systems, and automation technologies.</p>' +
        '<div class="inixio-ceo">' +
          '<img class="inixio-ceo-photo" src="' + ceo + '" alt="Atta Ullah Tariq" width="176" height="176" decoding="async">' +
          '<div>' +
            '<p class="inixio-ceo-name">Atta Ullah Tariq</p>' +
            '<p class="inixio-ceo-role">CEO &amp; Founder</p>' +
            '<p class="inixio-ceo-skill">Fullstack Developer &amp; DevOps Engineer</p>' +
          '</div>' +
        '</div>' +
        '<p class="inixio-section-label">Contact Information</p>' +
        '<ul class="inixio-contact">' +
          '<li><a href="https://inixiotechnologies.com" target="_blank" rel="noopener noreferrer">inixiotechnologies.com</a></li>' +
          '<li><a href="mailto:info@inixiotechnologies.com">info@inixiotechnologies.com</a></li>' +
          '<li><a href="tel:+923336658622">+92 (333) 665 8622</a></li>' +
        '</ul>' +
      '</div>' +
      '<p class="inixio-foot">Portfolio Version ' + version + ' | &copy; 2026 Inixio Technologies. All rights reserved.</p>';

    document.body.appendChild(dialog);

    dialog.addEventListener('click', function (ev) {
      if (ev.target === dialog) closeDialog();
    });

    dialog.addEventListener('close', function () {
      unlock();
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      lastTrigger = null;
    });

    dialog.querySelectorAll('[data-inixio-close]').forEach(function (btn) {
      btn.addEventListener('click', closeDialog);
    });

    return dialog;
  }

  function openDialog(trigger) {
    var d = buildDialog();
    if (!d) {
      window.open('https://inixiotechnologies.com', '_blank', 'noopener');
      return;
    }
    var foot = d.querySelector('.inixio-foot');
    if (foot) {
      foot.innerHTML = 'Portfolio Version ' + portfolioVersion() +
        ' | &copy; 2026 Inixio Technologies. All rights reserved.';
    }
    lastTrigger = trigger || null;
    lock();
    d.showModal();
  }

  function closeDialog() {
    if (dialog && dialog.open) dialog.close();
  }

  document.addEventListener('click', function (ev) {
    var trigger = ev.target.closest('[data-inixio-about]');
    if (!trigger) return;
    ev.preventDefault();
    openDialog(trigger);
  });
})();
