/* Liquid glass for the header bar, drawn by Glisse (npm glisse@0.5.0) on Preact's React-compatible core. Loaded by site.js
   after first paint; the CSS frosted bar stays for no-JS, reduced transparency and more contrast.
   Chromium bends the page behind the bar; Safari and other WebKit browsers show Glisse's frosted
   glass without the bend (a limit of the library, recorded in docs/ART_DIRECTION.md). */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Glass } from 'glisse';

const slot = document.querySelector('[data-glass]');
const plain = window.matchMedia && (matchMedia('(prefers-reduced-transparency: reduce)').matches || matchMedia('(prefers-contrast: more)').matches);
if (slot && !plain && !slot.classList.contains('is-glisse')) {
  slot.classList.add('is-glisse');
  createRoot(slot).render(createElement(Glass, { className: 'header-lens' }));
}
