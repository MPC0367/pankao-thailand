/* Runs before first paint (tiny, synchronous). Sets js/no-js, review notes in the private
   preview, and decides whether the loading animation plays: once per browser-tab session,
   not when arriving from another page of this site, not on back/forward, never under
   reduced motion (and never without JavaScript, since this script adds the class). */
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  try {
    if (d.getAttribute('data-mode') === 'preview') {
      if (localStorage.getItem('pk-review') === '1' || /[?&]review=1/.test(location.search)) d.classList.add('review');
    }
  } catch (e) {}
  try {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
    var internal = false;
    try { internal = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
    if (d.getAttribute('data-loader-mode') === 'on' && !reduce && !internal && nav.type !== 'back_forward' && !sessionStorage.getItem('pk-loaded')) {
      d.classList.add('loading');
    }
  } catch (e) {}
})();
