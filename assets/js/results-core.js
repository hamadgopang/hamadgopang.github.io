/* Shared helpers for Chemistry student results (homepage + results page). */
(function (root) {
  'use strict';

  var PASS = { 100: 33, 75: 25, 65: 22, 60: 20, 50: 17, 40: 14 };

  function passMark(total) {
    if (PASS[total] !== undefined) return PASS[total];
    return Math.ceil(total * 0.33);
  }

  function isPass(marks, total) {
    return Number(marks) >= passMark(total);
  }

  function bandStats(students, total) {
    var full = 0, gap1 = 0, gap2 = 0, passed = 0;
    students.forEach(function (s) {
      var m = Number(s.marks);
      if (m === total) full += 1;
      else if (m === total - 1) gap1 += 1;
      else if (m === total - 2) gap2 += 1;
      if (isPass(m, total)) passed += 1;
    });
    var n = students.length;
    return {
      total: n,
      full: full,
      gap1: gap1,
      gap2: gap2,
      passed: passed,
      passPct: n ? Math.round((passed / n) * 1000) / 10 : 0,
      passMark: passMark(total),
      totalMarks: total
    };
  }

  function mergeStats(list) {
    var out = { total: 0, full: 0, gap1: 0, gap2: 0, passed: 0, passPct: 0 };
    list.forEach(function (s) {
      out.total += s.total;
      out.full += s.full;
      out.gap1 += s.gap1;
      out.gap2 += s.gap2;
      out.passed += s.passed;
    });
    out.passPct = out.total ? Math.round((out.passed / out.total) * 1000) / 10 : 0;
    return out;
  }

  function toppers(students, total, gap) {
    var min = total - (gap === undefined ? 2 : gap);
    return students
      .filter(function (s) { return Number(s.marks) >= min; })
      .slice()
      .sort(function (a, b) {
        return Number(b.marks) - Number(a.marks) || a.name.localeCompare(b.name);
      });
  }

  function latestSet(sets, className) {
    var best = null;
    sets.forEach(function (s) {
      if (s.class !== className) return;
      if (!best || s.year > best.year) best = s;
    });
    return best;
  }

  function wait(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }

  function fetchJson(url, label, attempts) {
    attempts = attempts || 3;
    var tryOnce = function (left) {
      return fetch(url, { cache: 'no-cache' }).then(function (r) {
        if (r.ok) return r.json();
        var retryable = r.status === 502 || r.status === 503 || r.status === 504;
        if (retryable && left > 1) {
          return wait(350 * (attempts - left + 1)).then(function () {
            return tryOnce(left - 1);
          });
        }
        throw new Error('Could not load ' + (label || url) + ' (' + r.status + ')');
      });
    };
    return tryOnce(attempts);
  }

  function loadCatalog(base) {
    base = base || 'assets/json/results/';
    return fetchJson(base + 'index.json', 'results index').then(function (idx) {
      return Promise.all((idx.sets || []).map(function (id) {
        return fetchJson(base + id + '.json', id);
      }));
    });
  }

  root.ResultsCore = {
    passMark: passMark,
    isPass: isPass,
    bandStats: bandStats,
    mergeStats: mergeStats,
    toppers: toppers,
    latestSet: latestSet,
    loadCatalog: loadCatalog
  };
})(typeof window !== 'undefined' ? window : globalThis);
