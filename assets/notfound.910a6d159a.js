/* Locale-aware "page not found" on hosts that serve one 404 page for every path (GitHub Pages serves the site's root
   404.html, which is Thai). The root 404 carries the English and Vietnamese pages in <template>s; before site.js runs,
   this swaps in the one that matches the address's first segment, with its language, title and description. The
   HTTP status stays 404. Without script the Thai page stays (Codex audit, fourth edition, F17.4). */
(function () {
  var m = location.pathname.match(/\/(th|en|vi)(\/|$)/);
  if (!m || m[1] === 'th') return;
  var t = document.querySelector('template[data-404="' + m[1] + '"]');
  if (!t) return;
  document.documentElement.lang = t.getAttribute('data-lang');
  document.title = t.getAttribute('data-title');
  var d = document.querySelector('meta[name="description"]');
  if (d) d.setAttribute('content', t.getAttribute('data-desc'));
  document.body.replaceChildren(t.content.cloneNode(true));
})();
