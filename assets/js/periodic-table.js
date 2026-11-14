/**
 * periodic-table.js
 * Periodic Table Explorer (Explore / Lessons / Quiz, English + Urdu).
 *
 * - Element data is loaded from ../assets/json/periodic-table.json
 * - UI strings come from periodic-table-text.js (window.PT_TEXT)
 * - No inline styles are generated: placement and colours use CSS classes and
 *   data attributes defined in periodic-table.css.
 */
(function () {
  'use strict';

  var DATA_URL = '../assets/json/periodic-table.json';
  var T = window.PT_TEXT;
  var app = document.getElementById('app');
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ------------------------------------------------------------------ *
   * Load data, then start
   * ------------------------------------------------------------------ */
  function showStatus(el, textKey, isError) {
    if (!el) return;
    el.hidden = false;
    el.textContent = T.en[textKey];
    el.classList.toggle('is-error', !!isError);
  }

  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var loading = $('#ptLoading');
      if (loading) loading.hidden = true;
      start(data);
    })
    .catch(function (err) {
      var loading = $('#ptLoading');
      if (loading) loading.hidden = true;
      showStatus($('#ptError'), 'loadError', true);
      if (window.console) console.error('Periodic table data failed to load:', err);
    });

  function start(data) {
    /* ---------------------------------------------------------------- *
     * Data model
     * ---------------------------------------------------------------- */
    var E = data.elements.map(function (e) {
      return {
        z: e.z, sym: e.symbol, en: e.name.en, ur: e.name.ur, mass: e.mass,
        cat: e.category, row: e.row, col: e.col, period: e.period, group: e.group,
        block: e.block, state: e.state, shells: e.shells, latin: e.latin, fact: e.fact
      };
    });
    var FAM = data.families;
    var CATS = data.categories;
    var LATIN_Z = E.filter(function (e) { return e.latin; }).map(function (e) { return e.z; });
    var metalKind = function (e) {
      return e.cat === 'metalloid' ? 'metalloid'
        : ['nonmetal', 'halogen', 'noble'].indexOf(e.cat) > -1 ? 'nonmetal' : 'metal';
    };

    /* ---------------------------------------------------------------- *
     * State
     * ---------------------------------------------------------------- */
    var lang = 'en', tab = 'explore', sel = 6, sheetOpen = false, scheme = 'category';
    var focus = null, query = '', lesson = 0;
    var Q = { mode: 'sym2name', pool: 20, total: 10, i: 0, score: 0, streak: 0, cur: null,
              answered: false, picked: null, ok: false, done: false, last: 0 };
    try { var saved = localStorage.getItem('pt-lang'); if (saved === 'ur' || saved === 'en') lang = saved; } catch (e) { /* ignore */ }

    var t = function (k, v) {
      var s = (T[lang][k] !== undefined ? T[lang][k] : (T.en[k] !== undefined ? T.en[k] : k));
      if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
      return s;
    };
    var nm = function (e) { return lang === 'ur' ? e.ur : e.en; };
    var catName = function (c) { return t('cat_' + c); };
    var famText = function (e) { return e.z >= 104 ? FAM[lang].heavy : FAM[lang][e.cat]; };
    var factText = function (e) { return e.fact ? e.fact[lang === 'ur' ? 'ur' : 'en'] : famText(e); };
    var stateName = function (s) { return t(s); };

    var PRED = {
      category: function (e, v) { return e.cat === v; },
      state: function (e, v) { return e.state === v; },
      block: function (e, v) { return e.block === v; },
      group: function (e, v) { return e.group === v; },
      period: function (e, v) { return e.period === v; },
      metal: function (e, v) { return metalKind(e) === v; },
      upto: function (e, v) { return e.z <= v; },
      set: function (e, v) { return v.indexOf(e.z) > -1; }
    };
    var NUMERIC = ['group', 'period', 'upto'];
    var GRID = new Map(E.map(function (e) { return [e.row + ':' + e.col, e]; }));
    var BTN = [];

    /* ---------------------------------------------------------------- *
     * Table
     * ---------------------------------------------------------------- */
    function matchSet() {
      var q = query.trim().toLowerCase();
      if (!q) return null;
      return new Set(E.filter(function (e) {
        return /^\d+$/.test(q) ? e.z === +q
          : (e.en.toLowerCase().indexOf(q) > -1 || e.ur.indexOf(q) > -1 || e.sym.toLowerCase().indexOf(q) === 0);
      }).map(function (e) { return e.z; }));
    }

    function focusSet() {
      if (tab === 'quiz') return null;
      if (tab === 'explore') { var m = matchSet(); if (m) return m; }
      if (!focus) return null;
      var p = PRED[focus.kind];
      return new Set(E.filter(function (e) { return p(e, focus.value); }).map(function (e) { return e.z; }));
    }

    function keyOf(e) {
      if (scheme === 'state') return e.state;
      if (scheme === 'block') return 'b' + e.block;
      return e.cat;
    }

    function buildTable() {
      var g = $('#pt'), h = '', c, p;
      for (c = 1; c <= 18; c++) h += '<button type="button" class="ax gc-' + (c + 1) + ' gr-1" data-axis="group" data-n="' + c + '">' + c + '</button>';
      for (p = 1; p <= 7; p++) h += '<button type="button" class="ax gc-1 gr-' + (p + 1) + '" data-axis="period" data-n="' + p + '">' + p + '</button>';
      h += '<span class="flab gr-10" id="lab1"></span><span class="flab gr-11" id="lab2"></span>';
      g.innerHTML = h;
      E.forEach(function (e) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cell gr-' + (e.row + 1) + ' gc-' + (e.col + 1);
        b.dataset.z = e.z;
        b.innerHTML = '<span class="z">' + e.z + '</span><span class="sym">' + e.sym + '</span><span class="nm"></span>';
        g.appendChild(b);
        BTN[e.z] = b;
      });
    }

    function updateTable() {
      var set = focusSet();
      $('#pt').classList.toggle('nonames', tab === 'quiz');
      E.forEach(function (e) {
        var b = BTN[e.z];
        b.dataset.k = keyOf(e);
        b.classList.toggle('dim', !!set && !set.has(e.z));
        b.classList.toggle('sel', tab !== 'quiz' && e.z === sel);
        var reveal = tab === 'quiz' && Q.mode === 'find' && Q.answered && Q.cur;
        b.classList.toggle('ok', !!reveal && e.z === Q.cur.z);
        b.classList.toggle('bad', !!reveal && !Q.ok && e.z === Q.picked);
        b.querySelector('.nm').textContent = nm(e);
        b.setAttribute('aria-label', nm(e) + ' ' + e.sym + ', ' + e.z);
      });
      $('#lab1').textContent = '57\u201370 \u00B7 ' + catName('lanthanide');
      $('#lab2').textContent = '89\u2013102 \u00B7 ' + catName('actinide');
      document.querySelectorAll('.ax').forEach(function (a) {
        var k = a.dataset.axis;
        a.setAttribute('aria-pressed', !!focus && focus.kind === k && focus.value === +a.dataset.n && tab !== 'quiz');
      });
      var st = $('#status');
      if (set) st.innerHTML = '<span>' + t('showing', { n: set.size }) + '</span><button type="button" data-act="clearfocus">' + t('clear') + '</button>';
      else st.innerHTML = '';
    }

    function legendItems() {
      if (scheme === 'state') return ['solid', 'liquid', 'gas', 'unknown'].map(function (s) { return { k: s, label: stateName(s), kind: 'state', v: s }; });
      if (scheme === 'block') return ['s', 'p', 'd', 'f'].map(function (b) { return { k: 'b' + b, label: t('blk', { b: b }), kind: 'block', v: b }; });
      return CATS.map(function (c) { return { k: c, label: catName(c), kind: 'category', v: c }; });
    }

    function renderLegend() {
      var box = $('#legend');
      if (tab === 'quiz') { box.innerHTML = ''; return; }
      box.innerHTML = legendItems().map(function (i) {
        return '<button type="button" class="chip" data-act="focus" data-kind="' + i.kind + '" data-val="' + i.v +
          '" aria-pressed="' + (!!focus && focus.kind === i.kind && focus.value === i.v) + '"><span class="sw" data-k="' + i.k + '"></span>' + i.label + '</button>';
      }).join('');
    }

    /* ---------------------------------------------------------------- *
     * Detail panel
     * ---------------------------------------------------------------- */
    function bohr(e) {
      var s = '<svg viewBox="0 0 200 200" class="bohr" data-k="' + e.cat + '" role="img" aria-label="' + e.shells.join(', ') +
        '"><circle class="nuc" cx="100" cy="100" r="11"/><text class="nz" x="100" y="103" text-anchor="middle">' + e.z + '</text>';
      e.shells.forEach(function (n, i) {
        var r = 24 + i * 10.5;
        s += '<g class="shell sh-' + i + (i % 2 ? ' rev' : '') + '"><circle class="orb" cx="100" cy="100" r="' + r + '"/>';
        for (var k = 0; k < n; k++) {
          var a = 2 * Math.PI * k / n - Math.PI / 2;
          s += '<circle class="el" cx="' + (100 + r * Math.cos(a)).toFixed(2) + '" cy="' + (100 + r * Math.sin(a)).toFixed(2) + '" r="2.6"/>';
        }
        s += '</g>';
      });
      return s + '</svg>';
    }

    function renderDetail() {
      var e = E[sel - 1];
      var last = e.shells[e.shells.length - 1];
      var main = e.group !== null && (e.group <= 2 || e.group >= 13);
      var alt = lang === 'en'
        ? '<p class="alt" lang="ur" dir="rtl">' + e.ur + '</p>'
        : '<p class="alt" lang="en" dir="ltr">' + e.en + '</p>';
      var rows = [['dZ', e.z], ['dMass', e.mass], ['dGroup', e.group !== null ? e.group : t('none')], ['dPeriod', e.period],
        ['dBlock', e.block], ['dState', stateName(e.state)], ['dShells', e.shells.join(', ')],
        ['dOuter', main ? last : t('varies')], ['dPart', e.z]];
      if (e.latin) rows.push(['dLatin', e.latin]);
      $('#detail').innerHTML = '<button type="button" class="sheet-close" data-act="closesheet" aria-label="' + t('close') + '">\u00D7</button>' +
        '<div class="d-head" data-k="' + e.cat + '"><div class="tile"><span class="z">' + e.z + '</span><span class="sym">' + e.sym +
        '</span><span class="ms">' + e.mass + '</span></div>' +
        '<div><h2 class="display">' + nm(e) + '</h2>' + alt + '<span class="pill">' + catName(e.cat) + '</span></div></div>' +
        '<p class="fact"><b>' + (e.fact ? t('factHead') : t('famHead')) + '</b>' + factText(e) + '</p>' + bohr(e) +
        '<dl>' + rows.map(function (r) { return '<dt>' + t(r[0]) + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
      $('#detail').classList.toggle('open', sheetOpen);
      $('#scrim').hidden = !(sheetOpen && tab !== 'quiz');
    }

    /* ---------------------------------------------------------------- *
     * i18n + render
     * ---------------------------------------------------------------- */
    function applyI18n() {
      app.dataset.lang = lang;
      app.dir = lang === 'ur' ? 'rtl' : 'ltr';
      app.lang = lang; // scoped to the app so the English site header/footer keep lang="en"
      document.querySelectorAll('#app [data-i18n]').forEach(function (n) { n.textContent = t(n.dataset.i18n); });
      document.querySelectorAll('#app [data-i18n-ph]').forEach(function (n) { n.placeholder = t(n.dataset.i18nPh); });
      document.querySelectorAll('.seg [data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang); });
      document.querySelectorAll('.tabs [data-tab]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === tab); });
      $('#schemeSeg').innerHTML = [['category', 'schCategory'], ['state', 'schState'], ['block', 'schBlock']].map(function (p) {
        return '<button type="button" data-scheme="' + p[0] + '" aria-pressed="' + (scheme === p[0]) + '">' + t(p[1]) + '</button>';
      }).join('');
    }

    function render() {
      applyI18n();
      var quizFind = tab === 'quiz' && Q.mode === 'find';
      $('#paneExplore').hidden = tab !== 'explore';
      $('#paneLessons').hidden = tab !== 'lessons';
      $('#paneQuiz').hidden = tab !== 'quiz';
      $('#tableBlock').hidden = tab === 'quiz' && !quizFind;
      $('#tip').hidden = tab === 'quiz';
      $('#detail').hidden = tab === 'quiz';
      $('#workspace').classList.toggle('solo', tab === 'quiz');
      renderLegend();
      if (tab === 'lessons') renderLesson();
      if (tab === 'quiz') renderQuiz();
      updateTable();
      renderDetail();
    }

    /* ---------------------------------------------------------------- *
     * Lessons
     * ---------------------------------------------------------------- */
    var STEPS = [
      { f: { kind: 'upto', value: 10 }, sch: 'category' },
      { f: { kind: 'set', value: [6] }, sch: 'category' },
      { f: { kind: 'period', value: 3 }, sch: 'category' },
      { f: { kind: 'group', value: 1 }, sch: 'category' },
      { f: { kind: 'metal', value: 'metal' }, sch: 'category' },
      { f: { kind: 'category', value: 'alkali' }, sch: 'category' },
      { f: { kind: 'block', value: 's' }, sch: 'block' },
      { f: { kind: 'set', value: LATIN_Z }, sch: 'category' },
      { f: { kind: 'state', value: 'liquid' }, sch: 'state' }
    ];

    function applyStep(i) { lesson = i; focus = STEPS[i].f; scheme = STEPS[i].sch; }

    function ctl(label, kind, val, sw) {
      var on = !!focus && focus.kind === kind && String(focus.value) === String(val);
      return '<button type="button" class="chip" data-act="focus" data-kind="' + kind + '" data-val="' + val + '" aria-pressed="' + on + '">' +
        (sw ? '<span class="sw" data-k="' + sw + '"></span>' : '') + label + '</button>';
    }

    function lessonExtra(i) {
      var r = [];
      if (i === 0) {
        var n = focus && focus.kind === 'upto' ? focus.value : 10;
        return '<input id="slider" type="range" min="1" max="118" value="' + n + '" aria-label="' + t('s0t') +
          '"><p class="mono" id="sliderLbl">' + t('upto', { n: n, name: nm(E[n - 1]) }) + '</p>';
      }
      if (i === 1) {
        var e = E[5];
        return '<div class="anat"><div class="bigcell" data-k="' + e.cat + '"><span class="z">' + e.z + '</span><span class="sym">' + e.sym +
          '</span><span class="nm">' + e.en + '</span><span class="ms">' + e.mass + '</span></div>' +
          '<ul class="callouts"><li><b class="mono">6</b> \u2014 ' + t('aZ') + '</li><li><b class="latin">C</b> \u2014 ' + t('aSym') +
          '</li><li><b>' + nm(e) + '</b> \u2014 ' + t('aName') + '</li><li><b class="mono">12.011</b> \u2014 ' + t('aMass') + '</li></ul></div>';
      }
      if (i === 2) for (var p = 1; p <= 7; p++) r.push(ctl(t('periodN', { n: p }), 'period', p));
      if (i === 3) for (var g = 1; g <= 18; g++) r.push(ctl(g, 'group', g));
      if (i === 4) r.push(ctl(t('kMetal'), 'metal', 'metal'), ctl(t('kMetalloid'), 'metal', 'metalloid'), ctl(t('kNonmetal'), 'metal', 'nonmetal'));
      if (i === 5) CATS.forEach(function (c) { r.push(ctl(catName(c), 'category', c, c)); });
      if (i === 6) ['s', 'p', 'd', 'f'].forEach(function (b) { r.push(ctl(t('blk', { b: b }), 'block', b, 'b' + b)); });
      if (i === 7) LATIN_Z.forEach(function (z) {
        r.push('<button type="button" class="chip" data-act="pick" data-z="' + z + '" aria-pressed="' + (sel === z) + '"><b class="latin">' +
          E[z - 1].sym + '</b> ' + E[z - 1].latin + '</button>');
      });
      if (i === 8) ['solid', 'liquid', 'gas', 'unknown'].forEach(function (s) { r.push(ctl(stateName(s), 'state', s, s)); });
      return '<div class="row">' + r.join('') + '</div>';
    }

    function renderLesson() {
      var last = lesson === STEPS.length - 1;
      $('#paneLessons').innerHTML = '<div class="card lesson"><div class="lhead"><span class="mono">' + t('lessonOf', { i: lesson + 1, n: STEPS.length }) + '</span>' +
        '<div class="dots">' + STEPS.map(function (_, i) {
          return '<button type="button" class="dot' + (i === lesson ? ' on' : '') + '" data-act="goto" data-i="' + i + '" aria-label="' + (i + 1) + '"></button>';
        }).join('') + '</div></div>' +
        '<h2 class="display">' + t('s' + lesson + 't') + '</h2><p class="lbody">' + t('s' + lesson + 'b') + '</p><div class="lextra">' + lessonExtra(lesson) + '</div>' +
        '<div class="lnav"><button type="button" class="pt-btn ghost" data-act="prev"' + (lesson === 0 ? ' disabled' : '') + '>' + t('prev') + '</button>' +
        (last ? '<button type="button" class="pt-btn" data-act="toquiz">' + t('startQuiz') + '</button>'
              : '<button type="button" class="pt-btn" data-act="next">' + t('next') + '</button>') + '</div></div>';
    }

    /* ---------------------------------------------------------------- *
     * Quiz
     * ---------------------------------------------------------------- */
    var rnd = function (n) { return Math.floor(Math.random() * n); };
    var shuffle = function (a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
      return a;
    };

    function newQ() {
      var pool = E.filter(function (e) { return e.z <= Q.pool; });
      var e;
      do { e = pool[rnd(pool.length)]; } while (e.z === Q.last && pool.length > 1);
      Q.last = e.z; Q.answered = false; Q.picked = null; Q.ok = false;
      var opts = null;
      var others = pool.filter(function (x) { return x.z !== e.z; });
      if (Q.mode === 'sym2name') opts = [{ l: nm(e), ok: true }].concat(shuffle(others).slice(0, 3).map(function (x) { return { l: nm(x) }; }));
      if (Q.mode === 'name2sym') opts = [{ l: e.sym, ok: true, latin: true }].concat(shuffle(others).slice(0, 3).map(function (x) { return { l: x.sym, latin: true }; }));
      if (Q.mode === 'z') {
        var near = shuffle(others.filter(function (x) { return Math.abs(x.z - e.z) <= 8; })).concat(shuffle(others));
        var ds = [];
        near.forEach(function (x) { if (ds.length < 3 && ds.indexOf(x.z) < 0) ds.push(x.z); });
        opts = [{ l: e.z, ok: true, mono: true }].concat(ds.map(function (z) { return { l: z, mono: true }; }));
      }
      if (Q.mode === 'cat') opts = [{ l: catName(e.cat), ok: true }].concat(shuffle(CATS.filter(function (c) { return c !== e.cat; })).slice(0, 3).map(function (c) { return { l: catName(c) }; }));
      Q.cur = { z: e.z, opts: opts ? shuffle(opts) : null };
    }

    function resetQuiz() { Q.i = 0; Q.score = 0; Q.streak = 0; Q.done = false; newQ(); }

    function answer(ok, picked) {
      if (Q.answered) return;
      Q.answered = true; Q.ok = ok; Q.picked = picked;
      if (ok) { Q.score++; Q.streak++; } else Q.streak = 0;
      render();
    }

    function correctText() {
      var e = E[Q.cur.z - 1];
      if (Q.mode === 'sym2name' || Q.mode === 'find') return nm(e);
      if (Q.mode === 'name2sym') return e.sym;
      if (Q.mode === 'z') return e.z;
      return catName(e.cat);
    }

    function renderQuiz() {
      var chip = function (act, val, label, on) {
        return '<button type="button" class="chip" data-act="' + act + '" data-val="' + val + '" aria-pressed="' + on + '">' + label + '</button>';
      };
      var cfg = '<div class="qcfg"><div class="row"><span class="lab">' + t('qMode') + '</span>' +
        ['sym2name', 'name2sym', 'z', 'cat', 'find'].map(function (m) { return chip('qmode', m, t('qm_' + m), Q.mode === m); }).join('') + '</div>' +
        '<div class="row"><span class="lab">' + t('qPool') + '</span>' +
        [20, 54, 118].map(function (p) { return chip('qpool', p, t('qp' + p), Q.pool === p); }).join('') + '</div></div>';
      var body;
      if (Q.done) {
        body = '<h2 class="display">' + t('done') + '</h2><p class="lbody">' + t('res', { s: Q.score, n: Q.total }) +
          '</p><div class="lnav"><button type="button" class="pt-btn ghost" data-act="review">' + t('review') +
          '</button><button type="button" class="pt-btn" data-act="again">' + t('again') + '</button></div>';
      } else {
        var e = E[Q.cur.z - 1];
        var sym = '<bdi class="latin">' + e.sym + '</bdi>', n = '<b>' + nm(e) + '</b>';
        var prompt = t('p_' + Q.mode, { s: sym, n: n });
        var opts = '';
        if (Q.cur.opts) {
          opts = '<div class="opts">' + Q.cur.opts.map(function (o, i) {
            var c = 'opt' + (o.latin ? ' latin' : '') + (o.mono ? ' mono' : '');
            if (Q.answered) { if (o.ok) c += ' ok'; else if (i === Q.picked) c += ' bad'; }
            return '<button type="button" class="' + c + '" data-act="opt" data-i="' + i + '"' + (Q.answered ? ' disabled' : '') + '>' + o.l + '</button>';
          }).join('') + '</div>';
        } else if (!Q.answered) {
          opts = '<p class="muted">' + t('findHint') + '</p>';
        }
        var fb = Q.answered
          ? '<div class="fb ' + (Q.ok ? 'good' : 'bad') + '" role="status"><strong>' + (Q.ok ? t('correct') : t('wrong', { a: correctText() })) + '</strong><p>' + factText(e) + '</p></div>' +
            '<button type="button" class="pt-btn" data-act="nextq">' + (Q.i + 1 >= Q.total ? t('seeRes') : t('nextQ')) + '</button>'
          : '';
        body = '<div class="qstats"><span>' + t('qnum', { i: Q.i + 1, n: Q.total }) + '</span><span>' + t('score') + ': ' + Q.score +
          '</span><span>' + t('streak') + ': ' + Q.streak + '</span></div><h2 class="display">' + prompt + '</h2>' + opts + fb;
      }
      $('#paneQuiz').innerHTML = '<div class="card qcard">' + cfg + body + '</div>';
    }

    /* ---------------------------------------------------------------- *
     * Events
     * ---------------------------------------------------------------- */
    function setTab(name) {
      tab = name; focus = null; query = ''; $('#search').value = ''; sheetOpen = false;
      if (name === 'lessons') { applyStep(lesson); scheme = STEPS[lesson].sch; } else scheme = 'category';
      if (name === 'quiz') resetQuiz();
      render();
    }

    function pick(z) {
      sel = z; sheetOpen = true; renderDetail(); updateTable();
      if (tab === 'lessons') renderLesson();
    }

    function clearSearch() { query = ''; $('#search').value = ''; }

    app.addEventListener('click', function (ev) {
      var tgt = ev.target;
      var lb = tgt.closest('.seg [data-lang]');
      if (lb) {
        lang = lb.dataset.lang;
        try { localStorage.setItem('pt-lang', lang); } catch (e) { /* ignore */ }
        render();
        return;
      }
      var tb = tgt.closest('.tabs [data-tab]');
      if (tb) { setTab(tb.dataset.tab); return; }
      var sc = tgt.closest('[data-scheme]');
      if (sc) { scheme = sc.dataset.scheme; focus = null; render(); return; }
      if (tgt.closest('#scrim')) { sheetOpen = false; renderDetail(); return; }
      var cell = tgt.closest('.cell');
      if (cell) {
        var z = +cell.dataset.z;
        if (tab === 'quiz') { if (Q.mode === 'find' && !Q.answered && !Q.done) answer(z === Q.cur.z, z); return; }
        pick(z);
        return;
      }
      var ax = tgt.closest('.ax');
      if (ax) {
        if (tab === 'quiz') return;
        var k = ax.dataset.axis, v = +ax.dataset.n;
        focus = focus && focus.kind === k && focus.value === v ? null : { kind: k, value: v };
        clearSearch(); renderLegend(); updateTable();
        if (tab === 'lessons') renderLesson();
        return;
      }
      var a = tgt.closest('[data-act]');
      if (!a) return;
      var act = a.dataset.act;
      if (act === 'focus') {
        var kk = a.dataset.kind;
        var vv = NUMERIC.indexOf(kk) > -1 ? +a.dataset.val : a.dataset.val;
        focus = focus && focus.kind === kk && focus.value === vv && tab !== 'lessons' ? null : { kind: kk, value: vv };
        clearSearch(); renderLegend(); updateTable();
        if (tab === 'lessons') renderLesson();
      } else if (act === 'clearfocus') { focus = null; clearSearch(); renderLegend(); updateTable(); if (tab === 'lessons') renderLesson(); }
      else if (act === 'closesheet') { sheetOpen = false; renderDetail(); }
      else if (act === 'pick') pick(+a.dataset.z);
      else if (act === 'goto') { applyStep(+a.dataset.i); render(); }
      else if (act === 'prev') { applyStep(Math.max(0, lesson - 1)); render(); }
      else if (act === 'next') { applyStep(Math.min(STEPS.length - 1, lesson + 1)); render(); }
      else if (act === 'toquiz') setTab('quiz');
      else if (act === 'qmode') { Q.mode = a.dataset.val; resetQuiz(); render(); }
      else if (act === 'qpool') { Q.pool = +a.dataset.val; resetQuiz(); render(); }
      else if (act === 'opt') { var i = +a.dataset.i; answer(!!Q.cur.opts[i].ok, i); }
      else if (act === 'nextq') { Q.i++; if (Q.i >= Q.total) { Q.done = true; Q.i = Q.total - 1; } else newQ(); render(); }
      else if (act === 'again') { resetQuiz(); render(); }
      else if (act === 'review') setTab('lessons');
    });

    app.addEventListener('input', function (ev) {
      if (ev.target.id === 'search') { query = ev.target.value; updateTable(); }
      if (ev.target.id === 'slider') {
        var n = +ev.target.value;
        focus = { kind: 'upto', value: n };
        updateTable();
        $('#sliderLbl').textContent = t('upto', { n: n, name: nm(E[n - 1]) });
      }
    });

    $('#search').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { var m = matchSet(); if (m && m.size) pick(Array.from(m)[0]); }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && sheetOpen) { sheetOpen = false; renderDetail(); }
    });

    $('#pt').addEventListener('keydown', function (ev) {
      var c = ev.target.closest('.cell');
      if (!c) return;
      var e = E[c.dataset.z - 1], nx = null, d, col, row;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        d = ev.key === 'ArrowRight' ? 1 : -1;
        for (col = e.col + d; col >= 1 && col <= 18 && !nx; col += d) nx = GRID.get(e.row + ':' + col);
      } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        d = ev.key === 'ArrowDown' ? 1 : -1;
        for (row = e.row + d; row >= 1 && row <= 10 && !nx; row += d) nx = GRID.get(row + ':' + e.col);
      }
      if (nx) { ev.preventDefault(); BTN[nx.z].focus(); }
    });

    $('#ptApp').hidden = false;
    buildTable();
    render();
  }
})();
