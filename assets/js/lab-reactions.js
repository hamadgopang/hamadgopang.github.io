/* ==========================================================================
   lab-reactions.js  -  Reaction Animation Studio
   Builds reactant / contact / product scenes, morphs between them, and
   supports Play, Pause, Replay, Prev/Next, hash deep-links and Teacher Mode.
   ========================================================================== */
(function () {
  'use strict';
  var Lab = window.Lab;
  if (!Lab) { return; }

  var loading = document.getElementById('labLoading');
  var app = document.getElementById('labApp');
  var tool = document.getElementById('labTool');

  var state = {
    list: [],
    mols: null,
    current: null,
    step: 0,
    scenes: [],
    morph: null,
    playing: false,
    timer: 0
  };

  function mol(id) {
    return state.mols[id];
  }

  function expand(list) {
    var out = [];
    list.forEach(function (sp) {
      var n = sp.n || 1;
      var i;
      for (i = 0; i < n; i++) {
        out.push(Lab.layoutSpec(mol(sp.mol)));
      }
    });
    return out;
  }

  function equationText(r) {
    function side(list) {
      return list.map(function (sp) {
        var n = sp.n && sp.n > 1 ? sp.n + ' ' : '';
        return n + mol(sp.mol).eq;
      }).join(' + ');
    }
    return side(r.reactants) + ' → ' + side(r.products);
  }

  function buildScenes(r) {
    var R = expand(r.reactants);
    var P = expand(r.products);
    var s0 = Lab.compose(R, { mode: 'row', gap: 70, prefix: 'R' });
    var s1 = Lab.compose(R, {
      mode: r.contact === 'stack' ? 'stack' : 'row',
      gap: r.contact === 'stack' ? 26 : 22,
      prefix: 'R'
    });
    var s2raw = Lab.compose(P, { mode: 'row', gap: 70, prefix: 'P' });
    var map = Lab.pairAtoms(s1, s2raw, r.map || {});
    /* Remap product atom keys onto the reactant keys so morphing is identity-keyed. */
    var s2 = Lab.remap(s2raw, function (key) { return map[key] || key; });
    return [s0, s1, s2];
  }

  function ensureMorph() {
    if (state.morph) { return; }
    var stage = document.getElementById('rxStage');
    Lab.clear(stage);
    var pack = Lab.animatedSVG({ x: -120, y: -90, w: 240, h: 180 }, {
      fluid: true,
      highlight: true,
      label: 'Reaction animation stage'
    });
    stage.appendChild(pack.svg);
    state.morph = pack.morph;
  }

  function fitView(layout) {
    var b = layout.bbox;
    var pad = 20;
    state.morph.setViewBox({
      x: b.x - pad,
      y: b.y - pad,
      w: b.w + pad * 2,
      h: b.h + pad * 2
    });
  }

  function stopAuto() {
    state.playing = false;
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = 0;
    }
    document.getElementById('rxPlay').textContent = 'Play';
  }

  function showStep(i, animate) {
    if (!state.current) { return; }
    var steps = state.current.steps;
    state.step = Math.max(0, Math.min(steps.length - 1, i));
    var step = steps[state.step];
    var layout = state.scenes[step.scene];
    ensureMorph();
    fitView(layout);
    if (animate && state.morph.cur) {
      state.morph.to(layout, { duration: Lab.prefersReduced() ? 0 : 1000 });
    } else {
      state.morph.show(layout);
    }
    document.getElementById('rxStepNum').textContent = 'Step ' + (state.step + 1) + ' of ' + steps.length;
    document.getElementById('rxStepTitle').textContent = step.title;
    document.getElementById('rxStepText').textContent = step.text;
    document.getElementById('rxPrev').disabled = state.step === 0;
    document.getElementById('rxNext').disabled = state.step === steps.length - 1;
  }

  function scheduleNext() {
    if (!state.playing) { return; }
    if (state.step >= state.current.steps.length - 1) {
      stopAuto();
      return;
    }
    state.timer = setTimeout(function () {
      showStep(state.step + 1, true);
      scheduleNext();
    }, Lab.prefersReduced() ? 700 : 1800);
  }

  function play() {
    if (!state.current) { return; }
    if (state.playing) { return; }
    if (state.step >= state.current.steps.length - 1) {
      showStep(0, false);
    }
    state.playing = true;
    document.getElementById('rxPlay').textContent = 'Playing…';
    scheduleNext();
  }

  function pause() {
    stopAuto();
    if (state.morph && state.morph.isRunning()) { state.morph.pause(); }
  }

  function replay() {
    stopAuto();
    showStep(0, false);
    play();
  }

  function renderList() {
    var box = document.getElementById('rxList');
    Lab.clear(box);
    state.list.forEach(function (r) {
      var selected = state.current && state.current.id === r.id;
      var btn = Lab.h('button', {
        type: 'button',
        class: 'rx-item' + (selected ? ' is-selected' : ''),
        role: 'option',
        'aria-selected': selected,
        'data-id': r.id
      }, [
        Lab.h('span', { class: 'rx-item-type', text: r.type }),
        Lab.h('span', { class: 'rx-item-name', text: r.name })
      ]);
      btn.addEventListener('click', function () { selectReaction(r.id); });
      box.appendChild(Lab.h('li', null, [btn]));
    });
  }

  function selectReaction(id, fromHash) {
    var r = state.list.filter(function (x) { return x.id === id; })[0];
    if (!r) { return; }
    stopAuto();
    state.current = r;
    state.scenes = buildScenes(r);
    document.getElementById('rxType').textContent = r.type;
    document.getElementById('rxName').textContent = r.name;
    document.getElementById('rxEquation').textContent = equationText(r);
    document.getElementById('rxConditions').textContent = r.conditions ? ('Conditions: ' + r.conditions) : '';
    document.getElementById('rxExplain').textContent = r.explanation;
    document.getElementById('rxMechanism').textContent = r.mechanismNote;
    document.getElementById('rxSafety').textContent = r.safety || '';
    renderList();
    showStep(0, false);
    if (!fromHash) {
      try { history.replaceState(null, '', '#' + r.id); } catch (e) { /* ignore */ }
    }
  }

  function wire() {
    document.getElementById('rxPlay').addEventListener('click', play);
    document.getElementById('rxPause').addEventListener('click', pause);
    document.getElementById('rxReplay').addEventListener('click', replay);
    document.getElementById('rxPrev').addEventListener('click', function () {
      stopAuto();
      showStep(state.step - 1, true);
    });
    document.getElementById('rxNext').addEventListener('click', function () {
      stopAuto();
      showStep(state.step + 1, true);
    });
    window.addEventListener('hashchange', function () {
      var id = (location.hash || '').replace(/^#/, '');
      if (id) { selectReaction(id, true); }
    });
    if (tool) {
      tool.addEventListener('lab:next', function () {
        stopAuto();
        showStep(state.step + 1, true);
      });
      tool.addEventListener('lab:prev', function () {
        stopAuto();
        showStep(state.step - 1, true);
      });
      tool.addEventListener('lab:down', function () {
        if (!state.current) { return; }
        var i = state.list.indexOf(state.current);
        selectReaction(state.list[(i + 1) % state.list.length].id);
      });
      tool.addEventListener('lab:up', function () {
        if (!state.current) { return; }
        var i = state.list.indexOf(state.current);
        selectReaction(state.list[(i + state.list.length - 1) % state.list.length].id);
      });
      tool.addEventListener('lab:toggle', function () {
        if (state.playing) { pause(); } else { play(); }
      });
    }
  }

  Lab.init().then(function () {
    return Promise.all([Lab.loadJSON('reactions.json'), Lab.loadJSON('molecules.json')]);
  }).then(function (pack) {
    state.list = pack[0].reactions;
    state.mols = pack[1].molecules || pack[1];
    if (loading) { loading.hidden = true; }
    if (app) { app.hidden = false; }
    Lab.progress.visit('reactions');
    wire();
    renderList();
    var hash = (location.hash || '').replace(/^#/, '');
    selectReaction(hash && state.list.some(function (r) { return r.id === hash; }) ? hash : state.list[0].id, true);
  }).catch(function (err) {
    if (loading) { loading.hidden = true; }
    Lab.showError(tool || document.getElementById('main'), err);
  });
})();
