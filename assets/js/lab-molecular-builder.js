/* ==========================================================================
   lab-molecular-builder.js  -  Matric Molecular Builder
   Place atoms, bond them, validate valencies, load presets.
   ========================================================================== */
(function () {
  'use strict';
  var Lab = window.Lab;
  if (!Lab) { return; }

  var loading = document.getElementById('labLoading');
  var app = document.getElementById('labApp');
  var canvas = document.getElementById('mbCanvas');

  var state = {
    atoms: [], // {id, el, x, y}
    bonds: [], // {a, b, o}
    element: 'C',
    bondOrder: 1,
    selected: null,
    bondFrom: null,
    history: [],
    presets: [],
    mols: null,
    nextId: 1
  };

  var COLORS = { C: '#1f2937', H: '#6b7280', O: '#b91c1c', N: '#1d4ed8', Cl: '#15803d', Br: '#a16207' };

  function snapshot() {
    return {
      atoms: state.atoms.map(function (a) { return { id: a.id, el: a.el, x: a.x, y: a.y }; }),
      bonds: state.bonds.map(function (b) { return { a: b.a, b: b.b, o: b.o }; }),
      nextId: state.nextId
    };
  }

  function pushHistory() {
    state.history.push(snapshot());
    if (state.history.length > 40) { state.history.shift(); }
  }

  function restore(snap) {
    state.atoms = snap.atoms;
    state.bonds = snap.bonds;
    state.nextId = snap.nextId;
    state.selected = null;
    state.bondFrom = null;
    draw();
    updateStatus();
  }

  function toLayout() {
    var index = {};
    var atoms = state.atoms.map(function (a, i) {
      index[a.id] = i;
      return { key: 'a' + i, el: a.el, x: a.x, y: a.y };
    });
    var bonds = state.bonds.map(function (b) {
      return { a: 'a' + index[b.a], b: 'a' + index[b.b], o: b.o };
    }).filter(function (b) { return b.a.indexOf('undefined') === -1 && b.b.indexOf('undefined') === -1; });
    return { atoms: atoms, bonds: bonds, lines: [], open: {}, hl: {}, hlb: {}, decor: [], bbox: { x: 0, y: 0, w: 400, h: 280 } };
  }

  function updateStatus() {
    var layout = toLayout();
    var counts = Lab.countAtoms(layout);
    var formula = Object.keys(counts).length ? Lab.hillString(counts) : '—';
    var mass = Object.keys(counts).length ? Lab.massOf(counts) : '—';
    var countText = Object.keys(counts).sort().map(function (el) {
      return el + ' ' + counts[el];
    }).join(' · ') || '—';
    document.getElementById('mbFormula').textContent = formula;
    document.getElementById('mbMass').textContent = mass === '—' ? '—' : String(mass);
    document.getElementById('mbCounts').textContent = countText;

    var valenceEl = document.getElementById('mbValence');
    if (!state.atoms.length) {
      valenceEl.className = 'mb-valence';
      valenceEl.textContent = 'Add atoms to begin.';
      return;
    }
    var problems = Lab.checkValence(layout);
    if (!problems.length) {
      valenceEl.className = 'mb-valence is-ok';
      valenceEl.textContent = 'All valencies are satisfied.';
    } else {
      valenceEl.className = 'mb-valence is-bad';
      valenceEl.textContent = problems.length + ' valence issue' + (problems.length === 1 ? '' : 's') + ': ' + problems[0];
    }
  }

  function draw() {
    while (canvas.firstChild) { canvas.removeChild(canvas.firstChild); }
    var ns = 'http://www.w3.org/2000/svg';

    state.bonds.forEach(function (b) {
      var a1 = state.atoms.find(function (a) { return a.id === b.a; });
      var a2 = state.atoms.find(function (a) { return a.id === b.b; });
      if (!a1 || !a2) { return; }
      var dx = a2.x - a1.x;
      var dy = a2.y - a1.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var px = -dy / len * 4;
      var py = dx / len * 4;
      var orders = b.o || 1;
      var offsets = orders === 1 ? [0] : (orders === 2 ? [-1, 1] : [-1.4, 0, 1.4]);
      offsets.forEach(function (o) {
        var line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', a1.x + px * o);
        line.setAttribute('y1', a1.y + py * o);
        line.setAttribute('x2', a2.x + px * o);
        line.setAttribute('y2', a2.y + py * o);
        line.setAttribute('class', 'mb-bond');
        canvas.appendChild(line);
      });
    });

    state.atoms.forEach(function (a) {
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'mb-atom' + (state.selected === a.id ? ' is-selected' : '') + (state.bondFrom === a.id ? ' is-bond-from' : ''));
      g.setAttribute('data-id', a.id);
      g.style.cursor = 'pointer';
      var circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', a.x);
      circle.setAttribute('cy', a.y);
      circle.setAttribute('r', a.el === 'H' ? 12 : 16);
      circle.setAttribute('fill', COLORS[a.el] || '#334155');
      var text = document.createElementNS(ns, 'text');
      text.setAttribute('x', a.x);
      text.setAttribute('y', a.y + 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'mb-atom-label');
      text.textContent = a.el;
      g.appendChild(circle);
      g.appendChild(text);
      g.addEventListener('click', function (ev) {
        ev.stopPropagation();
        onAtomClick(a.id);
      });
      canvas.appendChild(g);
    });
  }

  function usedValence(id) {
    var sum = 0;
    state.bonds.forEach(function (b) {
      if (b.a === id || b.b === id) { sum += b.o; }
    });
    return sum;
  }

  function onAtomClick(id) {
    if (state.bondFrom && state.bondFrom !== id) {
      pushHistory();
      var existing = state.bonds.find(function (b) {
        return (b.a === id && b.b === state.bondFrom) || (b.b === id && b.a === state.bondFrom);
      });
      if (existing) { existing.o = state.bondOrder; }
      else { state.bonds.push({ a: state.bondFrom, b: id, o: state.bondOrder }); }
      state.bondFrom = null;
      state.selected = id;
      draw();
      updateStatus();
      return;
    }
    if (state.selected === id) {
      state.bondFrom = id;
    } else {
      state.selected = id;
      state.bondFrom = null;
    }
    draw();
  }

  function placeAtom(x, y) {
    pushHistory();
    state.atoms.push({ id: state.nextId++, el: state.element, x: x, y: y });
    state.selected = state.nextId - 1;
    state.bondFrom = null;
    draw();
    updateStatus();
  }

  function canvasPoint(ev) {
    var pt = canvas.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    var ctm = canvas.getScreenCTM();
    if (!ctm) { return { x: 200, y: 140 }; }
    var local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }

  function clearAll() {
    pushHistory();
    state.atoms = [];
    state.bonds = [];
    state.selected = null;
    state.bondFrom = null;
    draw();
    updateStatus();
  }

  function undo() {
    var snap = state.history.pop();
    if (!snap) { return; }
    restore(snap);
  }

  function deleteSelected() {
    if (state.selected == null) { return; }
    pushHistory();
    var id = state.selected;
    state.atoms = state.atoms.filter(function (a) { return a.id !== id; });
    state.bonds = state.bonds.filter(function (b) { return b.a !== id && b.b !== id; });
    state.selected = null;
    state.bondFrom = null;
    draw();
    updateStatus();
  }

  function autoAddH() {
    pushHistory();
    var layout = toLayout();
    var indexToId = {};
    state.atoms.forEach(function (a, i) { indexToId[i] = a.id; });
    var sums = {};
    state.bonds.forEach(function (b) {
      sums[b.a] = (sums[b.a] || 0) + b.o;
      sums[b.b] = (sums[b.b] || 0) + b.o;
    });
    var added = [];
    state.atoms.slice().forEach(function (a) {
      if (a.el === 'H') { return; }
      var need = Lab.valenceOf(a.el) - (sums[a.id] || 0);
      var i;
      for (i = 0; i < need; i++) {
        var ang = (-Math.PI / 2) + (i * (Math.PI * 2 / Math.max(need, 1)));
        var hx = a.x + Math.cos(ang) * 36;
        var hy = a.y + Math.sin(ang) * 36;
        var hid = state.nextId++;
        added.push({ id: hid, el: 'H', x: hx, y: hy });
        state.bonds.push({ a: a.id, b: hid, o: 1 });
      }
    });
    state.atoms = state.atoms.concat(added);
    draw();
    updateStatus();
  }

  function loadSpec(spec) {
    pushHistory();
    var layout = Lab.layoutSpec(spec);
    state.atoms = layout.atoms.map(function (a) {
      return { id: state.nextId++, el: a.el, x: a.x + 200, y: a.y + 140 };
    });
    // Remap keys to ids: layout uses keys; rebuild bonds by matching atom order
    var keyToId = {};
    layout.atoms.forEach(function (a, i) { keyToId[a.key] = state.atoms[i].id; });
    state.bonds = layout.bonds.map(function (b) {
      return { a: keyToId[b.a], b: keyToId[b.b], o: b.o };
    });
    state.selected = null;
    state.bondFrom = null;
    draw();
    updateStatus();
  }

  function renderChrome() {
    var atomWrap = document.getElementById('mbAtoms');
    Lab.clear(atomWrap);
    ['C', 'H', 'O', 'N', 'Cl', 'Br'].forEach(function (el) {
      var btn = Lab.h('button', {
        type: 'button',
        class: 'mb-atom-btn' + (state.element === el ? ' is-active' : ''),
        text: el
      });
      btn.addEventListener('click', function () {
        state.element = el;
        renderChrome();
      });
      atomWrap.appendChild(btn);
    });

    var bondWrap = document.getElementById('mbBonds');
    Lab.clear(bondWrap);
    [1, 2, 3].forEach(function (o) {
      var label = o === 1 ? 'Single' : (o === 2 ? 'Double' : 'Triple');
      var btn = Lab.h('button', {
        type: 'button',
        class: state.bondOrder === o ? 'is-active' : '',
        text: label
      });
      btn.addEventListener('click', function () {
        state.bondOrder = o;
        renderChrome();
      });
      bondWrap.appendChild(btn);
    });

    var presetWrap = document.getElementById('mbPresets');
    Lab.clear(presetWrap);
    state.presets.forEach(function (p) {
      var btn = Lab.h('button', { type: 'button', class: 'mb-preset', text: p.name });
      btn.addEventListener('click', function () {
        var spec = state.mols[p.mol];
        if (spec) { loadSpec(spec); }
      });
      presetWrap.appendChild(btn);
    });
  }

  function bind() {
    canvas.addEventListener('click', function (ev) {
      if (ev.target.closest && ev.target.closest('.mb-atom')) { return; }
      var pt = canvasPoint(ev);
      placeAtom(pt.x, pt.y);
    });
    document.getElementById('mbUndo').addEventListener('click', undo);
    document.getElementById('mbClear').addEventListener('click', clearAll);
    document.getElementById('mbDelete').addEventListener('click', deleteSelected);
    document.getElementById('mbAutoH').addEventListener('click', autoAddH);
  }

  Lab.init().then(function () {
    return Promise.all([Lab.loadJSON('molecular-builder.json'), Lab.loadJSON('molecules.json')]);
  }).then(function (pair) {
    state.presets = pair[0].presets || [];
    state.mols = pair[1].molecules || {};
    renderChrome();
    bind();
    draw();
    updateStatus();
    Lab.progress.visit('molecular-builder');
    loading.hidden = true;
    app.hidden = false;
  }).catch(function (err) {
    Lab.showError(err && err.message ? err.message : 'Could not load Molecular Builder.');
  });
})();
