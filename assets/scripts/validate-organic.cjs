#!/usr/bin/env node
/* ==========================================================================
   validate-organic.cjs  -  development-time checks for the Organic Chemistry Lab

   Usage (from the project root):   node assets/scripts/validate-organic.cjs

   It loads the same lab-core.js that the website uses and checks the curated
   data in assets/json/. It never changes any file. Exit code 1 if anything fails.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const jsonDir = path.join(root, 'assets', 'json');
const Lab = require(path.join(root, 'assets', 'js', 'lab-core.js'));

let errors = 0;
let checks = 0;

function fail(msg) { errors++; console.error('  FAIL  ' + msg); }
function ok(cond, msg) { checks++; if (!cond) { fail(msg); } return cond; }

function read(name, optional) {
  const file = path.join(jsonDir, name);
  if (!fs.existsSync(file)) {
    if (optional) { console.log('  skip  ' + name + ' (not created yet)'); return null; }
    fail('Missing ' + name);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { fail(name + ' is not valid JSON: ' + e.message); return null; }
}

function section(title) { console.log('\n' + title); }

/* ---- atoms ------------------------------------------------------------- */
section('Atoms');
const atoms = read('organic-atoms.json');
Lab.setAtoms(atoms);
['H', 'C', 'N', 'O', 'Cl', 'Br'].forEach((s) => ok(atoms.atoms[s], 'atom ' + s + ' missing'));
ok(atoms.atoms.C.valence === 4 && atoms.atoms.H.valence === 1 && atoms.atoms.O.valence === 2 && atoms.atoms.N.valence === 3,
  'valencies of C, H, O, N must be 4, 1, 2, 3');
ok(atoms.atoms.C.mass === 12 && atoms.atoms.H.mass === 1 && atoms.atoms.O.mass === 16, 'school masses C=12 H=1 O=16');

/* ---- molecule library -------------------------------------------------- */
section('Molecule library');
const molFile = read('molecules.json');
const mols = molFile ? molFile.molecules : {};
const molCounts = {};
Object.keys(mols).forEach((id) => {
  const m = mols[id];
  let layout;
  try { layout = Lab.layoutSpec(m); }
  catch (e) { fail(id + ': layout error: ' + e.message); return; }
  const problems = Lab.checkValence(layout);
  ok(problems.length === 0, id + ': valence problems: ' + problems.join('; '));
  const counts = Lab.countAtoms(layout);
  molCounts[id] = counts;
  ok(Lab.hillString(counts) === m.formula, id + ': stored formula ' + m.formula + ' but structure gives ' + Lab.hillString(counts));
  let eq = null;
  try { eq = Lab.parseFormula(m.eq); } catch (e) { fail(id + ': eq "' + m.eq + '" unreadable: ' + e.message); }
  if (eq) { ok(Lab.sameCounts(eq, counts), id + ': eq "' + m.eq + '" does not match the structure'); }
  ok(typeof m.name === 'string' && m.name.length > 0, id + ': needs a name');
  (m.hl || []).forEach((k) => ok(layout.atoms.some((a) => a.key === k), id + ': hl key ' + k + ' not in layout'));
  (m.hlb || []).forEach((k) => {
    const p = k.split('-');
    ok(layout.bonds.some((b) => (b.a === p[0] && b.b === p[1]) || (b.a === p[1] && b.b === p[0])), id + ': hlb ' + k + ' is not a bond');
  });
});
console.log('  ' + Object.keys(mols).length + ' molecules checked');

