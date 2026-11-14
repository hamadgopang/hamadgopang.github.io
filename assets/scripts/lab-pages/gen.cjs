#!/usr/bin/env node
/* ==========================================================================
   gen.cjs  -  page generator for the Organic Chemistry Lab (development only)

   The lab pages share the portfolio header and footer. Instead of repeating
   them by hand, each page is a small fragment in ./fragments/ :
       first line   <!--META {json}-->
       rest         the HTML that goes inside <main>
   Run from the project root:   node assets/scripts/lab-pages/gen.cjs
   It writes organic-chemistry/index.html and organic-chemistry/<tool>/index.html.
   The website itself is plain static HTML; this script is not needed to host it.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const project = path.join(__dirname, '..', '..', '..');
const fragDir = path.join(__dirname, 'fragments');
const ASSET_V = JSON.parse(
  fs.readFileSync(path.join(project, 'assets', 'asset-version.json'), 'utf8')
).v;
function assetUrl(url) {
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + ASSET_V;
}

const TOOLS = [
  ['hydrocarbons', 'Hydrocarbons'],
  ['homologous-series', 'Homologous Series'],
  ['functional-groups', 'Functional Groups'],
  ['reactions', 'Reactions'],
  ['quiz', 'Quiz'],
  ['flashcards', 'Flashcards']
];

const SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const ICON = {
  mail: SVG_OPEN + '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 7-10 6L2 7"/></svg>',
  phone: SVG_OPEN + '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  pin: SVG_OPEN + '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>'
};

const SITE = 'https://hamadgopang.github.io';
const SITE_NAME = 'Hamad Khan | Chemistry Educator &amp; Science Teacher';
const OG_IMAGE = SITE + '/assets/image/og-image.png';

function shell(meta, main) {
  const depth = meta.dir ? 2 : 1;
  const root = depth === 2 ? '../../' : '../';
  const lab = depth === 2 ? '../' : './';
  const toolBase = depth === 2 ? '../' : '';
  const fullTitle = meta.title + ' | Hamad Khan';
  const pagePath = meta.dir ? '/organic-chemistry/' + meta.dir + '/' : '/organic-chemistry/';
  const pageUrl = SITE + pagePath;
  const keywords = meta.keywords || ('Organic Chemistry, Hamad Khan, Chemistry Educator, Matriculation, ' + meta.title + ', Alipur, Pakistan');
  const scripts = (meta.scripts || []).map((s) => '<script src="' + assetUrl(root + 'assets/js/' + s) + '" defer></script>').join('\n');

  let body = main;
  if (meta.dir) {
    const links = TOOLS.map(([id, label]) =>
      '        <a href="' + toolBase + id + '/"' + (id === meta.dir ? ' aria-current="page"' : '') + '>' + label + '</a>').join('\n');
    body = `
  <section class="lab-banner" aria-labelledby="labTitle">
    <div class="lab-container lab-banner-inner">
      <div>
        <a class="lab-back" href="${lab}">Organic Chemistry Lab</a>
        <h1 id="labTitle">${meta.h1}</h1>
        <p>${meta.sub}</p>
      </div>
      <div class="lab-banner-actions" data-teacher-slot></div>
    </div>
  </section>

  <div class="lab-container lab-body" data-teacher-root data-tool-title="${meta.h1}">
    <nav class="lab-toolnav" aria-label="Organic Chemistry tools">
        <a href="${lab}">Lab home</a>
${links}
    </nav>
    <div class="lab-tool" id="labTool" data-tool-title="${meta.h1}">
      <noscript><p class="lab-note is-error">This tool needs JavaScript. Please enable it and reload the page.</p></noscript>
      <p class="lab-note" id="labLoading" role="status">Loading...</p>
      <div id="labApp" hidden>
${main}
      </div>
    </div>
  </div>`;
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<title>${fullTitle}</title>
<meta name="title" content="${fullTitle}">
<meta name="description" content="${meta.desc}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="Hamad Khan">
<meta name="generator" content="Inixio Technologies">
<meta name="robots" content="index, follow">
<meta name="revisit-after" content="7 days">
<meta name="theme-color" content="#101c32">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${meta.desc}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${fullTitle}">
<meta name="twitter:description" content="${meta.desc}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="canonical" href="${pageUrl}">
<link rel="icon" type="image/png" href="${root}assets/image/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@500;600;700;800&amp;display=swap">
<link rel="stylesheet" href="${assetUrl(root + 'assets/css/style.css')}">
<link rel="stylesheet" href="${assetUrl(root + 'assets/css/responsive.css')}">
<link rel="stylesheet" href="${assetUrl(root + 'assets/css/lab.css')}">
<link rel="stylesheet" href="${assetUrl(root + 'assets/css/teacher.css')}">
<script src="${assetUrl(root + 'assets/js/boot.js')}"></script>
</head>
<body class="page-inner">
<a class="skip-link" href="#main">Skip to content</a>

<!-- Shared site header -->
<header class="site-header is-solid" id="siteHeader">
  <div class="container nav-inner">
    <a class="brand" href="${root}" aria-label="Hamad Khan, home">
      <img class="brand-logo" src="${root}assets/image/logo.png" alt="Hamad Khan" width="936" height="136">
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primaryNav" aria-label="Open menu">
      <span class="nav-toggle-bar"></span>
    </button>
    <nav class="primary-nav" id="primaryNav" aria-label="Primary">
      <ul class="nav-list">
        <li><a class="nav-link" href="${root}">Home</a></li>
        <li><a class="nav-link" href="${root}#about">About</a></li>
        <li><a class="nav-link" href="${root}#expertise">Expertise</a></li>
        <li><a class="nav-link" href="${root}#experience">Experience</a></li>
        <li><a class="nav-link" href="${root}#resources">Resources</a></li>
        <li><a class="nav-link" href="${root}#skills">Skills</a></li>
        <li><a class="nav-link" href="${root}#contact">Contact</a></li>
        <li><a class="nav-link" href="${root}#results">Results</a></li>
        <li><a class="nav-link nav-link--pt" href="${root}periodic-table/"><span class="pt-mark" aria-hidden="true">Pt</span>Periodic Table</a></li>
        <li><a class="nav-link nav-link--pt" href="${meta.dir ? lab : './'}" aria-current="page"><span class="pt-mark" aria-hidden="true">Oc</span>Organic Chemistry</a></li>
      </ul>
    </nav>
  </div>
</header>

<main id="main" class="lab-page" data-json="${root}assets/json/" data-tool="${meta.tool}">${body}
</main>

<!-- Shared site footer -->
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${root}" aria-label="Hamad Khan, home">
        <img class="brand-logo" src="${root}assets/image/logo.png" alt="Hamad Khan" width="936" height="136">
      </a>
      <p class="footer-name">Hamad Khan</p>
      <p class="footer-role">Chemistry Educator</p>
      <p class="footer-tagline">Making Chemistry Understandable, Practical & Inspiring — with clear explanations, classroom-ready tools, and steady support for Matriculation students everywhere.</p>
    </div>
    <nav aria-label="Footer">
      <h2 class="footer-title">Quick links</h2>
      <ul class="footer-links">
        <li><a href="${root}">Home</a></li>
        <li><a href="${root}#experience">Experience</a></li>
        <li><a href="${root}results/">Student Results</a></li>
        <li><a href="${root}periodic-table/">Periodic Table</a></li>
        <li><a href="${meta.dir ? lab : './'}">Organic Chemistry</a></li>
      </ul>
    </nav>
    <div>
      <h2 class="footer-title">Get in touch</h2>
      <ul class="footer-contact">
        <li>
          ${ICON.mail}
          <a href="mailto:hamadgopang786@gmail.com">hamadgopang786@gmail.com</a>
        </li>
        <li>
          ${ICON.phone}
          <a href="tel:+923012177879">+92 301 217 7879</a>
        </li>
        <li>
          ${ICON.phone}
          <a href="tel:+923042216800">+92 304 221 6800</a>
        </li>
        <li>
          ${ICON.pin}
          <span>Khizar Town, Alipur, Muzaffargarh, Punjab, Pakistan</span>
        </li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>&copy; <span data-year>2026</span> Hamad Khan. All rights reserved. <span data-asset-version>v${ASSET_V}</span></p>
    <p>Chemistry Educator &middot; Alipur, Pakistan &middot; Developed by <a href="https://inixiotechnologies.com" target="_blank" rel="noopener noreferrer">Inixio Technologies</a></p>
  </div>
</footer>

<button class="to-top" type="button" aria-label="Back to top">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 15 7-7 7 7"/></svg>
</button>

<script src="${assetUrl(root + 'assets/js/main.js')}" defer></script>
${scripts}
</body>
</html>
`;
}

let count = 0;
fs.readdirSync(fragDir).filter((f) => f.endsWith('.html')).forEach((f) => {
  const raw = fs.readFileSync(path.join(fragDir, f), 'utf8');
  const m = raw.match(/^<!--META (\{[\s\S]*?\})-->\r?\n/);
  if (!m) { throw new Error(f + ': missing META line'); }
  const meta = JSON.parse(m[1]);
  const main = raw.slice(m[0].length).replace(/\s+$/, '');
  const outDir = path.join(project, 'organic-chemistry', meta.dir || '');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), shell(meta, main), 'utf8');
  count++;
  console.log('wrote organic-chemistry/' + (meta.dir ? meta.dir + '/' : '') + 'index.html');
});
console.log(count + ' page(s) generated');
