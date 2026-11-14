/* ==========================================================================
   lab-hub.js  -  Organic Chemistry Lab home page
   - interactive molecular background (canvas, reacts to the pointer)
   - learning progress strip (read from localStorage)
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Molecular background
     ------------------------------------------------------------------ */
  var canvas = document.getElementById('hubCanvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var hero = canvas.parentElement;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nodes = [];
    var width = 0;
    var height = 0;
    var dpr = 1;
    var pointer = { x: -999, y: -999, active: false };
    var raf = 0;
    var visible = true;
    var COLORS = ['94,234,212', '94,234,212', '94,234,212', '242,184,75', '255,255,255', '143,180,255'];
    var LINK = 120;

    var resize = function () {
      var rect = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(14, Math.min(54, Math.round(width * height / 17000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 2.5 + Math.random() * 3.5,
          c: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
      draw();
    };

    var step = function () {
      var i, n;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if (pointer.active) {
          var dx = pointer.x - n.x;
          var dy = pointer.y - n.y;
          var d = Math.hypot(dx, dy);
          if (d < 170 && d > 1) {
            n.vx += (dx / d) * 0.012;
            n.vy += (dy / d) * 0.012;
          }
        }
        n.vx *= 0.995;
        n.vy *= 0.995;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10) { n.x = width + 10; }
        if (n.x > width + 10) { n.x = -10; }
        if (n.y < -10) { n.y = height + 10; }
        if (n.y > height + 10) { n.y = -10; }
      }
    };

    var draw = function () {
      ctx.clearRect(0, 0, width, height);
      var i, j, a, b, d, alpha;
      ctx.lineWidth = 1.2;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            alpha = (1 - d / LINK) * 0.35;
            ctx.strokeStyle = 'rgba(180,215,255,' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (pointer.active) {
          d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (d < 150) {
            alpha = (1 - d / 150) * 0.6;
            ctx.strokeStyle = 'rgba(242,184,75,' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.fillStyle = 'rgba(' + a.c + ',0.75)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    var loop = function () {
      raf = 0;
      if (!visible || document.hidden) { return; }
      step();
      draw();
      raf = requestAnimationFrame(loop);
    };

    var start = function () {
      if (reduced || raf || !visible) { return; }
      raf = requestAnimationFrame(loop);
    };

    hero.addEventListener('pointermove', function (ev) {
      var rect = hero.getBoundingClientRect();
      pointer.x = ev.clientX - rect.left;
      pointer.y = ev.clientY - rect.top;
      pointer.active = true;
    });
    hero.addEventListener('pointerleave', function () { pointer.active = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) { start(); }
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { start(); } });

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    start();
  }

  /* ------------------------------------------------------------------
     Progress strip
     ------------------------------------------------------------------ */
  var strip = document.getElementById('hubProgress');
  if (!strip || !window.Lab) { return; }

  var TOOLS = ['hydrocarbons', 'homologous-series', 'functional-groups', 'reactions', 'quiz', 'flashcards'];

  function barClass(pct) {
    var step = Math.max(0, Math.min(100, Math.round(pct / 10) * 10));
    return 'w-' + step;
  }

  function set(id, text) {
    var node = document.getElementById(id);
    if (node) { node.textContent = text; }
  }

  function paint(totalCards) {
    var data = window.Lab.progress.load();
    var visited = TOOLS.filter(function (t) { return data.visited[t]; });
    set('progTools', visited.length + ' of ' + TOOLS.length);

    var best = 0;
    var hasQuiz = false;
    Object.keys(data.quiz.best || {}).forEach(function (k) {
      hasQuiz = true;
      best = Math.max(best, data.quiz.best[k].pct || 0);
    });
    set('progQuiz', hasQuiz ? best + '%' : 'Not taken yet');

    var known = (data.cards.known || []).length;
    set('progCards', totalCards ? known + ' of ' + totalCards : String(known));

    var bar = document.getElementById('progBar');
    if (bar) {
      bar.className = barClass(visited.length / TOOLS.length * 100);
    }

    TOOLS.forEach(function (t) {
      var badge = document.querySelector('[data-visited="' + t + '"]');
      if (badge) { badge.hidden = !data.visited[t]; }
    });
  }

  paint(0);

  var base = document.querySelector('[data-json]');
  if (base) {
    window.Lab.setBase(base.getAttribute('data-json'));
    window.Lab.loadJSON('flashcards.json').then(function (json) {
      paint(json.cards.length);
    }, function () { /* progress still works without the total */ });
  }

  var reset = document.getElementById('progReset');
  if (reset) {
    reset.addEventListener('click', function () {
      if (window.confirm('Clear your saved progress on this device?')) {
        window.Lab.progress.clear();
        window.Lab.progress.save();
        paint(0);
        if (base) {
          window.Lab.loadJSON('flashcards.json').then(function (json) { paint(json.cards.length); }, function () {});
        }
      }
    });
  }
})();