/* ---- hydrocarbons ------------------------------------------------------ */
section('Hydrocarbon generator');
const hydro = read('hydrocarbons.json');
if (hydro) {
  ok(hydro.prefixes.length === 10, 'ten carbon prefixes expected');
  const expected = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'];
  ok(expected.every((p, i) => hydro.prefixes[i] === p), 'prefixes must be meth, eth, prop, but, pent, hex, hept, oct, non, dec');
  hydro.families.forEach((f) => {
    ok(f.states.length === 10, f.id + ': states needs 10 entries');
    const names = {};
    for (let n = f.minC; n <= 10; n++) {
      const positions = Lab.positionCount(f, n);
      for (let p = 1; p <= positions; p++) {
        const info = Lab.hydroInfo(hydro, f.id, n, p);
        const tag = f.id + ' C' + n + ' pos ' + p + ' (' + info.name + ')';
        ok(Lab.checkValence(info.layout).length === 0, tag + ': valence problem');
        ok((info.counts.C || 0) === n, tag + ': carbon count');
        ok(info.counts.H === f.rule.hMul * n + f.rule.hAdd, tag + ': H=' + info.counts.H + ' breaks ' + f.general);
        ok(!names[info.name], tag + ': duplicate name');
        names[info.name] = true;
        const multiple = info.layout.bonds.filter((b) => b.o === f.bondOrder && info.layout.atoms.find((a) => a.key === b.a).el === 'C' && info.layout.atoms.find((a) => a.key === b.b).el === 'C').length;
        ok(f.bondOrder === 1 ? true : multiple === 1, tag + ': expected exactly one ' + f.bondName);
        ok(info.state, tag + ': missing physical state');
      }
    }
  });
  const m = Lab.hydroInfo(hydro, 'alkane', 3, 1);
  ok(m.formula === 'C3H8' && m.mass === 44, 'propane must be C3H8 with Mr 44');
  ok(Lab.hydroInfo(hydro, 'alkene', 4, 2).name === 'but-2-ene', 'but-2-ene naming');
  ok(Lab.hydroInfo(hydro, 'alkyne', 2, 1).name === 'ethyne', 'ethyne naming');
  const dm = Lab.hydroInfo(hydro, 'alkane', 5, 1).mass - Lab.hydroInfo(hydro, 'alkane', 4, 1).mass;
  ok(dm === 14, 'consecutive alkanes must differ by 14 (CH2)');
  console.log('  3 families checked');
}

/* ---- functional groups ------------------------------------------------- */
section('Functional groups');
const fg = read('functional-groups.json', true);
if (fg) {
  ok(fg.groups.length === 12, 'twelve functional groups expected, found ' + fg.groups.length);
  const ids = {};
  fg.groups.forEach((g) => {
    ok(!ids[g.id], g.id + ': duplicate id');
    ids[g.id] = true;
    ['name', 'symbol', 'general', 'naming', 'explain', 'properties', 'examples', 'reaction'].forEach((k) => ok(g[k], g.id + ': missing ' + k));
    ok(g.examples.length >= 2 && g.examples.length <= 3, g.id + ': needs 2 or 3 examples');
    g.examples.forEach((e) => {
      ok(mols[e], g.id + ': unknown example molecule ' + e);
      if (mols[e]) { ok(mols[e].hl && mols[e].hl.length > 0, g.id + ': ' + e + ' has no highlighted group'); }
    });
    checkEquationRecord(g.id + ' reaction', g.reaction);
  });
}

function checkEquationRecord(tag, r) {
  if (!r || !r.reactants || !r.products) { fail(tag + ': needs reactants and products'); return; }
  const left = {}, right = {};
  function add(list, into) {
    list.forEach((sp) => {
      let counts;
      if (sp.mol) {
        counts = mols[sp.mol] ? molCounts[sp.mol] : null;
        if (!counts) { fail(tag + ': unknown molecule ' + sp.mol); return; }
      } else if (sp.f) {
        try { counts = Lab.parseFormula(sp.f); } catch (e) { fail(tag + ': bad formula ' + sp.f); return; }
      } else { fail(tag + ': species needs mol or f'); return; }
      Object.keys(counts).forEach((el) => { into[el] = (into[el] || 0) + counts[el] * (sp.n || 1); });
    });
  }
  add(r.reactants, left);
  add(r.products, right);
  ok(Lab.sameCounts(left, right), tag + ': equation is not balanced (' + JSON.stringify(left) + ' vs ' + JSON.stringify(right) + ')');
}

/* ---- reactions --------------------------------------------------------- */
section('Reactions');
const rx = read('reactions.json', true);
if (rx) {
  const wanted = ['combustion', 'substitution', 'addition', 'hydrogenation', 'halogenation', 'hydration', 'dehydration', 'polymerization', 'esterification'];
  wanted.forEach((id) => ok(rx.reactions.some((r) => r.id === id), 'reaction ' + id + ' missing'));
  rx.reactions.forEach((r) => {
    checkEquationRecord(r.id, r);
    ok(r.steps && r.steps.length >= 3, r.id + ': needs at least 3 steps');
    ok(r.explanation && r.mechanismNote !== undefined, r.id + ': needs explanation');
    (r.steps || []).forEach((s, i) => ok([0, 1, 2].indexOf(s.scene) >= 0 && s.title && s.text, r.id + ': step ' + (i + 1) + ' invalid'));
    /* build the scenes exactly like the studio does and make sure every atom is paired */
    try {
      const expand = (list) => {
        const out = [];
        list.forEach((sp) => { for (let i = 0; i < (sp.n || 1); i++) { out.push(Lab.layoutSpec(mols[sp.mol])); } });
        return out;
      };
      const R = expand(r.reactants);
      const P = expand(r.products);
      const s0 = Lab.compose(R, { mode: 'row', gap: 70, prefix: 'R' });
      const s1 = Lab.compose(R, { mode: r.contact === 'stack' ? 'stack' : 'row', gap: r.contact === 'stack' ? 26 : 22, prefix: 'R' });
      const s2 = Lab.compose(P, { mode: 'row', gap: 70, prefix: 'P' });
      const map = Lab.pairAtoms(s1, s2, r.map || {});
      const unmatched = s2.atoms.filter((a) => !map[a.key]);
      ok(unmatched.length === 0, r.id + ': ' + unmatched.length + ' product atoms have no reactant partner');
      ok(s0.atoms.length === s2.atoms.length, r.id + ': atom count differs between reactants and products');
      Object.keys(r.map || {}).forEach((k) => ok(typeof r.map[k] === 'string', r.id + ': bad map entry ' + k));
    } catch (e) { fail(r.id + ': scene build failed: ' + e.message); }
  });
  console.log('  ' + rx.reactions.length + ' reactions checked');
}

