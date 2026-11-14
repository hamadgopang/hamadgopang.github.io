/* ==========================================================================
   lab-teacher.js  -  Teacher Mode for every Organic Chemistry Lab tool

   Adds a "Teacher Mode" button to the banner. Pressing it turns the tool
   (#labTool) into a full-screen classroom view with large text and structures.
   It uses the Fullscreen API when available and falls back to a fixed overlay,
   so it also works on smart boards and browsers that block fullscreen.

   Keyboard (only while Teacher Mode is on):
     Right / Left arrow   next / previous step (tools listen for lab:next, lab:prev)
     Up / Down arrow      previous / next topic (lab:up, lab:down)
     Space                play / pause or flip (lab:toggle)
     F                    toggle browser fullscreen
     Esc                  leave Teacher Mode
   ========================================================================== */
(function () {
  'use strict';

  var tool = document.getElementById('labTool');
  var slot = document.querySelector('[data-teacher-slot]');
  if (!tool || !slot) { return; }

  var title = tool.getAttribute('data-tool-title') || 'Organic Chemistry Lab';
  var on = false;
  var fsActive = false;

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text) { n.textContent = text; }
    return n;
  }

  function kbd(text) { return make('kbd', '', text); }

  /* Banner button */
  var button = make('button', 'lab-btn lab-btn--amber', 'Teacher Mode');
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Teacher Mode: full-screen classroom view');
  slot.appendChild(button);

  /* In-tool bar, only visible in Teacher Mode */
  var bar = make('div', 'lab-teacher-bar');
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Teacher Mode controls');
  var barTitle = make('span', 'lab-teacher-title', title);
  var hint = make('span', 'lab-teacher-hint');
  hint.appendChild(kbd('\u2190'));
  hint.appendChild(kbd('\u2192'));
  hint.appendChild(document.createTextNode(' step   '));
  hint.appendChild(kbd('\u2191'));
  hint.appendChild(kbd('\u2193'));
  hint.appendChild(document.createTextNode(' topic   '));
  hint.appendChild(kbd('Space'));
  hint.appendChild(document.createTextNode(' play / flip   '));
  hint.appendChild(kbd('F'));
  hint.appendChild(document.createTextNode(' fullscreen   '));
  hint.appendChild(kbd('Esc'));
  hint.appendChild(document.createTextNode(' exit'));
  var exitBtn = make('button', 'lab-btn lab-btn--ghost lab-btn--small', 'Exit Teacher Mode');
  exitBtn.type = 'button';
  bar.appendChild(barTitle);
  bar.appendChild(hint);
  bar.appendChild(exitBtn);
  tool.insertBefore(bar, tool.firstChild);

  function fire(name) {
    tool.dispatchEvent(new CustomEvent(name, { bubbles: false }));
  }

  function enter() {
    if (on) { return; }
    on = true;
    tool.classList.add('is-teacher');
    document.documentElement.classList.add('lab-teacher-on');
    button.setAttribute('aria-pressed', 'true');
    var req = tool.requestFullscreen || tool.webkitRequestFullscreen;
    if (req) {
      try {
        var p = req.call(tool);
        if (p && p.then) {
          p.then(function () { fsActive = true; }, function () { fsActive = false; });
        } else {
          fsActive = true;
        }
      } catch (e) { fsActive = false; }
    }
    exitBtn.focus();
    fire('lab:teacher-on');
  }

  function leave() {
    if (!on) { return; }
    on = false;
    tool.classList.remove('is-teacher');
    document.documentElement.classList.remove('lab-teacher-on');
    button.setAttribute('aria-pressed', 'false');
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) { try { exit.call(document); } catch (e) { /* ignore */ } }
    }
    fsActive = false;
    button.focus();
    fire('lab:teacher-off');
  }

  function toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) { exit.call(document); }
    } else {
      var req = tool.requestFullscreen || tool.webkitRequestFullscreen;
      if (req) { try { req.call(tool); } catch (e) { /* ignore */ } }
    }
  }

  button.addEventListener('click', function () { if (on) { leave(); } else { enter(); } });
  exitBtn.addEventListener('click', leave);

  /* If the browser leaves fullscreen (for example with Esc), leave Teacher Mode too. */
  function onFsChange() {
    var active = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (active) { fsActive = true; return; }
    if (on && fsActive) { leave(); }
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  document.addEventListener('keydown', function (ev) {
    if (!on) { return; }
    var t = ev.target;
    var tag = t && t.tagName ? t.tagName.toUpperCase() : '';
    var typing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    var isButton = tag === 'BUTTON' || tag === 'A';
    if (ev.key === 'Escape') {
      ev.preventDefault();
      leave();
      return;
    }
    if (typing || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
    switch (ev.key) {
      case 'ArrowRight': ev.preventDefault(); fire('lab:next'); break;
      case 'ArrowLeft': ev.preventDefault(); fire('lab:prev'); break;
      case 'ArrowUp': ev.preventDefault(); fire('lab:up'); break;
      case 'ArrowDown': ev.preventDefault(); fire('lab:down'); break;
      case ' ':
        if (!isButton) { ev.preventDefault(); fire('lab:toggle'); }
        break;
      case 'f':
      case 'F':
        ev.preventDefault();
        toggleFullscreen();
        break;
      default: break;
    }
  });

  window.LabTeacher = {
    isOn: function () { return on; },
    enter: enter,
    leave: leave
  };
})();
