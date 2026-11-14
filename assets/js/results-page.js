/* Results page: year/class filters, search, stats, tables */
(function () {
  'use strict';
  var Core = window.ResultsCore;
  if (!Core) return;

  var state = {
    sets: [],
    year: 'all',
    className: 'all',
    query: '',
    fullOnly: false
  };

  var yearsEl = document.getElementById('rsYears');
  var classEl = document.getElementById('rsClass');
  var searchEl = document.getElementById('rsSearch');
  var fullEl = document.getElementById('rsFullOnly');
  var statsEl = document.getElementById('rsStats');
  var listEl = document.getElementById('rsList');
  var statusEl = document.getElementById('rsStatus');

  function filteredSets() {
    return state.sets.filter(function (s) {
      if (state.year !== 'all' && String(s.year) !== state.year) return false;
      if (state.className !== 'all' && s.class !== state.className) return false;
      return true;
    });
  }

  function filteredStudents(set) {
    var q = state.query.trim().toLowerCase();
    return set.students.filter(function (st) {
      if (state.fullOnly && Number(st.marks) !== set.totalMarks) return false;
      if (q && st.name.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function chipGroup(container, values, current, onPick, allLabel) {
    container.textContent = '';
    var all = document.createElement('button');
    all.type = 'button';
    all.textContent = allLabel;
    all.setAttribute('aria-pressed', current === 'all' ? 'true' : 'false');
    all.addEventListener('click', function () { onPick('all'); });
    container.appendChild(all);
    values.forEach(function (v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = v;
      b.setAttribute('aria-pressed', String(v) === current ? 'true' : 'false');
      b.addEventListener('click', function () { onPick(String(v)); });
      container.appendChild(b);
    });
  }

  function renderFilters() {
    var years = [];
    state.sets.forEach(function (s) {
      if (years.indexOf(s.year) === -1) years.push(s.year);
    });
    years.sort(function (a, b) { return b - a; });
    chipGroup(yearsEl, years, state.year, function (y) {
      state.year = y;
      render();
    }, 'All years');
    chipGroup(classEl, ['9th', '10th'], state.className, function (c) {
      state.className = c;
      render();
    }, 'All classes');
  }

  function renderStats(sets) {
    statsEl.textContent = '';
    var parts = sets.map(function (s) {
      return Core.bandStats(filteredStudents(s), s.totalMarks);
    });
    var m = Core.mergeStats(parts);
    [
      ['Students', String(m.total)],
      ['Full marks', String(m.full)],
      ['1 mark below', String(m.gap1)],
      ['2 marks below', String(m.gap2)],
      ['Passed', String(m.passed)],
      ['Pass rate', m.passPct + '%']
    ].forEach(function (row) {
      var wrap = document.createElement('div');
      wrap.className = 'rs-stat';
      var dt = document.createElement('dt');
      dt.textContent = row[0];
      var dd = document.createElement('dd');
      dd.textContent = row[1];
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      statsEl.appendChild(wrap);
    });
  }

  function setCardOpen(card, open) {
    card.classList.toggle('is-open', open);
    var btn = card.querySelector('.rs-toggle');
    var wrap = card.querySelector('.rs-table-wrap');
    if (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Hide' : 'Show';
    }
    if (wrap) wrap.hidden = !open;
  }

  function renderTables(sets) {
    listEl.textContent = '';
    if (!sets.length) {
      var empty = document.createElement('p');
      empty.className = 'rs-empty';
      empty.textContent = 'No results match these filters.';
      listEl.appendChild(empty);
      return;
    }

    var byYear = {};
    sets.forEach(function (s) {
      byYear[s.year] = byYear[s.year] || [];
      byYear[s.year].push(s);
    });
    var firstTable = true;
    Object.keys(byYear).map(Number).sort(function (a, b) { return b - a; }).forEach(function (year) {
      var block = document.createElement('section');
      block.className = 'rs-year-block';
      var h2 = document.createElement('h2');
      h2.textContent = String(year);
      block.appendChild(h2);

      byYear[year].sort(function (a, b) { return a.class.localeCompare(b.class); }).forEach(function (set) {
        var students = filteredStudents(set);
        var card = document.createElement('article');
        card.className = 'rs-class-card';

        var head = document.createElement('div');
        head.className = 'rs-class-head';
        var copy = document.createElement('div');
        copy.className = 'rs-class-copy';
        var h3 = document.createElement('h3');
        h3.textContent = 'Chemistry · Class ' + set.class;
        var meta = document.createElement('p');
        meta.className = 'rs-class-meta';
        meta.textContent = students.length + ' student' + (students.length === 1 ? '' : 's') +
          ' · Total marks ' + set.totalMarks +
          ' · Pass mark ' + Core.passMark(set.totalMarks);
        copy.appendChild(h3);
        copy.appendChild(meta);
        head.appendChild(copy);

        if (!students.length) {
          card.appendChild(head);
          var none = document.createElement('p');
          none.className = 'rs-empty';
          none.textContent = 'No students in this set for the current filters.';
          card.appendChild(none);
        } else {
          var open = firstTable;
          firstTable = false;
          var panelId = 'rs-panel-' + set.id;
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'rs-toggle';
          btn.setAttribute('aria-controls', panelId);
          head.appendChild(btn);
          card.appendChild(head);

          var wrap = document.createElement('div');
          wrap.className = 'rs-table-wrap';
          wrap.id = panelId;
          var table = document.createElement('table');
          table.className = 'rs-table';
          table.innerHTML = '<thead><tr><th scope="col">#</th><th scope="col">Student</th><th scope="col">Marks</th><th scope="col">Total</th><th scope="col">Result</th></tr></thead>';
          var tbody = document.createElement('tbody');
          students.slice().sort(function (a, b) {
            return Number(b.marks) - Number(a.marks) || a.name.localeCompare(b.name);
          }).forEach(function (st, i) {
            var tr = document.createElement('tr');
            var pass = Core.isPass(st.marks, set.totalMarks);
            tr.innerHTML =
              '<td>' + (i + 1) + '</td>' +
              '<td>' + st.name + '</td>' +
              '<td>' + st.marks + '</td>' +
              '<td>' + set.totalMarks + '</td>' +
              '<td><span class="rs-badge ' + (pass ? 'is-pass' : 'is-fail') + '">' + (pass ? 'Pass' : 'Fail') + '</span></td>';
            tbody.appendChild(tr);
          });
          table.appendChild(tbody);
          wrap.appendChild(table);
          card.appendChild(wrap);
          setCardOpen(card, open);
          btn.addEventListener('click', function () {
            setCardOpen(card, !card.classList.contains('is-open'));
          });
        }
        block.appendChild(card);
      });
      listEl.appendChild(block);
    });
  }

  function render() {
    renderFilters();
    var sets = filteredSets();
    renderStats(sets);
    renderTables(sets);
    if (statusEl) statusEl.hidden = true;
  }

  searchEl.addEventListener('input', function () {
    state.query = searchEl.value;
    render();
  });
  fullEl.addEventListener('change', function () {
    state.fullOnly = !!fullEl.checked;
    render();
  });

  Core.loadCatalog('../assets/json/results/').then(function (sets) {
    state.sets = sets;
    render();
  }).catch(function (err) {
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = err.message || 'Could not load results.';
      statusEl.className = 'rs-empty';
    }
  });
})();
