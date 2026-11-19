/* Runs before first paint (tiny, synchronous). Sets js/no-js, review notes in the private
   preview, and decides whether the loading animation plays: on every fresh open and every
   reload (owner, 20 Nov 2026: "where is my loading animation"), including arrival through the
   root language chooser; not when moving between this site's own pages, not on back/forward,
   never under reduced motion (and never without JavaScript, since this script adds the class).
   Other projects on the same host (github.io) do not count as this site. */
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
    var m = location.pathname.match(/^(.*?)\/(th|en|vi)\//);
    var base = m ? m[1] : '';
    var fromPage = false;
    try {
      var r = document.referrer ? new URL(document.referrer) : null;
      fromPage = !!r && r.origin === location.origin && r.pathname.indexOf(base + '/') === 0 && /^\/(th|en|vi)\//.test(r.pathname.slice(base.length));
    } catch (e) {}
    var fresh = nav.type === 'reload' || !fromPage;
    var off = false;
    try { off = !!sessionStorage.getItem('pk-noloader'); } catch (e) {} // set only by the test suites
    if (d.getAttribute('data-loader-mode') === 'on' && !reduce && fresh && nav.type !== 'back_forward' && !off) {
      d.classList.add('loading');
    }
  } catch (e) {}
})();
