/* ==========================================================================
   lab-quiz.js  -  Quiz Center
   ========================================================================== */
(function () {
  'use strict';
  var Lab = window.Lab;
  if (!Lab) { return; }

  var loading = document.getElementById('labLoading');
  var app = document.getElementById('labApp');
  var tool = document.getElementById('labTool');

  var state = {
    data: null,
    mols: null,
    topic: 'all',
    level: 'all',
    timerOn: false,
    shuffle: true,
    queue: [],
    index: 0,
    score: 0,
    answered: false,
    wrong: [],
    history: [],
    tick: 0,
    left: 60
  };

  function filterKey() {
    return state.topic + '|' + state.level;
  }

  function filtered() {
    return state.data.questions.filter(function (q) {
      return (state.topic === 'all' || q.topic === state.topic) &&
        (state.level === 'all' || q.level === state.level);
    });
  }

  function renderFilters() {
    var topicBox = document.getElementById('qzTopic');
    Lab.clear(topicBox);
    [{ id: 'all', name: 'All topics' }].concat(state.data.topics).forEach(function (t) {
      var btn = Lab.h('button', {
        type: 'button',
        'aria-pressed': state.topic === t.id,
        text: t.name
      });
      btn.addEventListener('click', function () {
        state.topic = t.id;
        renderFilters();
        updateCount();
      });
      topicBox.appendChild(btn);
    });
    var levelBox = document.getElementById('qzLevel');
    Lab.clear(levelBox);
    [
      { id: 'all', name: 'All levels' },
      { id: 'beginner', name: 'Beginner' },
      { id: 'intermediate', name: 'Intermediate' },
      { id: 'advanced', name: 'Advanced' }
    ].forEach(function (l) {
      var btn = Lab.h('button', {
        type: 'button',
        'aria-pressed': state.level === l.id,
        text: l.name
      });
      btn.addEventListener('click', function () {
        state.level = l.id;
        renderFilters();
        updateCount();
      });
      levelBox.appendChild(btn);
    });
  }

  function updateCount() {
    var n = filtered().length;
    document.getElementById('qzCount').textContent = n + ' question' + (n === 1 ? '' : 's') + ' match these filters.';
    document.getElementById('qzStart').disabled = n === 0;
    var best = Lab.progress.load().quiz.best[filterKey()];
    document.getElementById('qzBest').textContent = best
      ? ('Best score for this filter: ' + best.pct + '%')
      : 'Best score for this filter: not taken yet.';
  }

  function show(panel) {
    document.getElementById('qzSetup').hidden = panel !== 'setup';
    document.getElementById('qzPlay').hidden = panel !== 'play';
    document.getElementById('qzSummary').hidden = panel !== 'summary';
  }

  function clearTimer() {
    if (state.tick) { clearInterval(state.tick); state.tick = 0; }
    document.getElementById('qzTime').hidden = true;
  }

  function startTimer() {
    clearTimer();
    if (!state.timerOn) { return; }
    state.left = 60;
    var el = document.getElementById('qzTime');
    el.hidden = false;
    el.textContent = state.left + 's';
    state.tick = setInterval(function () {
      state.left -= 1;
      el.textContent = state.left + 's';
      if (state.left <= 0) {
        clearTimer();
        if (!state.answered) { check(true); }
      }
    }, 1000);
  }

  function renderMol(q) {
    var box = document.getElementById('qzMol');
    Lab.clear(box);
    if (!q.mol && !q.gen) { box.hidden = true; return; }
    box.hidden = false;
    var layout;
    if (q.gen) {
      layout = Lab.hydroInfo(state.hydro, q.gen.family, q.gen.n, q.gen.pos || 1).layout;
    } else {
      layout = Lab.layoutSpec(state.mols[q.mol]);
    }
    box.appendChild(Lab.renderSVG(layout, { fluid: true, label: 'Question structure' }));
  }

  function renderQuestion() {
    var q = state.queue[state.index];
    state.answered = false;
    document.getElementById('qzIndex').textContent = 'Question ' + (state.index + 1) + ' of ' + state.queue.length;
    document.getElementById('qzScoreLive').textContent = 'Score ' + state.score;
    document.getElementById('qzPrompt').textContent = q.prompt;
    document.getElementById('qzFeedback').hidden = true;
    document.getElementById('qzNextQ').hidden = true;
    document.getElementById('qzCheck').hidden = false;
    document.getElementById('qzCheck').disabled = false;
    renderMol(q);
    var input = document.getElementById('qzInput');
    Lab.clear(input);
    if (q.type === 'mcq') {
      q.options.forEach(function (opt, i) {
        var id = 'opt' + i;
        input.appendChild(Lab.h('label', { class: 'lab-check qz-option' }, [
          Lab.h('input', { type: 'radio', name: 'qzOpt', value: String(i), id: id }),
          Lab.h('span', { text: opt })
        ]));
      });
    } else if (q.type === 'tf') {
      ['True', 'False'].forEach(function (label, i) {
        input.appendChild(Lab.h('label', { class: 'lab-check qz-option' }, [
          Lab.h('input', { type: 'radio', name: 'qzOpt', value: i === 0 ? 'true' : 'false' }),
          Lab.h('span', { text: label })
        ]));
      });
    } else if (q.type === 'fill') {
      input.appendChild(Lab.h('input', {
        type: 'text',
        id: 'qzFill',
        class: 'qz-fill',
        autocomplete: 'off',
        'aria-label': 'Your answer'
      }));
    } else if (q.type === 'match') {
      var rights = Lab.shuffle(q.pairs.map(function (p) { return p.label; }));
      q.pairs.forEach(function (p, i) {
        var left = p.mol ? state.mols[p.mol].name : p.left;
        var sel = Lab.h('select', { 'data-i': String(i), class: 'qz-select', 'aria-label': 'Match for ' + left });
        sel.appendChild(Lab.h('option', { value: '', text: 'Choose…' }));
        rights.forEach(function (r) { sel.appendChild(Lab.h('option', { value: r, text: r })); });
        input.appendChild(Lab.h('div', { class: 'qz-match-row' }, [
          Lab.h('span', { text: left }),
          sel
        ]));
      });
    }
    startTimer();
  }

  function normalize(s) {
    return String(s || '').trim().toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '');
  }

  function check(timedOut) {
    if (state.answered) { return; }
    state.answered = true;
    clearTimer();
    var q = state.queue[state.index];
    var ok = false;
    if (q.type === 'mcq') {
      var picked = document.querySelector('input[name="qzOpt"]:checked');
      ok = picked && Number(picked.value) === q.answer;
    } else if (q.type === 'tf') {
      var tf = document.querySelector('input[name="qzOpt"]:checked');
      ok = tf && (tf.value === 'true') === q.answer;
    } else if (q.type === 'fill') {
      var val = normalize(document.getElementById('qzFill').value);
      ok = q.answers.some(function (a) { return normalize(a) === val; });
    } else if (q.type === 'match') {
      ok = true;
      Array.prototype.forEach.call(document.querySelectorAll('#qzInput select'), function (sel) {
        var i = Number(sel.getAttribute('data-i'));
        if (sel.value !== q.pairs[i].label) { ok = false; }
      });
    }
    if (timedOut) { ok = false; }
    if (ok) { state.score += 1; }
    else { state.wrong.push(q); }
    state.history.push({ id: q.id, ok: ok });
    var fb = document.getElementById('qzFeedback');
    fb.hidden = false;
    fb.className = 'lab-note ' + (ok ? '' : 'is-error');
    fb.textContent = (timedOut ? 'Time is up. ' : (ok ? 'Correct. ' : 'Not quite. ')) + q.explanation;
    document.getElementById('qzCheck').hidden = true;
    document.getElementById('qzNextQ').hidden = false;
    document.getElementById('qzScoreLive').textContent = 'Score ' + state.score;
  }

  function finish() {
    show('summary');
    var total = state.queue.length;
    var pct = total ? Math.round((state.score / total) * 100) : 0;
    document.getElementById('qzSummaryText').textContent =
      'You scored ' + state.score + ' out of ' + total + ' (' + pct + '%).';
    var list = document.getElementById('qzSummaryList');
    Lab.clear(list);
    state.history.forEach(function (h, i) {
      var q = state.queue[i];
      list.appendChild(Lab.h('li', {
        text: (h.ok ? '✓ ' : '✗ ') + q.prompt
      }));
    });
    Lab.progress.update(function (d) {
      d.quiz.history.push({ key: filterKey(), pct: pct, at: Date.now() });
      var prev = d.quiz.best[filterKey()];
      if (!prev || pct >= prev.pct) { d.quiz.best[filterKey()] = { pct: pct, at: Date.now() }; }
    });
    document.getElementById('qzRetryWrong').disabled = state.wrong.length === 0;
  }

  function start(queue) {
    state.queue = queue;
    state.index = 0;
    state.score = 0;
    state.wrong = [];
    state.history = [];
    show('play');
    renderQuestion();
  }

  function wire() {
    document.getElementById('qzTimer').addEventListener('change', function (ev) {
      state.timerOn = !!ev.target.checked;
    });
    document.getElementById('qzShuffle').addEventListener('change', function (ev) {
      state.shuffle = !!ev.target.checked;
    });
    document.getElementById('qzStart').addEventListener('click', function () {
      var list = filtered();
      start(state.shuffle ? Lab.shuffle(list) : list.slice());
    });
    document.getElementById('qzCheck').addEventListener('click', function () { check(false); });
    document.getElementById('qzNextQ').addEventListener('click', function () {
      if (state.index >= state.queue.length - 1) { finish(); }
      else { state.index += 1; renderQuestion(); }
    });
    document.getElementById('qzAgain').addEventListener('click', function () {
      show('setup');
      updateCount();
    });
    document.getElementById('qzRetryWrong').addEventListener('click', function () {
      if (!state.wrong.length) { return; }
      start(state.shuffle ? Lab.shuffle(state.wrong.slice()) : state.wrong.slice());
    });
    if (tool) {
      tool.addEventListener('lab:next', function () {
        if (!document.getElementById('qzPlay').hidden) {
          if (state.answered) { document.getElementById('qzNextQ').click(); }
          else { check(false); }
        }
      });
      tool.addEventListener('lab:prev', function () { /* no back inside a scored quiz */ });
      tool.addEventListener('lab:toggle', function () {
        if (!document.getElementById('qzPlay').hidden && !state.answered) { check(false); }
      });
    }
  }

  Lab.init().then(function () {
    return Promise.all([
      Lab.loadJSON('quiz.json'),
      Lab.loadJSON('molecules.json'),
      Lab.loadJSON('hydrocarbons.json')
    ]);
  }).then(function (pack) {
    state.data = pack[0];
    state.mols = pack[1].molecules || pack[1];
    state.hydro = pack[2];
    if (loading) { loading.hidden = true; }
    if (app) { app.hidden = false; }
    Lab.progress.visit('quiz');
    wire();
    renderFilters();
    updateCount();
    show('setup');
  }).catch(function (err) {
    if (loading) { loading.hidden = true; }
    Lab.showError(tool || document.getElementById('main'), err);
  });
})();
