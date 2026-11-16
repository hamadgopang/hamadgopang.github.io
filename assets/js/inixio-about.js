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
      '<div class="inixio-scroll">' +
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
          '<div class="inixio-contact-panel">' +
            '<div class="inixio-contact-head">' +
              '<span class="inixio-contact-bar" aria-hidden="true"></span>' +
              '<h3 class="inixio-contact-title">Contact Information</h3>' +
            '</div>' +
            '<ul class="inixio-contact">' +
              '<li>' +
                '<a class="inixio-contact-row" href="https://inixiotechnologies.com" target="_blank" rel="noopener noreferrer">' +
                  '<span class="inixio-contact-icon" aria-hidden="true">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>' +
                  '</span>' +
                  '<span>inixiotechnologies.com</span>' +
                '</a>' +
              '</li>' +
              '<li>' +
                '<a class="inixio-contact-row" href="mailto:info@inixiotechnologies.com">' +
                  '<span class="inixio-contact-icon" aria-hidden="true">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>' +
                  '</span>' +
                  '<span>info@inixiotechnologies.com</span>' +
                '</a>' +
              '</li>' +
              '<li>' +
                '<a class="inixio-contact-row" href="tel:+923336658622">' +
                  '<span class="inixio-contact-icon" aria-hidden="true">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>' +
                  '</span>' +
                  '<span>+92 (333) 665 8622</span>' +
                '</a>' +
              '</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<p class="inixio-foot">Portfolio Version ' + version + ' | &copy; 2026 Inixio Technologies. All rights reserved.</p>' +
      '</div>';

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
