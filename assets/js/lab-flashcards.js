/* ==========================================================================
   lab-flashcards.js  -  Flashcards
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
    topic: 'all',
    hideKnown: false,
    deck: [],
    index: 0,
    flipped: false
  };

  function knownSet() {
    return Lab.progress.load().cards.known || [];
  }

  function isKnown(id) {
    return knownSet().indexOf(id) !== -1;
  }

  function rebuild() {
    state.deck = state.data.cards.filter(function (c) {
      if (state.topic !== 'all' && c.topic !== state.topic) { return false; }
      if (state.hideKnown && isKnown(c.id)) { return false; }
      return true;
    });
    if (state.index >= state.deck.length) { state.index = Math.max(0, state.deck.length - 1); }
    state.flipped = false;
    render();
  }

  function renderTopics() {
    var box = document.getElementById('fcTopic');
    Lab.clear(box);
    [{ id: 'all', name: 'All topics' }].concat(state.data.topics).forEach(function (t) {
      var btn = Lab.h('button', {
        type: 'button',
        'aria-pressed': state.topic === t.id,
        text: t.name
      });
      btn.addEventListener('click', function () {
        state.topic = t.id;
        state.index = 0;
        renderTopics();
        rebuild();
      });
      box.appendChild(btn);
    });
  }

  function render() {
    var known = knownSet().length;
    document.getElementById('fcMeta').textContent =
      state.deck.length + ' card' + (state.deck.length === 1 ? '' : 's') + ' in view · ' + known + ' marked known';
    var card = state.deck[state.index];
    var text = document.getElementById('fcText');
    var face = document.getElementById('fcFace');
    var btn = document.getElementById('fcCard');
    if (!card) {
      face.textContent = 'Done';
      text.textContent = 'No cards match these filters. Clear known marks or choose another topic.';
      document.getElementById('fcPos').textContent = 'No cards';
      document.getElementById('fcKnown').disabled = true;
      return;
    }
    face.textContent = state.flipped ? 'Answer' : 'Question';
    text.textContent = state.flipped ? card.a : card.q;
    btn.classList.toggle('is-flipped', state.flipped);
    document.getElementById('fcPos').textContent = 'Card ' + (state.index + 1) + ' of ' + state.deck.length;
    document.getElementById('fcKnown').disabled = false;
    document.getElementById('fcKnown').textContent = isKnown(card.id) ? 'Known ✓' : 'Mark known';
    document.getElementById('fcPrev').disabled = state.index <= 0;
    document.getElementById('fcNext').disabled = state.index >= state.deck.length - 1;
  }

  function flip() {
    if (!state.deck.length) { return; }
    state.flipped = !state.flipped;
    render();
  }

  function wire() {
    document.getElementById('fcHideKnown').addEventListener('change', function (ev) {
      state.hideKnown = !!ev.target.checked;
      state.index = 0;
      rebuild();
    });
    document.getElementById('fcShuffle').addEventListener('click', function () {
      state.deck = Lab.shuffle(state.deck);
      state.index = 0;
      state.flipped = false;
      render();
    });
    document.getElementById('fcResetKnown').addEventListener('click', function () {
      Lab.progress.update(function (d) { d.cards.known = []; });
      rebuild();
    });
    document.getElementById('fcCard').addEventListener('click', flip);
    document.getElementById('fcPrev').addEventListener('click', function () {
      state.index = Math.max(0, state.index - 1);
      state.flipped = false;
      render();
    });
    document.getElementById('fcNext').addEventListener('click', function () {
      state.index = Math.min(state.deck.length - 1, state.index + 1);
      state.flipped = false;
      render();
    });
    document.getElementById('fcKnown').addEventListener('click', function () {
      var card = state.deck[state.index];
      if (!card) { return; }
      Lab.progress.update(function (d) {
        if (d.cards.known.indexOf(card.id) === -1) { d.cards.known.push(card.id); }
      });
      if (state.hideKnown) { rebuild(); }
      else { render(); }
    });
    if (tool) {
      tool.addEventListener('lab:next', function () { document.getElementById('fcNext').click(); });
      tool.addEventListener('lab:prev', function () { document.getElementById('fcPrev').click(); });
      tool.addEventListener('lab:toggle', flip);
      tool.addEventListener('lab:down', function () {
        var topics = ['all'].concat(state.data.topics.map(function (t) { return t.id; }));
        var i = topics.indexOf(state.topic);
        state.topic = topics[(i + 1) % topics.length];
        state.index = 0;
        renderTopics();
        rebuild();
      });
      tool.addEventListener('lab:up', function () {
        var topics = ['all'].concat(state.data.topics.map(function (t) { return t.id; }));
        var i = topics.indexOf(state.topic);
        state.topic = topics[(i + topics.length - 1) % topics.length];
        state.index = 0;
        renderTopics();
        rebuild();
      });
    }
  }

  Lab.init().then(function () {
    return Lab.loadJSON('flashcards.json');
  }).then(function (data) {
    state.data = data;
    if (loading) { loading.hidden = true; }
    if (app) { app.hidden = false; }
    Lab.progress.visit('flashcards');
    wire();
    renderTopics();
    rebuild();
  }).catch(function (err) {
    if (loading) { loading.hidden = true; }
    Lab.showError(tool || document.getElementById('main'), err);
  });
})();
