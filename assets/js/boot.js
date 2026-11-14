/**
 * boot.js
 * Tiny synchronous script loaded in <head>. It marks the document as
 * JavaScript-enabled before first paint so CSS can safely use reveal
 * animations and the mobile menu without a flash of unstyled content.
 */
document.documentElement.classList.add('js');
