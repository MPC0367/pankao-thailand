/* Runs before first paint (tiny, synchronous). Sets js/no-js, review notes in the private
   preview, and decides whether the grain-to-thread opening may play: first visit only,
   home page only, never under reduced motion, never on reload or back/forward. */
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
    var home = /^\/(th|en|vi)\/?$/.test(location.pathname);
    if (home && !reduce && !localStorage.getItem('pk-opened') && nav.type !== 'reload' && nav.type !== 'back_forward') {
      d.classList.add('opening');
    }
  } catch (e) {}
})();
