/**
 * Homepage first-visit welcome dialog.
 * Shows once per browser via localStorage; fails closed if storage is blocked.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'hk-welcome-seen';
  var DELAY_MS = 800;
  var dialog = document.getElementById('welcomeDialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  function storageGet() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return 'blocked';
    }
  }

  function storageSet() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
      return true;
    } catch (e) {
      return false;
    }
  }

  function markSeen() {
    storageSet();
  }

  function unlock() {
    document.documentElement.classList.remove('is-locked');
  }

  function lock() {
    document.documentElement.classList.add('is-locked');
  }

  function closeWelcome() {
    markSeen();
    if (dialog.open) dialog.close();
  }

  function openWelcome() {
    if (storageGet()) return;
    lock();
    dialog.showModal();
  }

  dialog.querySelectorAll('[data-welcome-close]').forEach(function (el) {
    el.addEventListener('click', function (ev) {
      var href = el.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        ev.preventDefault();
        closeWelcome();
        var target = document.querySelector(href);
        if (target) {
          window.setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 40);
        }
        return;
      }
      closeWelcome();
    });
  });

  dialog.addEventListener('click', function (ev) {
    if (ev.target === dialog) closeWelcome();
  });

  dialog.addEventListener('cancel', function () {
    markSeen();
  });

  dialog.addEventListener('close', function () {
    unlock();
    markSeen();
  });

  if (storageGet()) return;

  window.setTimeout(openWelcome, DELAY_MS);
})();