/* ---- quiz -------------------------------------------------------------- */
section('Quiz');
const quiz = read('quiz.json', true);
if (quiz) {
  const ids = {};
  const topics = quiz.topics.map((t) => t.id);
  const levels = ['beginner', 'intermediate', 'advanced'];
  const typeCount = {};
  const levelCount = {};
  quiz.questions.forEach((q) => {
    ok(!ids[q.id], q.id + ': duplicate id');
    ids[q.id] = true;
    ok(topics.indexOf(q.topic) >= 0, q.id + ': unknown topic ' + q.topic);
    ok(levels.indexOf(q.level) >= 0, q.id + ': unknown level ' + q.level);
    ok(['mcq', 'tf', 'fill', 'match'].indexOf(q.type) >= 0, q.id + ': unknown type ' + q.type);
    ok(q.prompt && q.explanation, q.id + ': needs prompt and explanation');
    typeCount[q.type] = (typeCount[q.type] || 0) + 1;
    levelCount[q.level] = (levelCount[q.level] || 0) + 1;
    if (q.type === 'mcq') {
      ok(Array.isArray(q.options) && q.options.length >= 3 && q.options.length <= 5, q.id + ': needs 3 to 5 options');
      ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, q.id + ': answer index out of range');
      ok(new Set(q.options).size === q.options.length, q.id + ': duplicate options');
    }
    if (q.type === 'tf') { ok(typeof q.answer === 'boolean', q.id + ': true/false needs boolean answer'); }
    if (q.type === 'fill') { ok(Array.isArray(q.answers) && q.answers.length > 0, q.id + ': fill needs answers[]'); }
    if (q.type === 'match') {
      ok(Array.isArray(q.pairs) && q.pairs.length >= 3, q.id + ': match needs pairs');
      (q.pairs || []).forEach((p) => { if (p.mol) { ok(mols[p.mol], q.id + ': unknown molecule ' + p.mol); } });
    }
    if (q.mol) { ok(mols[q.mol] || q.gen, q.id + ': unknown molecule ' + q.mol); }
    if (q.gen) {
      try { Lab.hydroInfo(hydro, q.gen.family, q.gen.n, q.gen.pos); } catch (e) { fail(q.id + ': bad gen: ' + e.message); }
    }
    if (q.equation) { checkEquationRecord(q.id + ' equation', q.equation); }
  });
  levels.forEach((l) => ok((levelCount[l] || 0) >= 10, 'quiz level ' + l + ' needs at least 10 questions'));
  ok(quiz.questions.length >= 60, 'at least 60 quiz questions required, found ' + quiz.questions.length);
  console.log('  ' + quiz.questions.length + ' questions: ' + JSON.stringify(typeCount) + ' ' + JSON.stringify(levelCount));
}

/* ---- flashcards -------------------------------------------------------- */
section('Flashcards');
const cards = read('flashcards.json', true);
if (cards) {
  const ids = {};
  const topics = cards.topics.map((t) => t.id);
  cards.cards.forEach((c) => {
    ok(!ids[c.id], c.id + ': duplicate id');
    ids[c.id] = true;
    ok(topics.indexOf(c.topic) >= 0, c.id + ': unknown topic ' + c.topic);
    ok(c.q && c.a, c.id + ': needs q and a');
  });
  ok(cards.cards.length >= 80, 'at least 80 flashcards required, found ' + cards.cards.length);
  console.log('  ' + cards.cards.length + ' cards');
}

console.log('\n' + checks + ' checks run, ' + errors + ' failed.');
process.exit(errors ? 1 : 0);
