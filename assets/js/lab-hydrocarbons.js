/* ==========================================================================
   lab-hydrocarbons.js  -  Hydrocarbons Explorer
   Family tabs, carbon slider, bond position, highlight, condensed formula,
   bond comparison, ethane→ethene/ethyne morph, Compare Families panel.
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
    familyId: 'alkane',
    n: 1,
    pos: 1,
    highlight: true,
    compact: false,
    morphKind: 'ethane-ethene',
    compareN: 4
  };

  var morph = null;
  var morphLayouts = null;

  function family() {
    return state.data.families.filter(function (f) { return f.id === state.familyId; })[0];
  }

  function clampControls() {
    var f = family();
    if (state.n < f.minC) { state.n = f.minC; }
    if (state.n > 10) { state.n = 10; }
    var maxPos = Lab.positionCount(f, state.n);
    if (state.pos > maxPos) { state.pos = maxPos; }
    if (state.pos < 1) { state.pos = 1; }
  }

  function hlKeys(info) {
    if (!state.highlight || info.family.bondOrder === 1) {
      return { hl: [], hlb: [] };
    }
    var i = (info.pos || 1) - 1;
    var a = 'c' + i;
    var b = 'c' + (i + 1);
    return { hl: [a, b], hlb: [a + '-' + b] };
  }

  function layoutFor(info) {
    var keys = hlKeys(info);
    return Lab.layoutSpec(Lab.withHighlight(info.spec, keys.hl, keys.hlb));
  }

  function setFormula(target, str) {
    Lab.clear(target);
    target.appendChild(Lab.formulaEl(str));
  }

  function stateLabel(s) {
    if (!s) { return '—'; }
    if (s === 'gas') { return 'Gas at room temperature'; }
    if (s === 'liquid') { return 'Liquid at room temperature'; }
    if (s === 'low-boiling liquid') { return 'Low-boiling liquid at room temperature'; }
    return s;
  }

  function renderFamilyTabs() {
    var box = document.getElementById('hcFamily');
    Lab.clear(box);
    state.data.families.forEach(function (f) {
      var btn = Lab.h('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': f.id === state.familyId,
        'data-family': f.id,
        text: f.name
      });
      btn.addEventListener('click', function () {
        state.familyId = f.id;
        clampControls();
        update();
      });
      box.appendChild(btn);
    });
  }

  function renderPos() {
    var field = document.getElementById('hcPosField');
    var box = document.getElementById('hcPos');
    var f = family();
    var count = Lab.positionCount(f, state.n);
    if (f.bondOrder === 1 || count <= 1) {
      field.hidden = true;
      Lab.clear(box);
      return;
    }
    field.hidden = false;
    Lab.clear(box);
    var i;
    for (i = 1; i <= count; i++) {
      var label = state.data.prefixes[state.n - 1] + '-' + i + '-' + f.suffix;
      var btn = Lab.h('button', {
        type: 'button',
        'aria-pressed': i === state.pos,
        'data-pos': String(i),
        text: label
      });
      btn.addEventListener('click', function (ev) {
        state.pos = Number(ev.currentTarget.getAttribute('data-pos'));
        update();
      });
      box.appendChild(btn);
    }
  }

  function renderMain(info) {
    document.getElementById('hcName').textContent = info.name.charAt(0).toUpperCase() + info.name.slice(1);
    document.getElementById('hcCarbonVal').textContent = String(state.n);
    var carbons = document.getElementById('hcCarbons');
    carbons.min = String(info.family.minC);
    carbons.value = String(state.n);

    var line = document.getElementById('hcFormulaLine');
    Lab.clear(line);
    line.appendChild(Lab.h('span', { class: 'lab-muted', text: 'Molecular formula ' }));
    line.appendChild(Lab.formulaEl(info.formula));
    line.appendChild(Lab.h('span', { class: 'lab-muted', text: '  ·  Condensed ' }));
    line.appendChild(Lab.formulaEl(state.compact ? info.condensed.compact : info.condensed.full));
    line.appendChild(Lab.h('span', { class: 'lab-muted', text: '  ·  General ' }));
    line.appendChild(Lab.h('span', { class: 'formula', text: info.family.general }));

    var stage = document.getElementById('hcStage');
    Lab.clear(stage);
    var layout = layoutFor(info);
    stage.appendChild(Lab.renderSVG(layout, {
      fluid: true,
      highlight: state.highlight,
      label: 'Displayed formula of ' + info.name
    }));

    var stats = document.getElementById('hcStats');
    Lab.clear(stats);
    [
      ['Carbon atoms', String(info.counts.C || 0)],
      ['Hydrogen atoms', String(info.counts.H || 0)],
      ['Mr (approx.)', Lab.formatNumber(info.mass)],
      ['State', stateLabel(info.state)],
      ['Saturation', info.family.saturation],
      ['Bromine water', info.family.bromine]
    ].forEach(function (row) {
      var wrap = Lab.h('div', { class: 'lab-stat' }, [
        Lab.h('dt', { text: row[0] }),
        Lab.h('dd', { text: row[1] })
      ]);
      stats.appendChild(wrap);
    });

    document.getElementById('hcDefinition').textContent = info.family.definition;
    var features = document.getElementById('hcFeatures');
    Lab.clear(features);
    info.family.features.forEach(function (t) {
      features.appendChild(Lab.h('li', null, [t]));
    });
    var props = document.getElementById('hcProps');
    Lab.clear(props);
    info.family.properties.forEach(function (t) {
      props.appendChild(Lab.h('li', null, [t]));
    });

    document.getElementById('hcRxTitle').textContent = info.family.reactionTitle;
    document.getElementById('hcRxNote').textContent = info.family.reactionNote;
    var eq = document.getElementById('hcRxEq');
    Lab.clear(eq);
    eq.appendChild(document.createTextNode(info.family.reactionEq));
    var link = document.getElementById('hcRxLink');
    link.href = '../' + info.family.reactionLink;
  }

  function bondCard(title, order, symbol, pairs, note) {
    var spec = { chain: ['C', 'C'], bonds: [order], hl: ['c0', 'c1'], hlb: ['c0-c1'] };
    var layout = Lab.layoutSpec(spec);
    var svg = Lab.renderSVG(layout, {
      fluid: true,
      highlight: true,
      label: title + ' bond between two carbon atoms'
    });
    return Lab.h('article', { class: 'hc-bond-card' }, [
      Lab.h('h3', { text: title }),
      Lab.h('div', { class: 'mol-stage mol-stage--sm' }, [svg]),
      Lab.h('p', { class: 'hc-bond-symbol', text: symbol }),
      Lab.h('p', { text: pairs + ' shared electron pair' + (pairs === 1 ? '' : 's') + '.' }),
      Lab.h('p', { class: 'lab-muted', text: note })
    ]);
  }

  function renderBondGrid() {
    var grid = document.getElementById('hcBondGrid');
    Lab.clear(grid);
    grid.appendChild(bondCard('Single bond', 1, 'C–C', 1, 'Found in alkanes. Saturated.'));
    grid.appendChild(bondCard('Double bond', 2, 'C=C', 2, 'Found in alkenes. Unsaturated.'));
    grid.appendChild(bondCard('Triple bond', 3, 'C≡C', 3, 'Found in alkynes. Unsaturated.'));
  }

  function buildMorphLayouts(kind) {
    var ethane = Lab.hydroInfo(state.data, 'alkane', 2, 1);
    var targetId = kind === 'ethane-ethyne' ? 'alkyne' : 'alkene';
    var target = Lab.hydroInfo(state.data, targetId, 2, 1);
    var fromSpec = Lab.withHighlight(ethane.spec, [], []);
    var toKeys = { hl: ['c0', 'c1'], hlb: ['c0-c1'] };
    var toSpec = Lab.withHighlight(target.spec, toKeys.hl, toKeys.hlb);
    return {
      from: Lab.layoutSpec(fromSpec),
      to: Lab.layoutSpec(toSpec),
      note: kind === 'ethane-ethyne'
        ? 'Removing four hydrogen atoms from ethane and sharing three electron pairs gives ethyne (C≡C). This animation shows the overall change, not the detailed mechanism.'
        : 'Removing two hydrogen atoms from ethane and sharing a second electron pair gives ethene (C=C). This animation shows the overall change, not the detailed mechanism.'
    };
  }

  function ensureMorph() {
    var stage = document.getElementById('hcMorphStage');
    if (morph) { return; }
    var pack = Lab.animatedSVG({ x: -40, y: -70, w: 160, h: 140 }, {
      fluid: true,
      highlight: true,
      label: 'Bond formation animation'
    });
    stage.appendChild(pack.svg);
    morph = pack.morph;
  }

  function playMorph(forceReplay) {
    ensureMorph();
    morphLayouts = buildMorphLayouts(state.morphKind);
    document.getElementById('hcMorphNote').textContent = morphLayouts.note;
    morph.setHighlight(true);
    if (forceReplay || !morph.cur) {
      morph.show(morphLayouts.from);
    }
    morph.to(morphLayouts.to, { duration: Lab.prefersReduced() ? 0 : 1400 });
  }

  function renderMorphChoice() {
    var box = document.getElementById('hcMorphChoice');
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-morph') === state.morphKind ? 'true' : 'false');
    });
  }

  function renderCompare() {
    document.getElementById('hcCompareVal').textContent = String(state.compareN);
    document.getElementById('hcCompareN').value = String(state.compareN);
    var grid = document.getElementById('hcFamilyGrid');
    Lab.clear(grid);
    state.data.families.forEach(function (f) {
      if (state.compareN < f.minC) { return; }
      var info = Lab.hydroInfo(state.data, f.id, state.compareN, 1);
      var keys = f.bondOrder > 1
        ? { hl: ['c0', 'c1'], hlb: ['c0-c1'] }
        : { hl: [], hlb: [] };
      var layout = Lab.layoutSpec(Lab.withHighlight(info.spec, keys.hl, keys.hlb));
      var card = Lab.h('article', { class: 'hc-family-card' }, [
        Lab.h('h3', { text: f.name }),
        Lab.h('p', { class: 'hc-family-name', text: info.name }),
        Lab.h('div', { class: 'mol-stage mol-stage--sm' }, [
          Lab.renderSVG(layout, {
            fluid: true,
            highlight: f.bondOrder > 1,
            label: info.name
          })
        ]),
        Lab.h('p', null, [
          Lab.formulaEl(info.formula),
          document.createTextNode('  ·  Mr ' + Lab.formatNumber(info.mass))
        ]),
        Lab.h('p', { class: 'lab-muted', text: f.saturation + ' · ' + f.bondSymbol })
      ]);
      grid.appendChild(card);
    });
  }

  function update() {
    clampControls();
    renderFamilyTabs();
    renderPos();
    var info = Lab.hydroInfo(state.data, state.familyId, state.n, state.pos);
    renderMain(info);
    renderCompare();
  }

  function wire() {
    document.getElementById('hcCarbons').addEventListener('input', function (ev) {
      state.n = Number(ev.target.value);
      clampControls();
      update();
    });
    document.getElementById('hcHighlight').addEventListener('change', function (ev) {
      state.highlight = !!ev.target.checked;
      update();
    });
    document.getElementById('hcCompact').addEventListener('change', function (ev) {
      state.compact = !!ev.target.checked;
      update();
    });
    document.getElementById('hcCompareN').addEventListener('input', function (ev) {
      state.compareN = Number(ev.target.value);
      renderCompare();
    });
    document.getElementById('hcMorphChoice').addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[data-morph]');
      if (!btn) { return; }
      state.morphKind = btn.getAttribute('data-morph');
      renderMorphChoice();
      playMorph(true);
    });
    document.getElementById('hcMorphPlay').addEventListener('click', function () {
      playMorph(false);
    });
    document.getElementById('hcMorphReplay').addEventListener('click', function () {
      playMorph(true);
    });

    if (tool) {
      var families = ['alkane', 'alkene', 'alkyne'];
      tool.addEventListener('lab:next', function () {
        state.n = Math.min(10, state.n + 1);
        update();
      });
      tool.addEventListener('lab:prev', function () {
        state.n = Math.max(family().minC, state.n - 1);
        update();
      });
      tool.addEventListener('lab:up', function () {
        var i = families.indexOf(state.familyId);
        state.familyId = families[(i + families.length - 1) % families.length];
        clampControls();
        update();
      });
      tool.addEventListener('lab:down', function () {
        var i = families.indexOf(state.familyId);
        state.familyId = families[(i + 1) % families.length];
        clampControls();
        update();
      });
      tool.addEventListener('lab:toggle', function () {
        playMorph(false);
      });
    }
  }

  Lab.init().then(function () {
    return Lab.loadJSON('hydrocarbons.json');
  }).then(function (data) {
    state.data = data;
    if (loading) { loading.hidden = true; }
    if (app) { app.hidden = false; }
    Lab.progress.visit('hydrocarbons');
    wire();
    renderBondGrid();
    renderMorphChoice();
    ensureMorph();
    morphLayouts = buildMorphLayouts(state.morphKind);
    morph.show(morphLayouts.from);
    document.getElementById('hcMorphNote').textContent = morphLayouts.note;
    update();
  }).catch(function (err) {
    if (loading) { loading.hidden = true; }
    Lab.showError(tool || document.getElementById('main'), err);
  });
})();
