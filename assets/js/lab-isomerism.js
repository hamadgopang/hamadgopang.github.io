/* ==========================================================================
   lab-isomerism.js  -  Isomerism Explorer
   ========================================================================== */
(function () {
  'use strict';
  var Lab = window.Lab;
  if (!Lab) { return; }

  var loading = document.getElementById('labLoading');
  var app = document.getElementById('labApp');

  var state = {
    sets: [],
    mols: null,
    set: null,
    type: 'all',
    picked: []
  };

  function resolveSpec(iso) {
    if (iso.spec) { return iso.spec; }
    if (iso.mol && state.mols[iso.mol]) { return state.mols[iso.mol]; }
    return null;
  }

  function visibleIsomers() {
    if (!state.set) { return []; }
    return state.set.isomers.filter(function (iso) {
      return state.type === 'all' || iso.type === state.type;
    });
  }

  function renderSets() {
    var wrap = document.getElementById('isoSets');
    Lab.clear(wrap);
    state.sets.forEach(function (s) {
      var btn = Lab.h('button', {
        type: 'button',
        class: 'iso-chip' + (state.set && state.set.id === s.id ? ' is-active' : ''),
        'aria-pressed': state.set && state.set.id === s.id ? 'true' : 'false',
        text: s.formula
      });
      btn.addEventListener('click', function () {
        state.set = s;
        state.type = 'all';
        state.picked = [];
        renderSets();
        renderTypes();
        renderGrid();
        renderCompare();
      });
      wrap.appendChild(btn);
    });
  }

  function renderTypes() {
    var wrap = document.getElementById('isoTypes');
    Lab.clear(wrap);
    var types = ['all'].concat((state.set && state.set.types) || []);
    var labels = { all: 'All', chain: 'Chain', position: 'Position', functional: 'Functional', geometric: 'Geometric' };
    types.forEach(function (t) {
      var btn = Lab.h('button', {
        type: 'button',
        class: 'iso-chip iso-chip--soft' + (state.type === t ? ' is-active' : ''),
        'aria-pressed': state.type === t ? 'true' : 'false',
        text: labels[t] || t
      });
      btn.addEventListener('click', function () {
        state.type = t;
        state.picked = [];
        renderTypes();
        renderGrid();
        renderCompare();
      });
      wrap.appendChild(btn);
    });
    document.getElementById('isoBlurb').textContent = state.set ? (state.set.blurb || '') : '';
  }

  function togglePick(id) {
    var i = state.picked.indexOf(id);
    if (i >= 0) { state.picked.splice(i, 1); }
    else if (state.picked.length < 2) { state.picked.push(id); }
    else { state.picked = [state.picked[1], id]; }
    renderGrid();
    renderCompare();
  }

  function renderGrid() {
    var grid = document.getElementById('isoGrid');
    Lab.clear(grid);
    var items = visibleIsomers();
    if (!items.length) {
      grid.appendChild(Lab.h('p', { class: 'lab-muted', text: 'No isomers for this filter.' }));
      return;
    }
    items.forEach(function (iso) {
      var selected = state.picked.indexOf(iso.id) !== -1;
      var card = Lab.h('article', { class: 'iso-card' + (selected ? ' is-selected' : '') });
      var head = Lab.h('div', { class: 'iso-card-head' }, [
        Lab.h('h3', { text: iso.name }),
        Lab.h('span', { class: 'iso-type', text: iso.type })
      ]);
      var stage = Lab.h('div', { class: 'mol-stage iso-stage' });
      var spec = resolveSpec(iso);
      if (spec) {
        try {
          stage.appendChild(Lab.renderSVG(Lab.layoutSpec(spec), { label: iso.name, fluid: true }));
        } catch (e) {
          stage.appendChild(Lab.h('p', { class: 'lab-muted', text: 'Structure unavailable.' }));
        }
      }
      var diff = Lab.h('p', { class: 'iso-diff', text: iso.diff || '' });
      var btn = Lab.h('button', {
        type: 'button',
        class: 'lab-btn lab-btn--ghost lab-btn--small',
        text: selected ? 'Selected for compare' : 'Select to compare'
      });
      btn.addEventListener('click', function () { togglePick(iso.id); });
      card.appendChild(head);
      card.appendChild(stage);
      card.appendChild(diff);
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function renderCompare() {
    var box = document.getElementById('isoCompare');
    if (state.picked.length < 2 || !state.set) {
      box.hidden = true;
      Lab.clear(box);
      return;
    }
    var a = state.set.isomers.find(function (x) { return x.id === state.picked[0]; });
    var b = state.set.isomers.find(function (x) { return x.id === state.picked[1]; });
    if (!a || !b) { box.hidden = true; return; }
    box.hidden = false;
    Lab.clear(box);
    box.appendChild(Lab.h('strong', { text: 'Compare: ' }));
    box.appendChild(document.createTextNode(a.name + ' vs ' + b.name + ' — '));
    box.appendChild(document.createTextNode(
      (a.type === b.type ? 'Same isomer class (' + a.type + '). ' : 'Different classes (' + a.type + ' vs ' + b.type + '). ') +
      a.diff + ' ' + b.diff
    ));
  }

  function step(delta) {
    if (!state.sets.length) { return; }
    var idx = state.sets.findIndex(function (s) { return state.set && s.id === state.set.id; });
    if (idx < 0) { idx = 0; }
    idx = (idx + delta + state.sets.length) % state.sets.length;
    state.set = state.sets[idx];
    state.type = 'all';
    state.picked = [];
    renderSets();
    renderTypes();
    renderGrid();
    renderCompare();
  }

  Lab.init().then(function () {
    return Promise.all([Lab.loadJSON('isomerism.json'), Lab.loadJSON('molecules.json')]);
  }).then(function (pair) {
    state.sets = pair[0].sets || [];
    state.mols = pair[1].molecules || {};
    state.set = state.sets[0] || null;
    var root = document.querySelector('[data-teacher-root]');
    if (root) {
      root.addEventListener('lab:next', function () { step(1); });
      root.addEventListener('lab:prev', function () { step(-1); });
    }
    renderSets();
    renderTypes();
    renderGrid();
    renderCompare();
    Lab.progress.visit('isomerism');
    loading.hidden = true;
    app.hidden = false;
  }).catch(function (err) {
    Lab.showError(err && err.message ? err.message : 'Could not load Isomerism Explorer.');
  });
})();
