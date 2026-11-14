/* Homepage Student Achievements: latest 9th/10th, stats, 10-row expand */
(function () {
  'use strict';
  var Core = window.ResultsCore;
  var root = document.getElementById('achievementsApp');
  if (!Core || !root) return;

  var VISIBLE = 10;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function renderPanel(set) {
    var panel = el('article', 'ach-panel');
    panel.appendChild(el('h3', null, 'Class ' + set.class));
    panel.appendChild(el('p', 'ach-year', 'Latest result · ' + set.year + ' · Total ' + set.totalMarks));

    var list = Core.toppers(set.students, set.totalMarks, 2);
    var ul = el('ul', 'ach-list');
    var extra = [];

    list.forEach(function (st, i) {
      var li = el('li');
      if (i >= VISIBLE) {
        li.classList.add('is-collapsed');
        extra.push(li);
      }
      li.appendChild(el('span', 'ach-rank', String(i + 1)));
      li.appendChild(el('span', null, st.name));
      li.appendChild(el('span', 'ach-marks', st.marks + ' / ' + set.totalMarks));
      ul.appendChild(li);
    });

    if (!list.length) {
      panel.appendChild(el('p', 'ach-year', 'No top scores in this set.'));
      return panel;
    }

    panel.appendChild(ul);

    if (extra.length) {
      var btn = el('button', 'btn btn--outline-dark', 'Show more (' + extra.length + ')');
      btn.type = 'button';
      var open = false;
      btn.addEventListener('click', function () {
        open = !open;
        extra.forEach(function (li) {
          li.classList.toggle('is-collapsed', !open);
        });
        btn.textContent = open ? 'Show less' : 'Show more (' + extra.length + ')';
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      btn.setAttribute('aria-expanded', 'false');
      var wrap = el('div', 'ach-expand');
      wrap.appendChild(btn);
      panel.appendChild(wrap);
    }
    return panel;
  }

  Core.loadCatalog('assets/json/results/').then(function (sets) {
    var ninth = Core.latestSet(sets, '9th');
    var tenth = Core.latestSet(sets, '10th');
    var latest = [ninth, tenth].filter(Boolean);
    if (!latest.length) {
      root.appendChild(el('p', null, 'Results will appear here when data is available.'));
      return;
    }

    var stats = Core.mergeStats(latest.map(function (s) {
      return Core.bandStats(s.students, s.totalMarks);
    }));

    var statsGrid = el('div', 'ach-stats');
    [
      [String(stats.total), 'Total Students'],
      [String(stats.passed), 'Students Passed'],
      [stats.passPct + '%', 'Pass Rate'],
      [String(stats.full), 'Full Marks'],
      [String(stats.gap1), '1 Mark Short'],
      [String(stats.gap2), '2 Marks Short']
    ].forEach(function (row) {
      var card = el('div', 'ach-stat');
      card.appendChild(el('span', null, row[0]));
      card.appendChild(el('small', null, row[1]));
      statsGrid.appendChild(card);
    });
    root.appendChild(statsGrid);

    var panels = el('div', 'ach-panels');
    if (ninth) panels.appendChild(renderPanel(ninth));
    if (tenth) panels.appendChild(renderPanel(tenth));
    root.appendChild(panels);

    var actions = el('div', 'ach-actions');
    var link = el('a', 'btn btn--teal', 'View all results');
    link.href = 'results/';
    actions.appendChild(link);
    root.appendChild(actions);
  }).catch(function () {
    root.appendChild(el('p', null, 'Results could not be loaded right now.'));
  });
})();
