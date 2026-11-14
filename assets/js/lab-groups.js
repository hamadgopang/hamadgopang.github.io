/* ==========================================================================
   lab-groups.js  -  Functional Groups Explorer
   Twelve cards, search, example switcher, highlight, naming and reaction.
   ========================================================================== */
(function () {
  'use strict';
  var Lab = window.Lab;
  if (!Lab) { return; }

  var loading = document.getElementById('labLoading');
  var app = document.getElementById('labApp');
  var tool = document.getElementById('labTool');

  var state = {
    groups: [],
    mols: null,
    selected: null,
    example: null,
    highlight: true,
    query: ''
  };

  function molSpec(id) {
    return state.mols[id];
  }

  function layoutOf(id, highlight) {
    var spec = molSpec(id);
    var copy = {};
    Object.keys(spec).forEach(function (k) { copy[k] = spec[k]; });
    if (!highlight) {
      copy.hl = [];
      copy.hlb = [];
    }
    return Lab.layoutSpec(copy);
  }

  function equationText(r) {
    function side(list) {
      return list.map(function (sp) {
        var n = sp.n && sp.n > 1 ? sp.n + ' ' : '';
        if (sp.mol) { return n + (molSpec(sp.mol).eq || molSpec(sp.mol).formula); }
        return n + sp.f;
      }).join(' + ');
    }
    return side(r.reactants) + ' → ' + side(r.products);
  }

  function filtered() {
    var q = state.query.trim().toLowerCase();
    if (!q) { return state.groups; }
    return state.groups.filter(function (g) {
      var blob = [g.name, g.symbol, g.general, g.explain].join(' ').toLowerCase();
      return blob.indexOf(q) !== -1;
    });
  }

  function renderCards() {
    var list = document.getElementById('fgCards');
    Lab.clear(list);
    var items = filtered();
    if (!items.length) {
      list.appendChild(Lab.h('li', { class: 'lab-muted', text: 'No groups match that search.' }));
      return;
    }
    items.forEach(function (g) {
      var selected = state.selected && state.selected.id === g.id;
      var btn = Lab.h('button', {
        type: 'button',
        class: 'fg-card' + (selected ? ' is-selected' : ''),
        role: 'option',
        'aria-selected': selected,
        'data-id': g.id
      }, [
        Lab.h('span', { class: 'fg-card-symbol', text: g.symbol }),
        Lab.h('span', { class: 'fg-card-name', text: g.name }),
        Lab.h('span', { class: 'fg-card-general', text: g.general })
      ]);
      btn.addEventListener('click', function () { selectGroup(g.id); });
      list.appendChild(Lab.h('li', null, [btn]));
    });
  }

  function renderDetail() {
    var empty = document.getElementById('fgEmpty');
    var body = document.getElementById('fgBody');
    var g = state.selected;
    if (!g) {
      empty.hidden = false;
      body.hidden = true;
      return;
    }
    empty.hidden = true;
    body.hidden = false;

    document.getElementById('fgSymbol').textContent = g.symbol;
    document.getElementById('fgName').textContent = g.name;
    var gen = document.getElementById('fgGeneralLine');
    Lab.clear(gen);
    gen.appendChild(Lab.h('span', { class: 'lab-muted', text: 'General structure ' }));
    gen.appendChild(Lab.h('span', { class: 'formula', text: g.general }));

    var exBox = document.getElementById('fgExamples');
    Lab.clear(exBox);
    g.examples.forEach(function (id) {
      var mol = molSpec(id);
      var btn = Lab.h('button', {
        type: 'button',
        'aria-pressed': id === state.example,
        'data-mol': id,
        text: mol.name
      });
      btn.addEventListener('click', function () {
        state.example = id;
        renderDetail();
      });
      exBox.appendChild(btn);
    });

    var stage = document.getElementById('fgStage');
    Lab.clear(stage);
    var layout = layoutOf(state.example, state.highlight);
    stage.appendChild(Lab.renderSVG(layout, {
      fluid: true,
      highlight: state.highlight,
      label: molSpec(state.example).name
    }));

    var molLine = document.getElementById('fgMolLine');
    Lab.clear(molLine);
    var m = molSpec(state.example);
    molLine.appendChild(Lab.h('strong', { text: m.name }));
    molLine.appendChild(Lab.h('span', { class: 'lab-muted', text: '  ·  ' }));
    molLine.appendChild(Lab.formulaEl(m.formula));
    if (m.condensed) {
      molLine.appendChild(Lab.h('span', { class: 'lab-muted', text: '  ·  ' }));
      molLine.appendChild(Lab.formulaEl(m.condensed));
    }

    document.getElementById('fgExplain').textContent = g.explain;
    document.getElementById('fgNaming').textContent = g.naming;
    var props = document.getElementById('fgProps');
    Lab.clear(props);
    g.properties.forEach(function (t) { props.appendChild(Lab.h('li', null, [t])); });

    var r = g.reaction;
    document.getElementById('fgRxTitle').textContent = r.title || 'Sample reaction';
    document.getElementById('fgRxNote').textContent = r.note || '';
    document.getElementById('fgRxEq').textContent = equationText(r);
    document.getElementById('fgRxCond').textContent = r.conditions ? ('Conditions: ' + r.conditions) : '';
    document.getElementById('fgAdvanced').textContent = g.advanced || '';
    document.getElementById('fgAdvancedWrap').hidden = !g.advanced;
  }

  function selectGroup(id) {
    var g = state.groups.filter(function (x) { return x.id === id; })[0];
    if (!g) { return; }
    state.selected = g;
    state.example = g.examples[0];
    renderCards();
    renderDetail();
    var detail = document.getElementById('fgDetail');
    if (window.matchMedia && window.matchMedia('(max-width: 959px)').matches) {
      detail.scrollIntoView({ behavior: Lab.prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    }
    detail.focus();
  }

  function wire() {
    document.getElementById('fgSearch').addEventListener('input', function (ev) {
      state.query = ev.target.value;
      renderCards();
    });
    document.getElementById('fgHighlight').addEventListener('change', function (ev) {
      state.highlight = !!ev.target.checked;
      renderDetail();
    });
    if (tool) {
      tool.addEventListener('lab:next', function () {
        if (!state.selected) { selectGroup(state.groups[0].id); return; }
        var i = state.groups.indexOf(state.selected);
        selectGroup(state.groups[(i + 1) % state.groups.length].id);
      });
      tool.addEventListener('lab:prev', function () {
        if (!state.selected) { selectGroup(state.groups[state.groups.length - 1].id); return; }
        var i = state.groups.indexOf(state.selected);
        selectGroup(state.groups[(i + state.groups.length - 1) % state.groups.length].id);
      });
      tool.addEventListener('lab:down', function () {
        if (!state.selected) { return; }
        var ex = state.selected.examples;
        var i = ex.indexOf(state.example);
        state.example = ex[(i + 1) % ex.length];
        renderDetail();
      });
      tool.addEventListener('lab:up', function () {
        if (!state.selected) { return; }
        var ex = state.selected.examples;
        var i = ex.indexOf(state.example);
        state.example = ex[(i + ex.length - 1) % ex.length];
        renderDetail();
      });
      tool.addEventListener('lab:toggle', function () {
        state.highlight = !state.highlight;
        document.getElementById('fgHighlight').checked = state.highlight;
        renderDetail();
      });
    }
  }

  Lab.init().then(function () {
    return Promise.all([Lab.loadJSON('functional-groups.json'), Lab.loadJSON('molecules.json')]);
  }).then(function (pack) {
    state.groups = pack[0].groups;
    state.mols = pack[1].molecules || pack[1];
    if (loading) { loading.hidden = true; }
    if (app) { app.hidden = false; }
    Lab.progress.visit('functional-groups');
    wire();
    renderCards();
    selectGroup(state.groups[0].id);
  }).catch(function (err) {
    if (loading) { loading.hidden = true; }
    Lab.showError(tool || document.getElementById('main'), err);
  });
})();
