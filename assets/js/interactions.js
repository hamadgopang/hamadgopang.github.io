/**
 * interactions.js
 *  - Graceful image fallbacks (missing photos show an SVG illustration instead)
 *  - Accessible image lightbox for the educational notes gallery
 *  - Contact form: validation and a mailto-based submission (no backend)
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Image fallbacks
   * Photos for the teaching cards and the notes gallery can be added later.
   * Until then the illustration underneath stays visible.
   * ------------------------------------------------------------------ */
  var photos = Array.prototype.slice.call(document.querySelectorAll('.exp-photo, .gallery-photo'));
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('#gallery .gallery-item'));
  var galleryEmpty = document.querySelector('#gallery .gallery-empty');

  function updateGalleryState() {
    if (!galleryItems.length) return;
    var pending = 0;
    var loaded = 0;
    galleryItems.forEach(function (item) {
      var img = item.querySelector('.gallery-photo');
      if (!img) return;
      var ok = img.classList.contains('is-loaded');
      var bad = img.classList.contains('is-missing');
      if (!ok && !bad) pending++;
      if (ok) loaded++;
      item.disabled = !ok;
    });
    if (galleryEmpty && pending === 0) galleryEmpty.hidden = loaded > 0;
  }

  function resolve(img, ok) {
    img.classList.toggle('is-loaded', ok);
    img.classList.toggle('is-missing', !ok);
    updateGalleryState();
  }

  photos.forEach(function (img) {
    if (img.complete) {
      resolve(img, img.naturalWidth > 0);
    } else {
      img.addEventListener('load', function () { resolve(img, img.naturalWidth > 0); });
      img.addEventListener('error', function () { resolve(img, false); });
    }
  });

  // Until the images resolve, gallery buttons are inert placeholders
  galleryItems.forEach(function (item) { item.disabled = true; });

  /* ------------------------------------------------------------------ *
   * Lightbox
   * ------------------------------------------------------------------ */
  var lightbox = null;
  var lbImg = null;
  var lbCaption = null;
  var lbPrev = null;
  var lbNext = null;
  var lbItems = [];
  var lbIndex = 0;
  var lbTrigger = null;

  function icon(id) {
    return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function buildLightbox() {
    lightbox = document.createElement('dialog');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-label', 'Image viewer');
    lightbox.innerHTML =
      '<button class="lightbox-btn lightbox-btn--close" type="button" aria-label="Close image viewer">' + icon('i-close') + '</button>' +
      '<button class="lightbox-btn lightbox-btn--prev" type="button" aria-label="Previous image">' + icon('i-arrow') + '</button>' +
      '<button class="lightbox-btn lightbox-btn--next" type="button" aria-label="Next image">' + icon('i-arrow') + '</button>' +
      '<figure class="lightbox-figure"><img class="lightbox-img" alt=""><figcaption class="lightbox-caption"></figcaption></figure>';
    document.body.appendChild(lightbox);

    lbImg = lightbox.querySelector('.lightbox-img');
    lbCaption = lightbox.querySelector('.lightbox-caption');
    lbPrev = lightbox.querySelector('.lightbox-btn--prev');
    lbNext = lightbox.querySelector('.lightbox-btn--next');

    lightbox.querySelector('.lightbox-btn--close').addEventListener('click', function () { lightbox.close(); });
    lbPrev.addEventListener('click', function () { show(lbIndex - 1); });
    lbNext.addEventListener('click', function () { show(lbIndex + 1); });

    // Click on the dark backdrop closes
    lightbox.addEventListener('click', function (ev) {
      if (ev.target === lightbox || ev.target.classList.contains('lightbox-figure')) lightbox.close();
    });

    lightbox.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); show(lbIndex - 1); }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); show(lbIndex + 1); }
    });

    lightbox.addEventListener('close', function () {
      document.documentElement.classList.remove('is-locked');
      if (lbTrigger) lbTrigger.focus();
    });
  }

  function show(index) {
    var n = lbItems.length;
    lbIndex = (index + n) % n;
    var item = lbItems[lbIndex];
    var photo = item.querySelector('.gallery-photo');
    var caption = item.querySelector('.gallery-caption');
    lbImg.src = photo.currentSrc || photo.src;
    lbImg.alt = photo.alt;
    lbCaption.textContent = (caption ? caption.textContent + ' ' : '') + '(' + (lbIndex + 1) + ' of ' + n + ')';
    lbPrev.hidden = lbNext.hidden = n < 2;
  }

  function openLightbox(trigger) {
    lbItems = galleryItems.filter(function (item) {
      var img = item.querySelector('.gallery-photo');
      return img && img.classList.contains('is-loaded');
    });
    var start = lbItems.indexOf(trigger);
    if (start < 0) return;

    if (typeof HTMLDialogElement === 'undefined') {
      // Very old browsers: open the image itself
      window.open(trigger.querySelector('.gallery-photo').src, '_blank', 'noopener');
      return;
    }

    if (!lightbox) buildLightbox();
    lbTrigger = trigger;
    show(start);
    document.documentElement.classList.add('is-locked');
    lightbox.showModal();
  }

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      if (!item.disabled) openLightbox(item);
    });
  });

  /* ------------------------------------------------------------------ *
   * Contact form (static site: opens the visitor's email app)
   * ------------------------------------------------------------------ */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('cfStatus');
    var recipient = form.getAttribute('data-mailto');
    var fields = {
      name: { el: form.elements.namedItem('name'), err: document.getElementById('cfNameErr') },
      email: { el: form.elements.namedItem('email'), err: document.getElementById('cfEmailErr') },
      message: { el: form.elements.namedItem('message'), err: document.getElementById('cfMessageErr') }
    };
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
      name: function (v) { return v.length >= 2 ? '' : 'Please enter your name.'; },
      email: function (v) {
        if (!v) return 'Please enter your email address.';
        return emailPattern.test(v) ? '' : 'Please enter a valid email address.';
      },
      message: function (v) { return v.length >= 10 ? '' : 'Please write a message of at least 10 characters.'; }
    };

    var setError = function (key, message) {
      var f = fields[key];
      f.err.textContent = message;
      f.err.hidden = !message;
      if (message) f.el.setAttribute('aria-invalid', 'true');
      else f.el.removeAttribute('aria-invalid');
    };

    var validateField = function (key) {
      var message = rules[key](fields[key].el.value.trim());
      setError(key, message);
      return !message;
    };

    var setStatus = function (text, isError) {
      status.hidden = !text;
      status.textContent = text;
      status.classList.toggle('is-error', !!isError);
    };

    Object.keys(fields).forEach(function (key) {
      fields[key].el.addEventListener('blur', function () {
        if (fields[key].el.value.trim()) validateField(key);
      });
      fields[key].el.addEventListener('input', function () {
        if (fields[key].el.getAttribute('aria-invalid') === 'true') validateField(key);
      });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      setStatus('', false);

      var firstInvalid = null;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key) && !firstInvalid) firstInvalid = fields[key].el;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var name = fields.name.el.value.trim();
      var email = fields.email.el.value.trim();
      var message = fields.message.el.value.trim();
      var subject = form.elements.namedItem('subject').value.trim() || 'Message from ' + name + ' (website)';
      var body = message + '\n\n--\n' + name + '\n' + email;
      var url = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      if (url.length > 1900) {
        setStatus('Your message is too long to send this way. Please shorten it, or email ' + recipient + ' directly.', true);
        return;
      }

      window.location.href = url;
      setStatus('Your email app should now open with your message ready to send. If nothing happens, please write to ' + recipient + '.', false);
    });
  }
})();
