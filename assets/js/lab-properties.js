/* ==========================================================================
   lab-properties.js  -  Properties Lab
   Browse Matric organic properties and compare up to three compounds.
   ========================================================================== */
(function () {
  'use strict';
  var Lab = window.Lab;
  if (!Lab) { return; }

  var loading = document.getElementById('labLoading');
  var app = document.getElementById('labApp');

  var state = {
    families: [],
    compounds: [],
    mols: null,
    family: 'all',
    query: '',
    selected: null,
    compare: []
  };

  function molSpec(id) {
    return state.mols && state.mols[id] ? state.mols[id] : null;
  }

  function filtered() {
    var q = state.query.trim().toLowerCase();
    return state.compounds.filter(function (c) {
      if (state.family !== 'all' && c.family !== state.family) { return false; }
      if (!q) { return true; }
      var blob = [c.name, c.formula, c.eq || '', c.family, c.solubility || ''].join(' ').toLowerCase();
      return blob.indexOf(q) !== -1;
    });
  }

  function familyLabel(id) {
    var f = state.families.find(function (x) { return x.id === id; });
    return f ? f.label : id;
  }

  function renderFamilies() {
    var wrap = document.getElementById('plFamilies');
    Lab.clear(wrap);
    [{ id: 'all', label: 'All' }].concat(state.families).forEach(function (f) {
      var btn = Lab.h('button', {
        type: 'button',
        class: 'pl-chip' + (state.family === f.id ? ' is-active' : ''),
        'aria-pressed': state.family === f.id ? 'true' : 'false',
        text: f.label
      });
      btn.addEventListener('click', function () {
        state.family = f.id;
        renderFamilies();
        renderList();
      });
      wrap.appendChild(btn);
    });
  }

  function renderList() {
    var list = document.getElementById('plList');
    Lab.clear(list);
    var items = filtered();
    if (!items.length) {
      list.appendChild(Lab.h('li', { class: 'lab-muted', text: 'No compounds match.' }));
      return;
    }
    items.forEach(function (c) {
      var selected = state.selected && state.selected.id === c.id;
      var btn = Lab.h('button', {
        type: 'button',
        class: 'pl-item' + (selected ? ' is-selected' : ''),
        role: 'option',
        'aria-selected': selected,
        'data-id': c.id
      }, [
        Lab.h('span', { class: 'pl-item-name', text: c.name }),
        Lab.h('span', { class: 'pl-item-meta', text: (c.eq || c.formula) + ' · ' + c.state })
      ]);
      btn.addEventListener('click', function () { selectCompound(c.id); });
      list.appendChild(Lab.h('li', null, [btn]));
    });
  }

  function fact(label, value) {
    return Lab.h('div', null, [
      Lab.h('dt', { text: label }),
      Lab.h('dd', { text: value == null || value === '' ? '—' : String(value) })
    ]);
  }

  function renderDetail() {
    var empty = document.getElementById('plEmpty');
    var body = document.getElementById('plBody');
    var c = state.selected;
    if (!c) {
      empty.hidden = false;
      body.hidden = true;
      return;
    }
    empty.hidden = true;
    body.hidden = false;
    document.getElementById('plFamily').textContent = familyLabel(c.family);
    document.getElementById('plName').textContent = c.name;
    Lab.clear(document.getElementById('plFormula'));
    document.getElementById('plFormula').appendChild(Lab.formulaEl(c.eq || c.formula));

    var stage = document.getElementById('plStage');
    Lab.clear(stage);
    var spec = molSpec(c.id);
    if (spec) {
      try {
        var layout = Lab.layoutSpec(spec);
        stage.appendChild(Lab.renderSVG(layout, { label: c.name, fluid: true, scale: 1.15 }));
      } catch (e) {
        stage.appendChild(Lab.h('p', { class: 'lab-muted', text: 'Structure preview unavailable.' }));
      }
    } else {
      stage.appendChild(Lab.h('p', { class: 'lab-muted', text: 'No stored structure for this compound.' }));
    }

    var facts = document.getElementById('plFacts');
    Lab.clear(facts);
    [
      fact('State (≈25 °C)', c.state),
      fact('Boiling point', typeof c.bp === 'number' ? c.bp + ' °C' : c.bp),
      fact('Melting point', typeof c.mp === 'number' ? c.mp + ' °C' : c.mp),
      fact('Density', c.density),
      fact('Solubility in water', c.solubility),
      fact('Combustion / flammability', c.combustion)
    ].forEach(function (row) { facts.appendChild(row); });
    document.getElementById('plNote').textContent = c.note || '';

    var addBtn = document.getElementById('plAddCompare');
    var inCompare = state.compare.some(function (x) { return x.id === c.id; });
    addBtn.disabled = inCompare || state.compare.length >= 3;
    addBtn.textContent = inCompare ? 'Already in compare' : (state.compare.length >= 3 ? 'Compare full (3)' : 'Add to compare');
  }

  function renderCompare() {
    var wrap = document.getElementById('plCompareTable');
    var hint = document.getElementById('plCompareHint');
    Lab.clear(wrap);
    if (!state.compare.length) {
      hint.hidden = false;
      return;
    }
    hint.hidden = true;
    var rows = [
      ['Name', function (c) { return c.name; }],
      ['Formula', function (c) { return c.eq || c.formula; }],
      ['Family', function (c) { return familyLabel(c.family); }],
      ['State', function (c) { return c.state; }],
      ['B.P. (°C)', function (c) { return c.bp; }],
      ['M.P. (°C)', function (c) { return c.mp; }],
      ['Solubility', function (c) { return c.solubility; }]
    ];
    var table = Lab.h('table', { class: 'pl-table' });
    var thead = Lab.h('thead');
    var headRow = Lab.h('tr', null, [Lab.h('th', { text: 'Property' })]);
    state.compare.forEach(function (c) {
      var th = Lab.h('th');
      var remove = Lab.h('button', { type: 'button', class: 'pl-remove', 'aria-label': 'Remove ' + c.name, text: '×' });
      remove.addEventListener('click', function () {
        state.compare = state.compare.filter(function (x) { return x.id !== c.id; });
        renderDetail();
        renderCompare();
      });
      th.appendChild(document.createTextNode(c.name + ' '));
      th.appendChild(remove);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    var tbody = Lab.h('tbody');
    rows.forEach(function (row) {
      var tr = Lab.h('tr', null, [Lab.h('th', { scope: 'row', text: row[0] })]);
      state.compare.forEach(function (c) {
        tr.appendChild(Lab.h('td', { text: String(row[1](c)) }));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
  }

  function selectCompound(id) {
    state.selected = state.compounds.find(function (c) { return c.id === id; }) || null;
    renderList();
    renderDetail();
  }

  function step(delta) {
    var items = filtered();
    if (!items.length) { return; }
    var idx = 0;
    if (state.selected) {
      idx = items.findIndex(function (c) { return c.id === state.selected.id; });
      if (idx < 0) { idx = 0; }
    }
    idx = (idx + delta + items.length) % items.length;
    selectCompound(items[idx].id);
  }

  function bind() {
    document.getElementById('plSearch').addEventListener('input', function (ev) {
      state.query = ev.target.value || '';
      renderList();
    });
    document.getElementById('plAddCompare').addEventListener('click', function () {
      if (!state.selected) { return; }
      if (state.compare.some(function (c) { return c.id === state.selected.id; })) { return; }
      if (state.compare.length >= 3) { return; }
      state.compare.push(state.selected);
      renderDetail();
      renderCompare();
    });
    document.getElementById('plClearCompare').addEventListener('click', function () {
      state.compare = [];
      renderDetail();
      renderCompare();
    });
    var root = document.querySelector('[data-teacher-root]');
    if (root) {
      root.addEventListener('lab:next', function () { step(1); });
      root.addEventListener('lab:prev', function () { step(-1); });
      root.addEventListener('lab:down', function () { step(1); });
      root.addEventListener('lab:up', function () { step(-1); });
    }
  }

  Lab.init().then(function () {
    return Promise.all([
      Lab.loadJSON('properties-lab.json'),
      Lab.loadJSON('molecules.json')
    ]);
  }).then(function (pair) {
    state.families = pair[0].families || [];
    state.compounds = pair[0].compounds || [];
    state.mols = pair[1].molecules || {};
    bind();
    renderFamilies();
    renderList();
    renderDetail();
    renderCompare();
    if (state.compounds[0]) { selectCompound(state.compounds[0].id); }
    Lab.progress.visit('properties');
    loading.hidden = true;
    app.hidden = false;
  }).catch(function (err) {
    Lab.showError(err && err.message ? err.message : 'Could not load Properties Lab.');
  });
})();
