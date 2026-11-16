'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..', '..');
const pdf = path.join(root, 'assets', 'books', 'Dictionary-of-Chemistry-by-Hamad-Gopang.pdf');
const rawPath = path.join(__dirname, '_dict-flow.txt');
const outPath = path.join(root, 'assets', 'json', 'dictionary.json');

spawnSync('pdftotext', ['-enc', 'UTF-8', pdf, rawPath], { stdio: 'inherit' });
const raw = fs.readFileSync(rawPath, 'utf8');

const start = raw.indexOf('DICTIONARY OF CHEMISTRY');
if (start < 0) {
  console.error('Could not find dictionary body');
  process.exit(1);
}

const body = raw.slice(start);
const lines = body.split(/\r?\n/);
const entries = [];
const skipExact = new Set([
  'DICTIONARY OF CHEMISTRY',
  'HAMAD KHAN / CHEMISTRY REFERENCE',
  'ESSENTIAL FORMULAS',
  'SOURCES AND FURTHER READING'
]);

function isLetterHeader(line) {
  return /^[A-Z]$/.test(line) || /^[A-Z][\u00AD\-–—][A-Z]$/.test(line);
}

function isNoise(line) {
  if (!line) return true;
  if (skipExact.has(line.toUpperCase())) return true;
  if (isLetterHeader(line)) return true;
  if (/^\d{1,3}$/.test(line)) return true;
  if (/^DICTIONARY OF CHEMISTRY/i.test(line)) return true;
  if (/^HAMAD KHAN/i.test(line)) return true;
  if (/^Appendices/i.test(line)) return true;
  if (/^Essential formulas/i.test(line)) return true;
  if (/^Sources and further/i.test(line)) return true;
  if (/^FORMULA/i.test(line) && line.length < 40) return true;
  return false;
}

function splitTerm(line) {
  // e.g. "Standard temperature and pressure (STP) For gases, IUPAC..."
  const parenFor = line.match(/^(.+?\))\s+(For\b.+)$/);
  if (parenFor) {
    return {
      term: parenFor[1].replace(/\u00AD/g, '').trim(),
      definition: parenFor[2].replace(/\u00AD/g, '').trim()
    };
  }

  const words = line.split(/\s+/);
  if (words.length < 2) return null;

  for (let i = 1; i < words.length; i += 1) {
    const prev = words[i - 1];
    const cur = words[i];
    const prevStartsLower = /^[a-z]/.test(prev) || /[a-z]$/.test(prev) || /\)$/.test(prev);
    const curStartsUpper = /^[A-ZÀ-ÖØ-Þ]/.test(cur);
    const singleWordTerm = i === 1 && /^[A-ZÀ-ÖØ-Þ]/.test(words[0]);

    if (curStartsUpper && (prevStartsLower || singleWordTerm)) {
      const term = words.slice(0, i).join(' ').replace(/\u00AD/g, '').trim();
      const definition = words.slice(i).join(' ').replace(/\u00AD/g, '').trim();
      if (term.length < 2 || definition.length < 8) continue;
      if (term.split(/\s+/).length > 8) continue;
      return { term, definition };
    }
  }
  return null;
}

let started = false;
for (let i = 0; i < lines.length; i += 1) {
  let line = lines[i].replace(/\f/g, '').trim();
  if (!line) continue;
  if (/^DICTIONARY OF CHEMISTRY/i.test(line)) {
    started = true;
    continue;
  }
  if (!started) continue;
  if (/^ESSENTIAL FORMULAS|^SOURCES AND FURTHER/i.test(line)) break;
  if (isNoise(line)) continue;

  // Merge soft-wrapped leftovers that don't look like new terms
  while (i + 1 < lines.length) {
    const next = lines[i + 1].replace(/\f/g, '').trim();
    if (!next || isNoise(next)) break;
    if (/^[A-ZÀ-ÖØ-Þ].*\s+[A-ZÀ-ÖØ-Þ]/.test(next) && splitTerm(next)) break;
    line += ' ' + next;
    i += 1;
  }

  const parsed = splitTerm(line);
  if (!parsed) continue;

  const letter = parsed.term.replace(/^[^A-Za-z]+/, '').charAt(0).toUpperCase();
  if (!/[A-Z]/.test(letter)) continue;

  entries.push({
    term: parsed.term,
    letter: letter,
    definition: parsed.definition.replace(/\s+/g, ' ').trim()
  });
}

// Deduplicate by term (keep first)
const seen = Object.create(null);
const unique = entries.filter(function (e) {
  const key = e.term.toLowerCase();
  if (seen[key]) return false;
  seen[key] = true;
  return true;
});

unique.sort(function (a, b) {
  return a.term.localeCompare(b.term, 'en', { sensitivity: 'base' });
});

const data = {
  meta: {
    title: 'Dictionary of Chemistry',
    author: 'Hamad Khan',
    edition: 'Student Edition / 2026',
    count: unique.length,
    pdf: 'assets/books/Dictionary-of-Chemistry-by-Hamad-Gopang.pdf'
  },
  entries: unique
};

fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log('wrote', path.relative(root, outPath), 'entries:', unique.length);
console.log('sample:', unique.slice(0, 3));
console.log('last:', unique.slice(-3));
