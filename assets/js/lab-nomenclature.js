/* ==========================================================================
   lab-nomenclature.js  -  Nomenclature Trainer
   ========================================================================== */
(function () {
  'use strict';
  var Lab = window.Lab;
  if (!Lab) { return; }

  var loading = document.getElementById('labLoading');
  var app = document.getElementById('labApp');

  var state = {
    items: [],
    levels: [],
    mols: null,
    mode: 'structure-name',
    level: 'easy',
    pool: [],
    index: 0,
    item: null,
    score: 0,
    streak: 0,
    hintIdx: 0,
    answered: false
  };

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[–—]/g, '-')
      .replace(/[^a-z0-9-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function molSpec(id) {
    return state.mols[id] || null;
  }

  function rebuildPool() {
    state.pool = Lab.shuffle(state.items.filter(function (it) {
      return it.level === state.level;
    }));
    state.index = 0;
  }

  function current() {
    return state.pool[state.index] || null;
  }

  function isCorrect(answer) {
    var n = normalize(answer);
    return (state.item.acceptedNames || []).some(function (name) {
      return normalize(name) === n;
    });
  }

  function renderToolbar() {
    var levelWrap = document.getElementById('nomLevel');
    Lab.clear(levelWrap);
    state.levels.forEach(function (lv) {
      var btn = Lab.h('button', {
        type: 'button',
        class: state.level === lv.id ? 'is-active' : '',
        'data-level': lv.id,
        text: lv.label
      });
      btn.addEventListener('click', function () {
        state.level = lv.id;
        rebuildPool();
        nextItem(true);
        renderToolbar();
      });
      levelWrap.appendChild(btn);
    });
    document.getElementById('nomScore').textContent = String(state.score);
    document.getElementById('nomStreak').textContent = String(state.streak);
  }

  function renderPrompt() {
    var mount = document.getElementById('nomPrompt');
    Lab.clear(mount);
    var item = state.item;
    if (!item) {
      mount.appendChild(Lab.h('p', { class: 'lab-note', text: 'No questions in this level yet.' }));
      return;
    }
    if (state.mode === 'structure-name') {
      mount.appendChild(Lab.h('p', { class: 'lab-eyebrow', text: 'Name this structure' }));
      var stage = Lab.h('div', { class: 'mol-stage mol-stage--wide' });
      var spec = molSpec(item.mol);
      if (spec) {
        try {
          stage.appendChild(Lab.renderSVG(Lab.layoutSpec(spec), { label: 'Unknown compound', fluid: true, scale: 1.1 }));
        } catch (e) {
          stage.appendChild(Lab.h('p', { class: 'lab-muted', text: 'Structure unavailable.' }));
        }
      }
      mount.appendChild(stage);
      if (spec && spec.formula) {
        mount.appendChild(Lab.h('p', { class: 'hc-formula-line' }, [Lab.formulaEl(spec.formula)]));
      }
    } else {
      mount.appendChild(Lab.h('p', { class: 'lab-eyebrow', text: 'Choose the structure for' }));
      mount.appendChild(Lab.h('h2', { class: 'nom-name-prompt', text: item.acceptedNames[0] }));
    }
  }

  function renderAnswer() {
    var mount = document.getElementById('nomAnswerMount');
    Lab.clear(mount);
    var item = state.item;
    if (!item) { return; }

    if (state.mode === 'structure-name') {
      mount.appendChild(Lab.h('label', { class: 'lab-label', for: 'nomInput', text: 'Your answer' }));
      var input = Lab.h('input', {
        id: 'nomInput',
        type: 'text',
        class: 'nom-input',
        autocomplete: 'off',
        placeholder: 'e.g. ethanol'
      });
      mount.appendChild(input);
      mount.appendChild(Lab.h('p', { class: 'lab-muted', text: 'Or pick one:' }));
      var choices = Lab.h('div', { class: 'nom-choices' });
      (item.choices || []).forEach(function (choice) {
        var btn = Lab.h('button', { type: 'button', class: 'nom-choice', text: choice });
        btn.addEventListener('click', function () {
          input.value = choice;
          if (!state.answered) { checkAnswer(); }
        });
        choices.appendChild(btn);
      });
      mount.appendChild(choices);
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' && !state.answered) { checkAnswer(); }
      });
    } else {
      mount.appendChild(Lab.h('p', { class: 'lab-label', text: 'Which structure matches?' }));
      var grid = Lab.h('div', { class: 'nom-struct-choices' });
      var options = Lab.shuffle([item].concat(
        state.items.filter(function (x) { return x.id !== item.id && x.level === item.level; }).slice(0, 3)
      )).slice(0, 4);
      options.forEach(function (opt) {
        var card = Lab.h('button', { type: 'button', class: 'nom-struct-card', 'data-id': opt.id });
        var stage = Lab.h('div', { class: 'mol-stage' });
        var spec = molSpec(opt.mol);
        if (spec) {
          try {
            stage.appendChild(Lab.renderSVG(Lab.layoutSpec(spec), { label: 'Option', fluid: true }));
          } catch (e) { /* ignore */ }
        }
        card.appendChild(stage);
        card.addEventListener('click', function () {
          if (state.answered) { return; }
          finish(opt.id === item.id, item.acceptedNames[0]);
        });
        grid.appendChild(card);
      });
      mount.appendChild(grid);
    }
  }

  function setFeedback(msg, cls) {
    var el = document.getElementById('nomFeedback');
    el.className = 'nom-feedback' + (cls ? ' ' + cls : '');
    el.textContent = msg;
  }

  function finish(ok, correctLabel) {
    state.answered = true;
    if (ok) {
      state.score += 1;
      state.streak += 1;
      setFeedback('Correct — well done.', 'is-ok');
    } else {
      state.streak = 0;
      setFeedback('Not quite. The accepted name is “' + correctLabel + '”.', 'is-bad');
    }
    renderToolbar();
  }

  function checkAnswer() {
    if (!state.item || state.answered) { return; }
    if (state.mode !== 'structure-name') { return; }
    var input = document.getElementById('nomInput');
    var val = input ? input.value : '';
    if (!String(val).trim()) {
      setFeedback('Type a name or choose an option first.', 'is-warn');
      return;
    }
    finish(isCorrect(val), state.item.acceptedNames[0]);
  }

  function showHint() {
    if (!state.item) { return; }
    var hints = state.item.hints || [];
    if (!hints.length) {
      setFeedback('No hint for this one — look at the carbon count and ending.', 'is-warn');
      return;
    }
    var hint = hints[Math.min(state.hintIdx, hints.length - 1)];
    state.hintIdx += 1;
    setFeedback('Hint: ' + hint, 'is-warn');
  }

  function nextItem(resetFeedback) {
    if (!state.pool.length) { rebuildPool(); }
    if (!state.pool.length) {
      state.item = null;
      renderPrompt();
      renderAnswer();
      return;
    }
    if (!resetFeedback && state.index < state.pool.length - 1) { state.index += 1; }
    else if (!resetFeedback) { rebuildPool(); }
    state.item = current();
    state.hintIdx = 0;
    state.answered = false;
    if (resetFeedback !== false) { setFeedback(''); }
    else { setFeedback(''); }
    renderPrompt();
    renderAnswer();
  }

  function bind() {
    document.getElementById('nomMode').addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[data-mode]');
      if (!btn) { return; }
      state.mode = btn.getAttribute('data-mode');
      Array.prototype.forEach.call(document.querySelectorAll('#nomMode button'), function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      nextItem(true);
    });
    document.getElementById('nomHint').addEventListener('click', showHint);
    document.getElementById('nomCheck').addEventListener('click', checkAnswer);
    document.getElementById('nomNext').addEventListener('click', function () { nextItem(false); });
    var root = document.querySelector('[data-teacher-root]');
    if (root) {
      root.addEventListener('lab:next', function () { nextItem(false); });
      root.addEventListener('lab:play', function () { checkAnswer(); });
    }
  }

  Lab.init().then(function () {
    return Promise.all([Lab.loadJSON('nomenclature.json'), Lab.loadJSON('molecules.json')]);
  }).then(function (pair) {
    state.items = pair[0].items || [];
    state.levels = pair[0].levels || [];
    state.mols = pair[1].molecules || {};
    if (state.levels[0]) { state.level = state.levels[0].id; }
    rebuildPool();
    bind();
    renderToolbar();
    nextItem(true);
    Lab.progress.visit('nomenclature');
    loading.hidden = true;
    app.hidden = false;
  }).catch(function (err) {
    Lab.showError(err && err.message ? err.message : 'Could not load Nomenclature Trainer.');
  });
})();
