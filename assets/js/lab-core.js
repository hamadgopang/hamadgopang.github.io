/* ==========================================================================
   lab-core.js  -  shared engine for the Organic Chemistry Lab

   Works in the browser (window.Lab) and in Node (module.exports) so the same
   code that draws structures can be checked by assets/scripts/validate-organic.cjs.

   What lives here
   - molecule layout: chain specs and small graph specs  ->  atoms, bonds, positions
   - formula, condensed formula and relative molecular mass maths
   - hydrocarbon generator (alkanes, alkenes, alkynes, straight chain)
   - Morph: one SVG drawing engine used for static structures AND animations
   - compose / remap helpers used by the reaction studio
   - small helpers: DOM builder, formula and equation elements, JSON loading,
     localStorage progress (always wrapped in try/catch)
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Lab = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DX = 60;   /* horizontal bond length in the displayed formula (SVG units) */
  var DY = 52;   /* vertical bond length */
  var NS = 'http://www.w3.org/2000/svg';
  var ATOMS = {};

  var SLOT = {
    left: [-DX, 0],
    right: [DX, 0],
    up: [0, -DY],
    down: [0, DY],
    ul: [-0.62 * DX, -0.85 * DY],
    dl: [-0.62 * DX, 0.85 * DY],
    ur: [0.62 * DX, -0.85 * DY],
    dr: [0.62 * DX, 0.85 * DY]
  };

  /* ------------------------------------------------------------------------
     Atom data
     ------------------------------------------------------------------------ */
  function setAtoms(json) {
    ATOMS = (json && json.atoms) || json || {};
  }

  function atomInfo(el) {
    var a = ATOMS[el];
    if (!a) { throw new Error('Unknown element: ' + el); }
    return a;
  }

  function valenceOf(el) { return atomInfo(el).valence; }

  /* ------------------------------------------------------------------------
     Layout
     ------------------------------------------------------------------------ */
  function pickSlots(type, r, occ) {
    var out = [];
    var seq;
    if (r <= 0) { return out; }
    if (r === 2 && (type === 'first' || type === 'last') && !occ.up && !occ.down) {
      return type === 'first' ? ['ul', 'dl'] : ['ur', 'dr'];
    }
    if (type === 'mid') { seq = ['up', 'down']; }
    else if (type === 'first') { seq = ['left', 'up', 'down']; }
    else if (type === 'last') { seq = ['right', 'up', 'down']; }
    else { seq = ['left', 'right', 'up', 'down']; }
    seq.forEach(function (s) {
      var free = true;
      if (s === 'up' && occ.up) { free = false; }
      if (s === 'down' && occ.down) { free = false; }
      if (free && out.length < r) { out.push(s); }
    });
    return out;
  }

  function layoutChain(spec) {
    var chain = spec.chain;
    var n = chain.length;
    var bonds = spec.bonds || [];
    var subs = spec.subs || [];
    var atoms = [];
    var bs = [];
    var lines = [];
    var open = {};
    var occ = [];
    var i;

    function ord(k) { return bonds[k] || 1; }

    for (i = 0; i < n; i++) {
      occ.push({});
      atoms.push({ key: 'c' + i, el: chain[i], x: i * DX, y: 0 });
    }
    for (i = 0; i < n - 1; i++) {
      bs.push({ a: 'c' + i, b: 'c' + (i + 1), o: ord(i) });
    }

    var subUsed = [];
    for (i = 0; i < n; i++) { subUsed.push(0); }

    subs.forEach(function (s, j) {
      var at = s.at;
      var dir = s.dir || 'up';
      var order = s.order || 1;
      var sy = dir === 'up' ? -DY : DY;
      var sk = 's' + j;
      var rem = valenceOf(s.el) - order;
      if (rem < 0) { throw new Error('Substituent ' + sk + ' exceeds its valence'); }
      occ[at][dir] = true;
      subUsed[at] += order;
      atoms.push({ key: sk, el: s.el, x: at * DX, y: sy });
      bs.push({ a: 'c' + at, b: sk, o: order });
      if (rem === 1) {
        atoms.push({ key: sk + 'h0', el: 'H', x: at * DX, y: sy * 2 });
        bs.push({ a: sk, b: sk + 'h0', o: 1 });
      } else if (rem === 2) {
        var dy2 = dir === 'up' ? -0.8 * DY : 0.8 * DY;
        atoms.push({ key: sk + 'h0', el: 'H', x: at * DX - 0.7 * DX, y: sy + dy2 });
        atoms.push({ key: sk + 'h1', el: 'H', x: at * DX + 0.7 * DX, y: sy + dy2 });
        bs.push({ a: sk, b: sk + 'h0', o: 1 });
        bs.push({ a: sk, b: sk + 'h1', o: 1 });
      } else if (rem > 2) {
        throw new Error('Substituent ' + sk + ' needs too many hydrogens');
      }
    });

    if (spec.open) {
      open.c0 = 1;
      open['c' + (n - 1)] = (open['c' + (n - 1)] || 0) + 1;
      lines.push({ id: 'open-l', x1: 0, y1: 0, x2: -0.8 * DX, y2: 0, from: 'c0', dash: true });
      lines.push({ id: 'open-r', x1: (n - 1) * DX, y1: 0, x2: (n - 1) * DX + 0.8 * DX, y2: 0, from: 'c' + (n - 1), dash: true });
    }

    for (i = 0; i < n; i++) {
      var used = (i > 0 ? ord(i - 1) : 0) + (i < n - 1 ? ord(i) : 0) + subUsed[i] + (open['c' + i] || 0);
      var r = valenceOf(chain[i]) - used;
      if (r < 0) { throw new Error('Atom c' + i + ' (' + chain[i] + ') has more bonds than its valence'); }
      var type = (n === 1) ? 'single' : (spec.open ? 'mid' : (i === 0 ? 'first' : (i === n - 1 ? 'last' : 'mid')));
      var slots = pickSlots(type, r, occ[i]);
      if (slots.length < r) { throw new Error('No room to place ' + r + ' hydrogens on c' + i); }
      for (var k = 0; k < slots.length; k++) {
        var key = 'c' + i + 'h' + k;
        atoms.push({ key: key, el: 'H', x: i * DX + SLOT[slots[k]][0], y: SLOT[slots[k]][1] });
        bs.push({ a: 'c' + i, b: key, o: 1 });
      }
    }
    return finish({ atoms: atoms, bonds: bs, lines: lines, open: open }, spec);
  }

  function layoutGraph(spec) {
    var g = spec.graph;
    var atoms = g.atoms.map(function (a, i) {
      return { key: 'a' + i, el: a[0], x: a[1] * DX, y: a[2] * DX };
    });
    var bs = g.bonds.map(function (b) {
      return { a: 'a' + b[0], b: 'a' + b[1], o: b[2] || 1 };
    });
    return finish({ atoms: atoms, bonds: bs, lines: [], open: {} }, spec);
  }

  function finish(layout, spec) {
    var hl = {};
    var hlb = {};
    (spec.hl || []).forEach(function (k) { hl[k] = true; });
    (spec.hlb || []).forEach(function (k) { hlb[k] = true; });
    layout.hl = hl;
    layout.hlb = hlb;
    layout.decor = [];
    layout.bbox = bboxOf(layout);
    return layout;
  }

  function bboxOf(layout) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    layout.atoms.forEach(function (a) {
      minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x);
      minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y);
    });
    (layout.lines || []).forEach(function (l) {
      minX = Math.min(minX, l.x1, l.x2); maxX = Math.max(maxX, l.x1, l.x2);
      minY = Math.min(minY, l.y1, l.y2); maxY = Math.max(maxY, l.y1, l.y2);
    });
    if (!isFinite(minX)) { minX = minY = 0; maxX = maxY = 0; }
    var pad = 26;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }

  function layoutSpec(spec) {
    return spec.graph ? layoutGraph(spec) : layoutChain(spec);
  }

  function withHighlight(spec, hl, hlb) {
    var copy = {};
    Object.keys(spec).forEach(function (k) { copy[k] = spec[k]; });
    copy.hl = hl || [];
    copy.hlb = hlb || [];
    return copy;
  }

  function bondIsHl(layout, b) {
    return !!((layout.hl[b.a] && layout.hl[b.b]) || layout.hlb[b.a + '-' + b.b] || layout.hlb[b.b + '-' + b.a]);
  }

  /* ------------------------------------------------------------------------
     Formula maths
     ------------------------------------------------------------------------ */
  function countAtoms(layout) {
    var counts = {};
    layout.atoms.forEach(function (a) { counts[a.el] = (counts[a.el] || 0) + 1; });
    return counts;
  }

  function hillString(counts) {
    var order = [];
    if (counts.C) { order.push('C'); }
    if (counts.H) { order.push('H'); }
    Object.keys(counts).sort().forEach(function (el) {
      if (el !== 'C' && el !== 'H') { order.push(el); }
    });
    return order.map(function (el) {
      return el + (counts[el] > 1 ? counts[el] : '');
    }).join('');
  }

  function massOf(counts) {
    var total = 0;
    Object.keys(counts).forEach(function (el) { total += counts[el] * atomInfo(el).mass; });
    return Math.round(total * 100) / 100;
  }

  function parseFormula(str) {
    var pos = 0;
    function parseGroup() {
      var counts = {};
      while (pos < str.length) {
        var ch = str[pos];
        if (ch === '(') {
          pos++;
          var inner = parseGroup();
          if (str[pos] !== ')') { throw new Error('Missing ) in ' + str); }
          pos++;
          var m = readNumber();
          Object.keys(inner).forEach(function (el) { counts[el] = (counts[el] || 0) + inner[el] * m; });
        } else if (ch === ')') {
          return counts;
        } else if (/[A-Z]/.test(ch)) {
          var sym = ch;
          pos++;
          if (pos < str.length && /[a-z]/.test(str[pos])) { sym += str[pos]; pos++; }
          if (!ATOMS[sym]) { throw new Error('Unknown element ' + sym + ' in ' + str); }
          counts[sym] = (counts[sym] || 0) + readNumber();
        } else {
          throw new Error('Unexpected "' + ch + '" in formula ' + str);
        }
      }
      return counts;
    }
    function readNumber() {
      var s = '';
      while (pos < str.length && /[0-9]/.test(str[pos])) { s += str[pos]; pos++; }
      return s ? parseInt(s, 10) : 1;
    }
    return parseGroup();
  }

  function sameCounts(a, b) {
    var keys = {};
    Object.keys(a).forEach(function (k) { keys[k] = true; });
    Object.keys(b).forEach(function (k) { keys[k] = true; });
    return Object.keys(keys).every(function (k) { return (a[k] || 0) === (b[k] || 0); });
  }

  /* Condensed formula. Textbook condensed formulas can be given in the data
     (spec.condensed); otherwise a plain one is generated from the chain. */
  function condensedOf(spec) {
    if (spec.condensed) {
      return { full: spec.condensed, compact: spec.condensedCompact || spec.condensed };
    }
    if (!spec.chain) { return { full: '', compact: '' }; }
    var layout = layoutChain(spec);
    var n = spec.chain.length;
    var bonds = spec.bonds || [];
    var tokens = [];
    var i;
    for (i = 0; i < n; i++) {
      var h = layout.atoms.filter(function (a) {
        return a.el === 'H' && a.key.indexOf('c' + i + 'h') === 0;
      }).length;
      var t = spec.chain[i] + (h > 0 ? 'H' + (h > 1 ? h : '') : '');
      (spec.subs || []).forEach(function (s, j) {
        if (s.at !== i) { return; }
        var sh = layout.atoms.filter(function (a) { return a.el === 'H' && a.key.indexOf('s' + j + 'h') === 0; }).length;
        var sym = (s.order === 2 ? '=' : (s.order === 3 ? '\u2261' : ''));
        t += '(' + sym + s.el + (sh > 0 ? 'H' + (sh > 1 ? sh : '') : '') + ')';
      });
      tokens.push(t);
    }
    function bondSym(k) { var o = bonds[k] || 1; return o === 2 ? '=' : (o === 3 ? '\u2261' : ''); }
    var full = '';
    for (i = 0; i < n; i++) {
      full += tokens[i];
      if (i < n - 1) { full += bondSym(i); }
    }
    var compact = '';
    i = 0;
    while (i < n) {
      var j = i;
      while (j + 1 < n && tokens[j + 1] === tokens[i] && (bonds[j] || 1) === 1 && tokens[i] === 'CH2') { j++; }
      var run = j - i + 1;
      if (run >= 3) {
        compact += '(CH2)' + run;
        i = j + 1;
        if (i < n) { compact += bondSym(j); }
      } else {
        compact += tokens[i];
        if (i < n - 1) { compact += bondSym(i); }
        i++;
      }
    }
    return { full: full, compact: compact };
  }

  /* Valence audit used by the validator: every atom must be exactly satisfied. */
  function checkValence(layout) {
    var sums = {};
    layout.bonds.forEach(function (b) {
      sums[b.a] = (sums[b.a] || 0) + b.o;
      sums[b.b] = (sums[b.b] || 0) + b.o;
    });
    Object.keys(layout.open || {}).forEach(function (k) { sums[k] = (sums[k] || 0) + layout.open[k]; });
    var problems = [];
    layout.atoms.forEach(function (a) {
      if ((sums[a.key] || 0) !== valenceOf(a.el)) {
        problems.push(a.key + ' (' + a.el + ') has ' + (sums[a.key] || 0) + ' bonds, expected ' + valenceOf(a.el));
      }
    });
    return problems;
  }

  /* ------------------------------------------------------------------------
     Hydrocarbon generator (straight chain, acyclic)
     ------------------------------------------------------------------------ */
  function hydroSpec(family, n, pos) {
    var chain = [];
    var bonds = [];
    var i;
    for (i = 0; i < n; i++) { chain.push('C'); }
    for (i = 0; i < n - 1; i++) { bonds.push(1); }
    if (family.bondOrder > 1) {
      if (n < 2) { throw new Error(family.id + ' needs at least 2 carbons'); }
      var p = Math.max(1, Math.min(pos || 1, Math.floor(n / 2) || 1));
      bonds[p - 1] = family.bondOrder;
    }
    return { chain: chain, bonds: bonds };
  }

  function hydroName(data, family, n, pos) {
    var base = data.prefixes[n - 1];
    if (family.bondOrder === 1 || n <= 3) { return base + family.suffix; }
    var maxPos = Math.floor(n / 2);
    var p = Math.max(1, Math.min(pos || 1, maxPos));
    return base + '-' + p + '-' + family.suffix;
  }

  function hydroState(family, n, pos) {
    var s = family.states[n - 1];
    if (s && typeof s === 'object') { return s[String(pos || 1)] || s['1']; }
    return s;
  }

  function hydroInfo(data, familyId, n, pos) {
    var family = data.families.filter(function (f) { return f.id === familyId; })[0];
    var spec = hydroSpec(family, n, pos);
    var layout = layoutChain(spec);
    var counts = countAtoms(layout);
    return {
      family: family,
      n: n,
      pos: pos || 1,
      name: hydroName(data, family, n, pos),
      spec: spec,
      layout: layout,
      counts: counts,
      formula: hillString(counts),
      condensed: condensedOf(spec),
      mass: massOf(counts),
      state: hydroState(family, n, pos)
    };
  }

  function positionCount(family, n) {
    return family.bondOrder > 1 ? Math.max(1, Math.floor(n / 2)) : 1;
  }

  /* ------------------------------------------------------------------------
     Compose and remap (reaction scenes)
     ------------------------------------------------------------------------ */
  function cloneLayout(l) {
    return {
      atoms: l.atoms.map(function (a) { return { key: a.key, el: a.el, x: a.x, y: a.y }; }),
      bonds: l.bonds.map(function (b) { return { a: b.a, b: b.b, o: b.o }; }),
      lines: (l.lines || []).map(function (x) { return JSON.parse(JSON.stringify(x)); }),
      open: l.open ? JSON.parse(JSON.stringify(l.open)) : {},
      hl: l.hl ? JSON.parse(JSON.stringify(l.hl)) : {},
      hlb: l.hlb ? JSON.parse(JSON.stringify(l.hlb)) : {},
      decor: (l.decor || []).map(function (x) { return JSON.parse(JSON.stringify(x)); }),
      bbox: l.bbox ? { x: l.bbox.x, y: l.bbox.y, w: l.bbox.w, h: l.bbox.h } : null
    };
  }

  function prefixLayout(l, prefix, dx, dy) {
    var out = cloneLayout(l);
    out.atoms.forEach(function (a) { a.key = prefix + a.key; a.x += dx; a.y += dy; });
    out.bonds.forEach(function (b) { b.a = prefix + b.a; b.b = prefix + b.b; });
    out.lines.forEach(function (x) {
      x.id = prefix + x.id; x.from = prefix + x.from;
      x.x1 += dx; x.x2 += dx; x.y1 += dy; x.y2 += dy;
    });
    var open = {};
    Object.keys(out.open).forEach(function (k) { open[prefix + k] = out.open[k]; });
    out.open = open;
    var hl = {};
    Object.keys(out.hl).forEach(function (k) { hl[prefix + k] = true; });
    out.hl = hl;
    var hlb = {};
    Object.keys(out.hlb).forEach(function (k) {
      var parts = k.split('-');
      hlb[prefix + parts[0] + '-' + prefix + parts[1]] = true;
    });
    out.hlb = hlb;
    out.bbox = { x: l.bbox.x + dx, y: l.bbox.y + dy, w: l.bbox.w, h: l.bbox.h };
    return out;
  }

  /* items: array of layouts (already expanded by coefficient).
     opts: { mode: 'row' | 'stack', gap, prefix, sign } */
  function compose(items, opts) {
    opts = opts || {};
    var mode = opts.mode || 'row';
    var gap = opts.gap === undefined ? 56 : opts.gap;
    var prefix = opts.prefix || 'M';
    var sign = opts.sign === undefined ? '+' : opts.sign;
    var total = 0;
    var i;
    for (i = 0; i < items.length; i++) {
      total += (mode === 'row' ? items[i].bbox.w : items[i].bbox.h);
    }
    total += gap * (items.length - 1);
    var cursor = -total / 2;
    var merged = { atoms: [], bonds: [], lines: [], open: {}, hl: {}, hlb: {}, decor: [], bbox: null };
    var bounds = null;
    for (i = 0; i < items.length; i++) {
      var b = items[i].bbox;
      var dx, dy, size;
      if (mode === 'row') {
        dx = cursor - b.x;
        dy = -(b.y + b.h / 2);
        size = b.w;
      } else {
        dx = -(b.x + b.w / 2);
        dy = cursor - b.y;
        size = b.h;
      }
      var p = prefixLayout(items[i], prefix + i + '.', dx, dy);
      merged.atoms = merged.atoms.concat(p.atoms);
      merged.bonds = merged.bonds.concat(p.bonds);
      merged.lines = merged.lines.concat(p.lines);
      Object.keys(p.open).forEach(function (k) { merged.open[k] = p.open[k]; });
      Object.keys(p.hl).forEach(function (k) { merged.hl[k] = true; });
      Object.keys(p.hlb).forEach(function (k) { merged.hlb[k] = true; });
      bounds = unionBox(bounds, p.bbox);
      if (sign && i < items.length - 1) {
        var mid = cursor + size + gap / 2;
        merged.decor.push({
          id: prefix + 'sign' + i,
          text: sign,
          x: mode === 'row' ? mid : 0,
          y: mode === 'row' ? 0 : mid,
          cls: 'mo-sign'
        });
      }
      cursor += size + gap;
    }
    merged.bbox = bounds || { x: 0, y: 0, w: 10, h: 10 };
    return merged;
  }

  function unionBox(a, b) {
    if (!a) { return { x: b.x, y: b.y, w: b.w, h: b.h }; }
    var x1 = Math.min(a.x, b.x), y1 = Math.min(a.y, b.y);
    var x2 = Math.max(a.x + a.w, b.x + b.w), y2 = Math.max(a.y + a.h, b.y + b.h);
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }

  function remap(layout, fn) {
    var out = cloneLayout(layout);
    out.atoms.forEach(function (a) { a.key = fn(a.key); });
    out.bonds.forEach(function (b) { b.a = fn(b.a); b.b = fn(b.b); });
    out.lines.forEach(function (x) { x.from = fn(x.from); });
    var open = {};
    Object.keys(out.open).forEach(function (k) { open[fn(k)] = out.open[k]; });
    out.open = open;
    var hl = {};
    Object.keys(out.hl).forEach(function (k) { hl[fn(k)] = true; });
    out.hl = hl;
    var hlb = {};
    Object.keys(out.hlb).forEach(function (k) {
      var parts = k.split('-');
      hlb[fn(parts[0]) + '-' + fn(parts[1])] = true;
    });
    out.hlb = hlb;
    return out;
  }

  /* Pair every product atom with a reactant atom of the same element so atoms
     can be tracked through a reaction. Heavy atoms: explicit map, then nearest.
     Hydrogens: stay with the partner of the atom they are bonded to when they
     can, otherwise nearest remaining hydrogen. */
  function pairAtoms(reactantScene, productScene, explicit) {
    explicit = explicit || {};
    var mapping = {};
    var usedR = {};
    var rAtoms = {};
    reactantScene.atoms.forEach(function (a) { rAtoms[a.key] = a; });
    var pAtoms = {};
    productScene.atoms.forEach(function (a) { pAtoms[a.key] = a; });

    Object.keys(explicit).forEach(function (pk) {
      var rk = explicit[pk];
      if (!pAtoms[pk] || !rAtoms[rk]) { throw new Error('Bad explicit map ' + pk + ' -> ' + rk); }
      if (pAtoms[pk].el !== rAtoms[rk].el) { throw new Error('Element mismatch in map ' + pk + ' -> ' + rk); }
      if (usedR[rk]) { throw new Error('Reactant atom used twice: ' + rk); }
      mapping[pk] = rk;
      usedR[rk] = true;
    });

    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

    /* heavy atoms */
    var pairs = [];
    productScene.atoms.forEach(function (p) {
      if (p.el === 'H' || mapping[p.key]) { return; }
      reactantScene.atoms.forEach(function (r) {
        if (r.el === p.el && !usedR[r.key]) { pairs.push({ p: p.key, r: r.key, d: dist(p, r) }); }
      });
    });
    pairs.sort(function (a, b) { return a.d - b.d; });
    pairs.forEach(function (pr) {
      if (mapping[pr.p] || usedR[pr.r]) { return; }
      mapping[pr.p] = pr.r;
      usedR[pr.r] = true;
    });

    /* neighbours */
    function neighbours(scene, key) {
      var out = [];
      scene.bonds.forEach(function (b) {
        if (b.a === key) { out.push(b.b); }
        if (b.b === key) { out.push(b.a); }
      });
      return out;
    }

    /* hydrogens */
    productScene.atoms.forEach(function (p) {
      if (p.el !== 'H' || mapping[p.key]) { return; }
      var parent = neighbours(productScene, p.key)[0];
      var rParent = parent ? mapping[parent] : null;
      var best = null;
      var bestD = Infinity;
      if (rParent) {
        neighbours(reactantScene, rParent).forEach(function (rk) {
          var r = rAtoms[rk];
          if (r && r.el === 'H' && !usedR[rk]) {
            var d = dist(p, r);
            if (d < bestD) { bestD = d; best = rk; }
          }
        });
      }
      if (!best) {
        reactantScene.atoms.forEach(function (r) {
          if (r.el === 'H' && !usedR[r.key]) {
            var d = dist(p, r);
            if (d < bestD) { bestD = d; best = r.key; }
          }
        });
      }
      if (best) { mapping[p.key] = best; usedR[best] = true; }
    });
    return mapping;
  }

  /* ------------------------------------------------------------------------
     DOM helpers
     ------------------------------------------------------------------------ */
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) { return; }
        if (k === 'class') { node.className = v; }
        else if (k === 'text') { node.textContent = v; }
        else if (k === 'for') { node.htmlFor = v; }
        else if (k === 'disabled' || k === 'checked' || k === 'hidden' || k === 'selected' || k === 'open') { node[k] = !!v; }
        else { node.setAttribute(k, v === true ? '' : v); }
      });
    }
    appendAll(node, children);
    return node;
  }

  function appendAll(node, children) {
    if (children === undefined || children === null) { return node; }
    if (!Array.isArray(children)) { children = [children]; }
    children.forEach(function (c) {
      if (c === null || c === undefined || c === false) { return; }
      node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
    return node;
  }

  /* Formula text with subscripts: "CH3CH2OH" -> CH<sub>3</sub>CH<sub>2</sub>OH */
  function formulaEl(str) {
    var span = document.createElement('span');
    span.className = 'formula';
    var re = /(\d+)|([^\d]+)/g;
    var m;
    while ((m = re.exec(str)) !== null) {
      if (m[1]) {
        var sub = document.createElement('sub');
        sub.textContent = m[1];
        span.appendChild(sub);
      } else {
        span.appendChild(document.createTextNode(m[2]));
      }
    }
    span.setAttribute('aria-label', str.replace(/(\d+)/g, ' $1 ').replace(/\s+/g, ' ').trim());
    return span;
  }

  /* Equation from a reaction record: species = [{mol, n}], uses molecule .eq */
  function equationEl(reaction, library) {
    var wrap = document.createElement('span');
    wrap.className = 'equation';
    function side(list) {
      list.forEach(function (sp, i) {
        if (i > 0) { wrap.appendChild(document.createTextNode(' + ')); }
        if (sp.n > 1) { wrap.appendChild(document.createTextNode(sp.n + ' ')); }
        wrap.appendChild(formulaEl(library[sp.mol].eq));
      });
    }
    side(reaction.reactants);
    wrap.appendChild(document.createTextNode(reaction.reversible ? ' \u21cc ' : ' \u2192 '));
    side(reaction.products);
    return wrap;
  }

  function equationText(reaction, library) {
    function side(list) {
      return list.map(function (sp) {
        return (sp.n > 1 ? sp.n + ' ' : '') + library[sp.mol].eq;
      }).join(' + ');
    }
    return side(reaction.reactants) + (reaction.reversible ? ' \u21cc ' : ' \u2192 ') + side(reaction.products);
  }

  function formatNumber(n) {
    return String(Math.round(n * 100) / 100);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function prefersReduced() {
    return typeof window !== 'undefined' && window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ------------------------------------------------------------------------
     JSON loading
     ------------------------------------------------------------------------ */
  var cache = {};
  var base = '';

  function setBase(path) { base = path || ''; }

  function loadJSON(name) {
    if (cache[name]) { return cache[name]; }
    cache[name] = fetch(base + name).then(function (res) {
      if (!res.ok) { throw new Error('Could not load ' + name + ' (' + res.status + ')'); }
      return res.json();
    });
    return cache[name];
  }

  function init(root) {
    var el = root || document.querySelector('[data-json]');
    if (el) { setBase(el.getAttribute('data-json')); }
    return loadJSON('organic-atoms.json').then(function (json) {
      setAtoms(json);
      return json;
    });
  }

  function showError(container, err) {
    clear(container);
    container.appendChild(h('p', {
      class: 'lab-note is-error',
      role: 'alert',
      text: window.location.protocol === 'file:'
        ? 'This tool loads its data with fetch(), so it must be opened through a web server (for example Laragon or GitHub Pages), not directly from disk.'
        : 'Sorry, the lesson data could not be loaded. ' + (err && err.message ? err.message : '')
    }));
  }

  /* ------------------------------------------------------------------------
     Progress (localStorage, always safe)
     ------------------------------------------------------------------------ */
  var PKEY = 'hk-lab-progress-v1';
  var memory = null;

  var progress = {
    load: function () {
      if (memory) { return memory; }
      var data = null;
      try {
        var raw = window.localStorage.getItem(PKEY);
        data = raw ? JSON.parse(raw) : null;
      } catch (e) { data = null; }
      memory = (data && typeof data === 'object') ? data : {};
      memory.visited = memory.visited || {};
      memory.quiz = memory.quiz || { history: [], best: {} };
      memory.cards = memory.cards || { known: [] };
      return memory;
    },
    save: function () {
      try { window.localStorage.setItem(PKEY, JSON.stringify(memory)); return true; }
      catch (e) { return false; }
    },
    update: function (fn) {
      var d = progress.load();
      fn(d);
      progress.save();
      return d;
    },
    visit: function (tool) {
      progress.update(function (d) { d.visited[tool] = Date.now(); });
    },
    clear: function () {
      memory = null;
      try { window.localStorage.removeItem(PKEY); } catch (e) { /* ignore */ }
      return progress.load();
    }
  };

  /* ------------------------------------------------------------------------
     Morph: draws a layout, and can animate between two layouts that share
     atom keys. Used for static structures too (show only).
     ------------------------------------------------------------------------ */
  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    if (attrs) { Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); }); }
    return node;
  }

  function gapOf(elSymbol) { return elSymbol === 'H' ? 9 : 13; }

  function bondSegments(ax, ay, bx, by, order, ga, gb) {
    var dx = bx - ax, dy = by - ay;
    var len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len;
    var nx = -uy, ny = ux;
    var x1 = ax + ux * ga, y1 = ay + uy * ga;
    var x2 = bx - ux * gb, y2 = by - uy * gb;
    var segs = [];
    for (var j = 0; j < 3; j++) {
      var off = (j - (order - 1) / 2) * 6;
      segs.push({
        x1: x1 + nx * off, y1: y1 + ny * off,
        x2: x2 + nx * off, y2: y2 + ny * off,
        w: Math.max(0, Math.min(1, order - j))
      });
    }
    return segs;
  }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function Morph(svg, opts) {
    opts = opts || {};
    this.svg = svg;
    this.highlight = !!opts.highlight;
    this.cur = null;
    this.plan = null;
    this.t = 1;
    this.dur = 1;
    this.running = false;
    this.paused = false;
    this.cb = null;
    this.raf = 0;
    this.last = 0;
    this.nodes = { atoms: {}, bonds: {}, texts: {}, lines: {} };
    this.gLines = el('g', { class: 'mo-lines' });
    this.gBonds = el('g', { class: 'mo-bonds' });
    this.gAtoms = el('g', { class: 'mo-atoms' });
    this.gTexts = el('g', { class: 'mo-texts' });
    svg.appendChild(this.gLines);
    svg.appendChild(this.gBonds);
    svg.appendChild(this.gAtoms);
    svg.appendChild(this.gTexts);
  }

  Morph.prototype.setViewBox = function (box) {
    this.svg.setAttribute('viewBox', [box.x, box.y, box.w, box.h].map(function (n) { return Math.round(n * 10) / 10; }).join(' '));
  };

  Morph.prototype.setHighlight = function (on) {
    this.highlight = !!on;
    if (this.cur && !this.running) { this.show(this.cur); }
  };

  function indexAtoms(layout) {
    var map = {};
    layout.atoms.forEach(function (a) { map[a.key] = a; });
    return map;
  }

  Morph.prototype.buildPlan = function (A, B) {
    var self = this;
    var aMap = A ? indexAtoms(A) : {};
    var bMap = indexAtoms(B);
    var keys = {};
    Object.keys(aMap).forEach(function (k) { keys[k] = true; });
    Object.keys(bMap).forEach(function (k) { keys[k] = true; });
    var plan = { atoms: [], bonds: [], texts: [], lines: [] };

    Object.keys(keys).forEach(function (k) {
      var a = aMap[k], b = bMap[k];
      plan.atoms.push({
        key: k,
        el: (b || a).el,
        a: a ? { x: a.x, y: a.y, hl: self.highlight && !!(A.hl && A.hl[k]) } : null,
        b: b ? { x: b.x, y: b.y, hl: self.highlight && !!(B.hl && B.hl[k]) } : null
      });
    });

    var bonds = {};
    function bondId(x, y) { return x < y ? x + '|' + y : y + '|' + x; }
    if (A) {
      A.bonds.forEach(function (bd) {
        var id = bondId(bd.a, bd.b);
        bonds[id] = bonds[id] || { id: id, p: bd.a, q: bd.b, oa: 0, ob: 0, ha: false, hb: false };
        bonds[id].oa = bd.o;
        bonds[id].ha = self.highlight && bondIsHl(A, bd);
      });
    }
    B.bonds.forEach(function (bd) {
      var id = bondId(bd.a, bd.b);
      bonds[id] = bonds[id] || { id: id, p: bd.a, q: bd.b, oa: 0, ob: 0, ha: false, hb: false };
      bonds[id].ob = bd.o;
      bonds[id].hb = self.highlight && bondIsHl(B, bd);
    });
    Object.keys(bonds).forEach(function (id) { plan.bonds.push(bonds[id]); });

    var texts = {};
    ((A && A.decor) || []).forEach(function (d) { texts[d.id] = texts[d.id] || { id: d.id }; texts[d.id].a = d; });
    (B.decor || []).forEach(function (d) { texts[d.id] = texts[d.id] || { id: d.id }; texts[d.id].b = d; });
    Object.keys(texts).forEach(function (id) { plan.texts.push(texts[id]); });

    var lines = {};
    ((A && A.lines) || []).forEach(function (d) { lines[d.id] = lines[d.id] || { id: d.id }; lines[d.id].a = d; });
    (B.lines || []).forEach(function (d) { lines[d.id] = lines[d.id] || { id: d.id }; lines[d.id].b = d; });
    Object.keys(lines).forEach(function (id) { plan.lines.push(lines[id]); });
    return plan;
  };

  Morph.prototype.atomNode = function (entry) {
    var n = this.nodes.atoms[entry.key];
    if (n) { return n; }
    var g = el('g', { class: 'mo-atom' });
    var halo = el('circle', { r: entry.el === 'H' ? 13 : 17, class: 'at-halo', opacity: 0 });
    var text = el('text', { class: 'at at-' + entry.el + (entry.el === 'H' ? ' at-small' : ''), 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    text.textContent = entry.el;
    g.appendChild(halo);
    g.appendChild(text);
    this.gAtoms.appendChild(g);
    n = { g: g, halo: halo, text: text };
    this.nodes.atoms[entry.key] = n;
    return n;
  };

  Morph.prototype.bondNode = function (id) {
    var n = this.nodes.bonds[id];
    if (n) { return n; }
    var g = el('g', { class: 'mo-bond' });
    var ls = [];
    for (var i = 0; i < 3; i++) {
      var l = el('line', { class: 'bond' });
      g.appendChild(l);
      ls.push(l);
    }
    this.gBonds.appendChild(g);
    n = { g: g, lines: ls };
    this.nodes.bonds[id] = n;
    return n;
  };

  Morph.prototype.textNode = function (id, d) {
    var n = this.nodes.texts[id];
    if (n) { return n; }
    var t = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    this.gTexts.appendChild(t);
    n = { t: t };
    this.nodes.texts[id] = n;
    return n;
  };

  Morph.prototype.lineNode = function (id) {
    var n = this.nodes.lines[id];
    if (n) { return n; }
    var l = el('line', { class: 'bond bond-open' });
    this.gLines.appendChild(l);
    n = { l: l };
    this.nodes.lines[id] = n;
    return n;
  };

  Morph.prototype.draw = function (t) {
    var e = ease(t);
    var plan = this.plan;
    var pos = {};
    var alpha = {};
    var self = this;
    var used = { atoms: {}, bonds: {}, texts: {}, lines: {} };

    plan.atoms.forEach(function (en) {
      var node = self.atomNode(en);
      var from = en.a || en.b;
      var to = en.b || en.a;
      var x = lerp(from.x, to.x, e);
      var y = lerp(from.y, to.y, e);
      var al = lerp(en.a ? 1 : 0, en.b ? 1 : 0, e);
      pos[en.key] = { x: x, y: y, el: en.el };
      alpha[en.key] = al;
      used.atoms[en.key] = true;
      node.g.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')');
      node.g.setAttribute('opacity', al.toFixed(3));
      node.g.setAttribute('visibility', al <= 0.001 ? 'hidden' : 'visible');
      var hl = e >= 0.5 ? (en.b ? en.b.hl : false) : (en.a ? en.a.hl : false);
      node.halo.setAttribute('opacity', hl ? 1 : 0);
      var wantCls = 'at at-' + en.el + (en.el === 'H' ? ' at-small' : '') + (hl ? ' is-hl' : '');
      if (node.text.getAttribute('class') !== wantCls) { node.text.setAttribute('class', wantCls); }
    });

    plan.bonds.forEach(function (bd) {
      var node = self.bondNode(bd.id);
      var pa = pos[bd.p], pb = pos[bd.q];
      used.bonds[bd.id] = true;
      if (!pa || !pb) { node.g.setAttribute('visibility', 'hidden'); return; }
      var o = lerp(bd.oa, bd.ob, e);
      var vis = Math.min(alpha[bd.p], alpha[bd.q]);
      var segs = bondSegments(pa.x, pa.y, pb.x, pb.y, Math.max(o, 0.0001), gapOf(pa.el), gapOf(pb.el));
      var hl = e >= 0.5 ? bd.hb : bd.ha;
      node.g.setAttribute('visibility', o <= 0.001 || vis <= 0.001 ? 'hidden' : 'visible');
      node.g.setAttribute('class', 'mo-bond' + (hl ? ' is-hl' : ''));
      for (var j = 0; j < 3; j++) {
        var s = segs[j];
        var l = node.lines[j];
        l.setAttribute('x1', s.x1.toFixed(2)); l.setAttribute('y1', s.y1.toFixed(2));
        l.setAttribute('x2', s.x2.toFixed(2)); l.setAttribute('y2', s.y2.toFixed(2));
        l.setAttribute('opacity', (s.w * vis).toFixed(3));
      }
    });

    plan.texts.forEach(function (tx) {
      var node = self.textNode(tx.id);
      var from = tx.a || tx.b;
      var to = tx.b || tx.a;
      used.texts[tx.id] = true;
      var x = lerp(from.x, to.x, e);
      var y = lerp(from.y, to.y, e);
      var op;
      if (tx.a && tx.b && tx.a.text === tx.b.text) { op = 1; }
      else if (tx.a && tx.b) { op = e < 0.5 ? 1 - e * 2 : (e - 0.5) * 2; }
      else { op = lerp(tx.a ? 1 : 0, tx.b ? 1 : 0, e); }
      var src = (tx.a && tx.b) ? (e < 0.5 ? tx.a : tx.b) : (tx.b || tx.a);
      if (node.t.textContent !== src.text) { node.t.textContent = src.text; }
      var cls = src.cls || 'mo-label';
      if (node.t.getAttribute('class') !== cls) { node.t.setAttribute('class', cls); }
      node.t.setAttribute('x', x.toFixed(2));
      node.t.setAttribute('y', y.toFixed(2));
      node.t.setAttribute('opacity', op.toFixed(3));
    });

    plan.lines.forEach(function (ln) {
      var node = self.lineNode(ln.id);
      var from = ln.a || ln.b;
      var to = ln.b || ln.a;
      used.lines[ln.id] = true;
      var op = lerp(ln.a ? 1 : 0, ln.b ? 1 : 0, e);
      var x1 = lerp(from.x1, to.x1, e), y1 = lerp(from.y1, to.y1, e);
      var x2 = lerp(from.x2, to.x2, e), y2 = lerp(from.y2, to.y2, e);
      /* start the dashed line just outside the atom label */
      var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      var sx = x1 + dx / len * 14, sy = y1 + dy / len * 14;
      node.l.setAttribute('x1', sx.toFixed(2)); node.l.setAttribute('y1', sy.toFixed(2));
      node.l.setAttribute('x2', x2.toFixed(2)); node.l.setAttribute('y2', y2.toFixed(2));
      node.l.setAttribute('opacity', op.toFixed(3));
    });

    /* hide nodes that are no longer part of the plan */
    ['atoms', 'bonds', 'texts', 'lines'].forEach(function (kind) {
      Object.keys(self.nodes[kind]).forEach(function (k) {
        if (used[kind][k]) { return; }
        var n = self.nodes[kind][k];
        (n.g || n.t || n.l).setAttribute('visibility', 'hidden');
      });
    });
  };

  Morph.prototype.show = function (layout) {
    this.cancel();
    this.cur = layout;
    this.plan = this.buildPlan(layout, layout);
    this.t = 1;
    this.draw(1);
  };

  Morph.prototype.cancel = function () {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
    this.running = false;
    this.paused = false;
  };

  Morph.prototype.finish = function () {
    if (!this.running) { return; }
    this.cancel();
    this.t = 1;
    this.draw(1);
    this.cur = this.target;
    var cb = this.cb;
    this.cb = null;
    if (cb) { cb(); }
  };

  Morph.prototype.to = function (layout, opts) {
    opts = opts || {};
    var self = this;
    if (this.running) { this.finish(); }
    var dur = opts.duration === undefined ? 1200 : opts.duration;
    if (!this.cur || prefersReduced() || dur <= 0) {
      this.show(layout);
      if (opts.onDone) { setTimeout(opts.onDone, 0); }
      return;
    }
    this.target = layout;
    this.plan = this.buildPlan(this.cur, layout);
    this.cb = opts.onDone || null;
    this.dur = dur;
    this.t = 0;
    this.running = true;
    this.paused = false;
    this.last = 0;
    this.draw(0);
    var tick = function (ts) {
      if (!self.running || self.paused) { return; }
      if (!self.last) { self.last = ts; }
      self.t += (ts - self.last) / self.dur;
      self.last = ts;
      if (self.t >= 1) { self.finish(); return; }
      self.draw(self.t);
      self.raf = requestAnimationFrame(tick);
    };
    this.tick = tick;
    this.raf = requestAnimationFrame(tick);
  };

  Morph.prototype.pause = function () {
    if (!this.running || this.paused) { return; }
    this.paused = true;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
  };

  Morph.prototype.resume = function () {
    if (!this.running || !this.paused) { return; }
    this.paused = false;
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  };

  Morph.prototype.isRunning = function () { return this.running && !this.paused; };
  Morph.prototype.isMoving = function () { return this.running; };

  /* Static structure: returns an <svg> element showing the layout. */
  function renderSVG(layout, opts) {
    opts = opts || {};
    var svg = el('svg', {
      class: 'mol-svg' + (opts.cls ? ' ' + opts.cls : ''),
      role: 'img',
      focusable: 'false',
      preserveAspectRatio: 'xMidYMid meet'
    });
    if (opts.label) { svg.setAttribute('aria-label', opts.label); }
    var m = new Morph(svg, { highlight: opts.highlight });
    var box = opts.box || layout.bbox;
    m.setViewBox(box);
    if (!opts.fluid) { svg.setAttribute('width', Math.round(box.w * (opts.scale || 1))); }
    m.show(layout);
    svg.__morph = m;
    return svg;
  }

  function animatedSVG(box, opts) {
    opts = opts || {};
    var svg = el('svg', {
      class: 'mol-svg mol-svg--stage' + (opts.cls ? ' ' + opts.cls : ''),
      role: 'img',
      focusable: 'false',
      preserveAspectRatio: 'xMidYMid meet'
    });
    if (opts.label) { svg.setAttribute('aria-label', opts.label); }
    var m = new Morph(svg, { highlight: opts.highlight });
    m.setViewBox(box);
    svg.__morph = m;
    return { svg: svg, morph: m };
  }

  return {
    DX: DX,
    DY: DY,
    setAtoms: setAtoms,
    atomInfo: atomInfo,
    valenceOf: valenceOf,
    layoutSpec: layoutSpec,
    withHighlight: withHighlight,
    countAtoms: countAtoms,
    hillString: hillString,
    massOf: massOf,
    parseFormula: parseFormula,
    sameCounts: sameCounts,
    condensedOf: condensedOf,
    checkValence: checkValence,
    bondIsHl: bondIsHl,
    hydroSpec: hydroSpec,
    hydroName: hydroName,
    hydroInfo: hydroInfo,
    positionCount: positionCount,
    compose: compose,
    remap: remap,
    pairAtoms: pairAtoms,
    unionBox: unionBox,
    h: h,
    clear: clear,
    appendAll: appendAll,
    formulaEl: formulaEl,
    equationEl: equationEl,
    equationText: equationText,
    formatNumber: formatNumber,
    shuffle: shuffle,
    prefersReduced: prefersReduced,
    loadJSON: loadJSON,
    setBase: setBase,
    init: init,
    showError: showError,
    progress: progress,
    Morph: Morph,
    renderSVG: renderSVG,
    animatedSVG: animatedSVG
  };
});
