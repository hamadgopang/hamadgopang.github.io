/* ==========================================================================
   lab-homologous.js  -  Homologous Series Explorer
   Family and n controls, CH2-insertion morph, mass difference, members table.
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
    n: 2
  };

  var morph = null;
  var lastInfo = null;

  function family() {
    return state.data.families.filter(function (f) { return f.id === state.familyId; })[0];
  }

  function clamp() {
    var f = family();
    if (state.n < f.minC) { state.n = f.minC; }
    if (state.n > 10) { state.n = 10; }
  }

  function infoAt(n) {
    return Lab.hydroInfo(state.data, state.familyId, n, 1);
  }

  /* Remap the old terminal carbon (and its hydrogens) so they line up with
     the new terminal carbon after a CH2 unit is inserted. */
  function remapForInsert(layout, oldN) {
    var last = oldN - 1;
    return Lab.remap(layout, function (key) {
      if (key === 'c' + last) { return 'c' + oldN; }
      if (key.indexOf('c' + last + 'h') === 0) {
        return 'c' + oldN + key.slice(('c' + last).length);
      }
      return key;
    });
  }

  function highlightCH2(layout, index) {
    var hl = {};
    layout.atoms.forEach(function (a) {
      if (a.key === 'c' + index || a.key.indexOf('c' + index + 'h') === 0) {
        hl[a.key] = true;
      }
    });
    var out = Lab.remap(layout, function (k) { return k; });
    out.hl = hl;
    out.hlb = {};
    return out;
  }

  function ensureMorph() {
    if (morph) { return; }
    var stage = document.getElementById('hsStage');
    var pack = Lab.animatedSVG({ x: -50, y: -80, w: 200, h: 160 }, {
      fluid: true,
      highlight: true,
      label: 'Homologous series member'
    });
    stage.appendChild(pack.svg);
    morph = pack.morph;
  }

  function renderFamilyTabs() {
    var box = document.getElementById('hsFamily');
    Lab.clear(box);
    state.data.families.forEach(function (f) {
      var btn = Lab.h('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': f.id === state.familyId,
        text: f.name
      });
      btn.addEventListener('click', function () {
        state.familyId = f.id;
        clamp();
        show(false);
      });
      box.appendChild(btn);
    });
  }

  function renderStats(info, prev) {
    var stats = document.getElementById('hsStats');
    Lab.clear(stats);
    var rows = [
      ['Carbon atoms', String(info.counts.C || 0)],
      ['Hydrogen atoms', String(info.counts.H || 0)],
      ['Mr (approx.)', Lab.formatNumber(info.mass)],
      ['General formula', info.family.general]
    ];
    if (prev) {
      rows.push(['ΔMr from previous', '+' + Lab.formatNumber(info.mass - prev.mass)]);
      rows.push(['Formula difference', 'CH2']);
    }
    rows.forEach(function (row) {
      stats.appendChild(Lab.h('div', { class: 'lab-stat' }, [
        Lab.h('dt', { text: row[0] }),
        Lab.h('dd', { text: row[1] })
      ]));
    });
  }

  function renderTable() {
    var f = family();
    var tbody = document.querySelector('#hsTable tbody');
    Lab.clear(tbody);
    var prevMass = null;
    var n;
    for (n = f.minC; n <= 10; n++) {
      var info = infoAt(n);
      var dMr = prevMass === null ? '—' : '+' + Lab.formatNumber(info.mass - prevMass);
      var tr = Lab.h('tr', { class: n === state.n ? 'is-current' : '' }, [
        Lab.h('td', { text: String(n) }),
        Lab.h('td', null, [
          Lab.h('button', { type: 'button', class: 'row-btn', 'data-n': String(n), text: info.name })
        ]),
        Lab.h('td', null, [Lab.formulaEl(info.formula)]),
        Lab.h('td', null, [Lab.formulaEl(info.condensed.full)]),
        Lab.h('td', { text: Lab.formatNumber(info.mass) }),
        Lab.h('td', { text: dMr })
      ]);
      tbody.appendChild(tr);
      prevMass = info.mass;
    }
    tbody.querySelectorAll('button.row-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goTo(Number(btn.getAttribute('data-n')), true);
      });
    });
  }

  function renderCopy(info, prev) {
    document.getElementById('hsName').textContent = info.name.charAt(0).toUpperCase() + info.name.slice(1);
    document.getElementById('hsCarbonVal').textContent = String(state.n);
    document.getElementById('hsCarbons').min = String(info.family.minC);
    document.getElementById('hsCarbons').value = String(state.n);

    var line = document.getElementById('hsFormulaLine');
    Lab.clear(line);
    line.appendChild(Lab.h('span', { class: 'lab-muted', text: 'Molecular ' }));
    line.appendChild(Lab.formulaEl(info.formula));
    line.appendChild(Lab.h('span', { class: 'lab-muted', text: '  ·  Condensed ' }));
    line.appendChild(Lab.formulaEl(info.condensed.full));

    var note = document.getElementById('hsDiffNote');
    Lab.clear(note);
    if (prev) {
      note.appendChild(document.createTextNode('Difference from '));
      note.appendChild(Lab.h('strong', { text: prev.name }));
      note.appendChild(document.createTextNode(': one '));
      note.appendChild(Lab.formulaEl('CH2'));
      note.appendChild(document.createTextNode(' unit (Mr +' + Lab.formatNumber(info.mass - prev.mass) + ').'));
    } else {
      note.appendChild(document.createTextNode('This is the first member shown for this family in the Lab.'));
    }

    document.getElementById('hsPattern').textContent =
      'Each step along the ' + info.family.name.toLowerCase() +
      ' series adds CH2. The general formula is ' + info.family.general +
      ' (acyclic, one multiple bond where stated).';

    var features = document.getElementById('hsFeatures');
    Lab.clear(features);
    info.family.features.forEach(function (t) {
      features.appendChild(Lab.h('li', null, [t]));
    });

    document.getElementById('hsPrev').disabled = state.n <= info.family.minC;
    document.getElementById('hsNext').disabled = state.n >= 10;
  }

  function show(animateFromPrev) {
    clamp();
    ensureMorph();
    renderFamilyTabs();
    var info = infoAt(state.n);
    var prev = state.n > info.family.minC ? infoAt(state.n - 1) : null;
    renderCopy(info, prev);
    renderStats(info, prev);
    renderTable();

    var layout = Lab.layoutSpec(info.spec);
    if (prev && animateFromPrev) {
      var from = remapForInsert(Lab.layoutSpec(prev.spec), prev.n);
      var to = highlightCH2(layout, state.n - 1);
      morph.setHighlight(true);
      morph.show(from);
      morph.to(to, { duration: Lab.prefersReduced() ? 0 : 1100 });
    } else {
      morph.setHighlight(false);
      morph.show(layout);
    }
    lastInfo = info;
  }

  function goTo(n, animate) {
    var f = family();
    var next = Math.max(f.minC, Math.min(10, n));
    var shouldAnimate = !!animate && next === state.n + 1;
    state.n = next;
    show(shouldAnimate);
  }

  function wire() {
    document.getElementById('hsCarbons').addEventListener('input', function (ev) {
      goTo(Number(ev.target.value), Number(ev.target.value) === state.n + 1);
    });
    document.getElementById('hsPrev').addEventListener('click', function () {
      goTo(state.n - 1, false);
    });
    document.getElementById('hsNext').addEventListener('click', function () {
      goTo(state.n + 1, true);
    });

    if (tool) {
      var families = ['alkane', 'alkene', 'alkyne'];
      tool.addEventListener('lab:next', function () { goTo(state.n + 1, true); });
      tool.addEventListener('lab:prev', function () { goTo(state.n - 1, false); });
      tool.addEventListener('lab:up', function () {
        var i = families.indexOf(state.familyId);
        state.familyId = families[(i + families.length - 1) % families.length];
        clamp();
        show(false);
      });
      tool.addEventListener('lab:down', function () {
        var i = families.indexOf(state.familyId);
        state.familyId = families[(i + 1) % families.length];
        clamp();
        show(false);
      });
      tool.addEventListener('lab:toggle', function () {
        if (state.n < 10) { goTo(state.n + 1, true); }
      });
    }
  }

  Lab.init().then(function () {
    return Lab.loadJSON('hydrocarbons.json');
  }).then(function (data) {
    state.data = data;
    if (loading) { loading.hidden = true; }
    if (app) { app.hidden = false; }
    Lab.progress.visit('homologous-series');
    wire();
    show(false);
  }).catch(function (err) {
    if (loading) { loading.hidden = true; }
    Lab.showError(tool || document.getElementById('main'), err);
  });
})();
