/* Root "/": a light language preference redirect. Thai is the default and the no-script
   fallback (x-default). No geo-blocking: every language stays one link away. */
(function () {
  var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'th']).map(function (l) { return String(l).toLowerCase(); });
  var pick = 'th';
  for (var i = 0; i < langs.length; i++) {
    var l = langs[i].slice(0, 2);
    if (l === 'th' || l === 'en' || l === 'vi') { pick = l; break; }
  }
  var base = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  location.replace(base + '/' + pick + '/' + location.search + location.hash);
})();
