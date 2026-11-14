#!/usr/bin/env node
/* Stamp ?v= from assets/asset-version.json onto local CSS/JS links in HTML.
   Usage (from project root):  node assets/scripts/stamp-asset-version.cjs
   Also regenerates Organic Chemistry pages so gen.cjs output stays in sync. */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..', '..');
const verFile = path.join(root, 'assets', 'asset-version.json');
const version = JSON.parse(fs.readFileSync(verFile, 'utf8')).v;
if (!version) {
  console.error('assets/asset-version.json is missing a "v" value');
  process.exit(1);
}

const ASSET_RE = /\b((?:href|src)=["'])([^"']*assets\/(?:css|js)\/[^"'?#]+)(?:\?[^"'#]*)?(["'])/g;
const FOOTER_VER_RE = /(<span\b[^>]*\bdata-asset-version\b[^>]*>)\s*v?[^<]*(<\/span>)/g;

function stampHtml(html) {
  return html
    .replace(ASSET_RE, function (_m, pre, url, post) {
      return pre + url + '?v=' + version + post;
    })
    .replace(FOOTER_VER_RE, '$1v' + version + '$2');
}

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (ent) {
    if (ent.name === 'node_modules' || ent.name === '.git') return;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, out);
      return;
    }
    if (ent.isFile() && ent.name.endsWith('.html')) out.push(full);
  });
}

const files = [];
walk(root, files);

let changed = 0;
files.forEach(function (file) {
  const before = fs.readFileSync(file, 'utf8');
  if (!/assets\/(?:css|js)\//.test(before) && before.indexOf('data-asset-version') === -1) return;
  const after = stampHtml(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
    console.log('stamped', path.relative(root, file));
  }
});

console.log('asset version', version + ';', changed, 'HTML file(s) updated');

const gen = path.join(__dirname, 'lab-pages', 'gen.cjs');
const genRun = spawnSync(process.execPath, [gen], { cwd: root, encoding: 'utf8' });
if (genRun.stdout) process.stdout.write(genRun.stdout);
if (genRun.stderr) process.stderr.write(genRun.stderr);
if (genRun.status !== 0) process.exit(genRun.status || 1);

/* Gen rewrites lab HTML; re-stamp so ?v= and footer version stay in sync. */
const again = [];
walk(root, again);
let restamped = 0;
again.forEach(function (file) {
  const before = fs.readFileSync(file, 'utf8');
  if (!/assets\/(?:css|js)\//.test(before) && before.indexOf('data-asset-version') === -1) return;
  const after = stampHtml(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    restamped += 1;
  }
});
if (restamped) console.log('re-stamped after gen:', restamped);
console.log('Done. Bump assets/asset-version.json → v, then re-run this script.');
