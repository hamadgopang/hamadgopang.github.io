/**
 * Dictionary of Chemistry — search, A–Z filter, render entries from JSON.
 */
(function () {
  'use strict';

  var root = document.getElementById('dictApp');
  if (!root) return;

  var dataUrl = root.getAttribute('data-src') || '../assets/json/dictionary.json';
  var searchEl = document.getElementById('dictSearch');
  var lettersEl = document.getElementById('dictLetters');
  var metaEl = document.getElementById('dictMeta');
  var listEl = document.getElementById('dictList');
  var statusEl = document.getElementById('dictStatus');

  var allEntries = [];
  var activeLetter = 'ALL';
  var query = '';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setStatus(msg, isError) {
    if (!statusEl) return;
    if (!msg) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      statusEl.className = 'dict-empty';
      return;
    }
    statusEl.hidden = false;
    statusEl.className = isError ? 'dict-error' : 'dict-empty';
    statusEl.textContent = msg;
  }

  function filteredEntries() {
    var q = normalize(query);
    return allEntries.filter(function (entry) {
      if (activeLetter !== 'ALL' && entry.letter !== activeLetter) return false;
      if (!q) return true;
      return normalize(entry.term).indexOf(q) !== -1 || normalize(entry.definition).indexOf(q) !== -1;
    });
  }

  function availableLetters() {
    var map = Object.create(null);
    allEntries.forEach(function (e) { map[e.letter] = true; });
    return map;
  }

  function renderLetters() {
    if (!lettersEl) return;
    lettersEl.innerHTML = '';
    var avail = availableLetters();
    var frag = document.createDocumentFragment();

    var allItem = el('li');
    var allBtn = el('button', null, 'All');
    allBtn.type = 'button';
    allBtn.setAttribute('aria-pressed', activeLetter === 'ALL' ? 'true' : 'false');
    allBtn.addEventListener('click', function () {
      activeLetter = 'ALL';
      render();
    });
    allItem.appendChild(allBtn);
    frag.appendChild(allItem);

    for (var i = 0; i < 26; i += 1) {
      var letter = String.fromCharCode(65 + i);
      var item = el('li');
      var btn = el('button', null, letter);
      btn.type = 'button';
      btn.disabled = !avail[letter];
      btn.setAttribute('aria-pressed', activeLetter === letter ? 'true' : 'false');
      btn.addEventListener('click', function (L) {
        return function () {
          activeLetter = L;
          render();
          var section = document.getElementById('dict-letter-' + L);
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
      }(letter));
      item.appendChild(btn);
      frag.appendChild(item);
    }
    lettersEl.appendChild(frag);
  }

  function renderList(entries) {
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!entries.length) {
      setStatus('No terms match your search. Try another word or clear the filter.');
      if (metaEl) metaEl.textContent = '0 terms shown';
      return;
    }

    setStatus('');
    var byLetter = Object.create(null);
    entries.forEach(function (entry) {
      if (!byLetter[entry.letter]) byLetter[entry.letter] = [];
      byLetter[entry.letter].push(entry);
    });

    var letters = Object.keys(byLetter).sort();
    var frag = document.createDocumentFragment();

    letters.forEach(function (letter) {
      var section = el('section', 'dict-section');
      section.id = 'dict-letter-' + letter;
      section.setAttribute('aria-labelledby', 'dict-h-' + letter);

      var head = el('div', 'dict-letter-head');
      var h2 = el('h2', null, letter);
      h2.id = 'dict-h-' + letter;
      head.appendChild(h2);
      head.appendChild(el('span', null, byLetter[letter].length + (byLetter[letter].length === 1 ? ' term' : ' terms')));
      section.appendChild(head);

      var ul = el('ul', 'dict-list');
      byLetter[letter].forEach(function (entry) {
        var li = el('li', 'dict-entry');
        li.appendChild(el('h3', 'dict-term', entry.term));
        li.appendChild(el('p', 'dict-definition', entry.definition));
        ul.appendChild(li);
      });
      section.appendChild(ul);
      frag.appendChild(section);
    });

    listEl.appendChild(frag);
    if (metaEl) {
      metaEl.textContent = entries.length + ' of ' + allEntries.length + ' terms' +
        (activeLetter !== 'ALL' ? ' · letter ' + activeLetter : '') +
        (query ? ' · matching “' + query.trim() + '”' : '');
    }
  }

  function render() {
    renderLetters();
    renderList(filteredEntries());
  }

  if (searchEl) {
    searchEl.addEventListener('input', function () {
      query = searchEl.value || '';
      render();
    });
  }

  setStatus('Loading dictionary…');
  fetch(dataUrl)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      allEntries = (data.entries || []).slice().sort(function (a, b) {
        return String(a.term).localeCompare(String(b.term), 'en', { sensitivity: 'base' });
      });
      if (!allEntries.length) throw new Error('empty');
      render();
    })
    .catch(function () {
      allEntries = [];
      if (listEl) listEl.innerHTML = '';
      setStatus('The dictionary could not be loaded. Please check your connection and try again.', true);
      if (metaEl) metaEl.textContent = '';
    });
})();
