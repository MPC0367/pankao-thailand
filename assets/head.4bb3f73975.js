/* Runs before first paint (tiny, synchronous). Sets js/no-js, review notes in the private
   preview, and decides whether the loading animation plays: in full (~4 s) on a visitor's first
   open in a browser session, including arrival through the root language chooser; reloads and later
   visits in the same session show the page at once (owner's choice, 20 Nov 2026, on the premium
   audit's "a beautiful mark should not become a four-second toll"). Never between this site's own
   pages, on back/forward, under reduced motion or without JavaScript. Other projects on the same
   host (github.io) do not count as this site. */
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  try { if (sessionStorage.getItem('pk-preview-hidden')) d.classList.add('preview-hidden'); } catch (e) {}
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
    var off = false, seen = false;
    try { off = !!sessionStorage.getItem('pk-noloader'); seen = !!sessionStorage.getItem('pk-seen'); } catch (e) {} // pk-noloader: test suites only
    if (d.getAttribute('data-loader-mode') === 'on' && !reduce && !fromPage && !seen && nav.type !== 'back_forward' && !off) {
      d.classList.add('loading');
    }
  } catch (e) {}
})();
