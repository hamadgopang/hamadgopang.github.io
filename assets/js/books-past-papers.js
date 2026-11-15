/**
 * Books & Past Papers — PDF reader modal
 * Opens a book card's PDF in a dialog; supports download + new tab; clears iframe on close.
 */
(function () {
  'use strict';

  var dialog = document.getElementById('bookReader');
  if (!dialog) return;

  var titleEl = document.getElementById('bookReaderTitle');
  var frame = document.getElementById('bookReaderFrame');
  var downloadBtn = document.getElementById('bookReaderDownload');
  var newTabBtn = document.getElementById('bookReaderNewTab');
  var closeBtn = document.getElementById('bookReaderClose');
  var trigger = null;

  function closeReader() {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
  }

  function openReader(card, fromEl) {
    var src = card.getAttribute('data-book-src');
    var title = card.getAttribute('data-book-title') || 'Chemistry resource';
    if (!src) return;

    if (typeof HTMLDialogElement === 'undefined') {
      window.open(src, '_blank', 'noopener');
      return;
    }

    trigger = fromEl || null;
    titleEl.textContent = title;
    downloadBtn.href = src;
    downloadBtn.setAttribute('download', '');
    newTabBtn.href = src;
    frame.src = src;
    document.documentElement.classList.add('is-locked');
    dialog.showModal();
    if (closeBtn) closeBtn.focus();
  }

  document.querySelectorAll('[data-book-read]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('[data-book-src]');
      if (card) openReader(card, btn);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeReader);

  dialog.addEventListener('click', function (ev) {
    if (ev.target === dialog) closeReader();
  });

  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('is-locked');
    frame.removeAttribute('src');
    if (trigger && typeof trigger.focus === 'function') trigger.focus();
    trigger = null;
  });

  dialog.addEventListener('cancel', function () {
    /* native Escape triggers cancel then close */
  });
})();
