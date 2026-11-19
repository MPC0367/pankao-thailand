/* Pankao — progressive enhancement. Every feature here is optional: without this script the
   pages, links, product pages and contact details all work. Motion families M1–M10 only. */
(function () {
  'use strict';
  var d = document.documentElement;
  var reduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set: function (k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} },
    del: function (k, s) { try { (s ? sessionStorage : localStorage).removeItem(k); } catch (e) {} },
  };

  /* ---------- loader (owner's request): ends ~3.7 s after navigation (slowed on the owner's word, 20 Nov 2026), or at once on a click or key ---------- */
  if (d.classList.contains('loading')) {
    var ldr = $('[data-loader]');
    var ended = false;
    var endLoader = function () {
      if (ended) return;
      ended = true;
      store.set('pk-seen', '1', true);
      d.classList.add('loaded', 'reveal');
      setTimeout(function () { d.classList.remove('loading', 'loaded'); }, 480);
      setTimeout(function () { d.classList.remove('reveal'); }, 1500);
    };
    setTimeout(endLoader, Math.max(0, 3700 - performance.now()));
    if (ldr) ldr.addEventListener('click', endLoader);
    window.addEventListener('keydown', endLoader, { once: true });
  }

  /* ---------- public preview strip: dismissible for the session (the footer keeps the note) ---------- */
  $$('[data-preview-dismiss]').forEach(function (b) {
    b.addEventListener('click', function () { store.set('pk-preview-hidden', '1', true); d.classList.add('preview-hidden'); var h = $('[data-header] .brand'); if (h) h.focus(); });
  });

  /* ---------- liquid glass header (Glisse), after first paint ---------- */
  var glassSrc = d.getAttribute('data-glass-src');
  if (glassSrc && $('[data-glass]')) {
    var loadGlass = function () { var sc = document.createElement('script'); sc.type = 'module'; sc.src = glassSrc; document.head.appendChild(sc); };
    if ('requestIdleCallback' in window) requestIdleCallback(loadGlass, { timeout: 2000 }); else setTimeout(loadGlass, 800);
  }

  /* ---------- M3 header state ---------- */
  var header = $('[data-header]');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { header.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- the flowing ground: four soft lights wander as the page scrolls (owner, 19 Nov 2026:
     "background gradients that fade into each other ... more dynamic"). Bounded, so a light never
     leaves for good on a long page; still under reduced motion. ---------- */
  var lights = $$('.aura i');
  if (lights.length && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var ways = [[900, 0.16, 0.08], [1300, 0.22, 0.1], [1100, 0.26, 0.12], [1600, 0.2, 0.09]];
    var drifting = false;
    var drift = function () {
      drifting = false;
      var y = window.scrollY, h = window.innerHeight, w = window.innerWidth;
      for (var i = 0; i < lights.length; i++) {
        var k = ways[i % ways.length], a = y / k[0] + i * 1.7;
        lights[i].style.transform = 'translate3d(' + (Math.cos(a) * k[2] * w).toFixed(1) + 'px,' + (Math.sin(a) * k[1] * h - y * 0.04).toFixed(1) + 'px,0)';
      }
    };
    window.addEventListener('scroll', function () { if (!drifting) { drifting = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  /* ---------- dropdowns (language, products): one open at a time; Escape and outside clicks close ---------- */
  var drops = $$('[data-dropdown]');
  drops.forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) drops.forEach(function (o) { if (o !== d) o.open = false; }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.open) { d.open = false; d.querySelector('summary').focus(); } });
  });
  document.addEventListener('click', function (e) { drops.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; }); });

  /* ---------- M4 drawer (native modal dialog) ---------- */
  var drawer = $('[data-drawer]');
  if (drawer && typeof drawer.showModal === 'function') {
    $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { drawer.showModal(); }); });
    $$('[data-menu-close]', drawer).forEach(function (b) { b.addEventListener('click', function () { drawer.close(); }); });
    drawer.addEventListener('click', function (e) { if (e.target === drawer) drawer.close(); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { drawer.close(); }); });
    // Keep Tab inside the open drawer (the page behind is inert; this stops focus leaving to the browser UI).
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button:not([disabled])', drawer).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      e.preventDefault();
      var i = f.indexOf(document.activeElement);
      var n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === -1 || i === f.length - 1 ? 0 : i + 1);
      f[n].focus();
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900 && drawer.open) drawer.close(); });
  }

  /* ---------- review notes toggle (private preview only) ---------- */
  var rt = $('[data-review-toggle]');
  if (rt) {
    rt.setAttribute('aria-pressed', String(d.classList.contains('review')));
    rt.addEventListener('click', function () {
      var on = !d.classList.contains('review');
      d.classList.toggle('review', on);
      rt.setAttribute('aria-pressed', String(on));
      store.set('pk-review', on ? '1' : '0');
    });
  }

  /* ---------- language switch keeps query, filters and anchor ---------- */
  $$('[data-lang-switch]').forEach(function (a) {
    a.addEventListener('click', function () {
      var base = a.getAttribute('href').split(/[?#]/)[0];
      a.setAttribute('href', base + location.search + location.hash);
    });
  });

  /* ---------- M7 section arrival ---------- */
  var arrivals = $$('.arrive');
  if (!('IntersectionObserver' in window) || reduce.matches) {
    arrivals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    arrivals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- M6 pack ↔ prepared dish ---------- */
  $$('[data-view-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var media = document.getElementById(b.getAttribute('aria-controls'));
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      if (media) media.setAttribute('data-view', on ? 'dish' : 'pack');
    });
  });

  /* ---------- product filter: URL is the only state ---------- */
  var list = $('[data-product-list]');
  if (list) {
    var cards = $$('[data-product]', list);
    var search = $('[data-filter-search]');
    var chips = $$('[data-filter-format]');
    var count = $('[data-result-count]');
    var empty = $('[data-filter-empty]');
    var resets = $$('[data-filter-reset]');
    var norm = function (s) { return (s || '').toLowerCase().normalize('NFC').trim(); };
    var read = function () {
      var p = new URLSearchParams(location.search);
      return { q: p.get('q') || '', format: p.get('format') || '' };
    };
    var apply = function (st) {
      var q = norm(st.q);
      var n = 0;
      cards.forEach(function (c) {
        var ok = (!st.format || c.getAttribute('data-format') === st.format) && (!q || c.getAttribute('data-names').indexOf(q) !== -1);
        c.hidden = !ok;
        if (ok) n++;
      });
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', String(ch.getAttribute('data-filter-format') === st.format)); });
      if (search && document.activeElement !== search) search.value = st.q;
      if (count) count.textContent = (n === 1 ? count.getAttribute('data-one') : count.getAttribute('data-other')).replace('{n}', n);
      if (empty) empty.hidden = n !== 0;
      resets.forEach(function (r) { if (r.closest('.result-line')) r.hidden = !(st.q || st.format); });
    };
    var write = function (st, push) {
      var p = new URLSearchParams(location.search);
      st.q ? p.set('q', st.q) : p.delete('q');
      st.format ? p.set('format', st.format) : p.delete('format');
      var qs = p.toString();
      history[push ? 'pushState' : 'replaceState'](st, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      apply(st);
    };
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () { var st = read(); st.format = ch.getAttribute('data-filter-format'); write(st, true); });
    });
    if (search) {
      var tmr;
      search.addEventListener('input', function () {
        clearTimeout(tmr);
        tmr = setTimeout(function () { var st = read(); st.q = search.value; write(st, false); }, 160);
      });
    }
    resets.forEach(function (r) {
      r.addEventListener('click', function () {
        write({ q: '', format: '' }, true);
        if (search) search.value = '';
        var all = chips[0];
        if (all) all.focus();
      });
    });
    window.addEventListener('popstate', function () { apply(read()); });
    apply(read());
  }

  /* ---------- M8 process strand ---------- */
  var proc = $('[data-process]');
  if (proc) {
    var thread = $('[data-process-thread]', proc);
    var steps = $$('[data-step]', proc);
    if (reduce.matches) {
      if (thread) thread.style.setProperty('--p', '1');
      steps.forEach(function (s) { s.classList.add('is-reached'); });
    } else {
      var queued = false;
      var update = function () {
        queued = false;
        var r = proc.getBoundingClientRect();
        var mid = window.innerHeight * 0.6;
        var p = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
        if (thread) thread.style.setProperty('--p', p.toFixed(3));
        steps.forEach(function (s) { s.classList.toggle('is-reached', s.getBoundingClientRect().top < mid); });
      };
      var q = function () { if (!queued) { queued = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', q, { passive: true });
      window.addEventListener('resize', q);
      update();
    }
  }

  /* ---------- copy text helper ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.className = 'sr-only';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? res() : rej(new Error('copy')); } catch (e) { rej(e); }
      document.body.removeChild(ta);
    });
  }

  /* ---------- copy address ---------- */
  var copyBtn = $('[data-copy-address]');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var addr = $('[data-address]');
      var status = $('[data-copy-status]');
      copyText(addr.getAttribute('data-address')).then(function () {
        var label = copyBtn.textContent;
        copyBtn.textContent = copyBtn.getAttribute('data-copied');
        if (status) status.textContent = copyBtn.getAttribute('data-copied');
        setTimeout(function () { copyBtn.textContent = label; }, 2400);
      }).catch(function () {});
    });
  }

  /* ---------- map on request only (no third-party request before this click) ---------- */
  var mapBtn = $('[data-map-show]');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var panel = $('[data-map]');
      var f = document.createElement('iframe');
      f.src = panel.getAttribute('data-embed');
      f.title = panel.getAttribute('data-map-title');
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.setAttribute('allowfullscreen', '');
      panel.innerHTML = '';
      panel.appendChild(f);
      f.focus();
    });
  }

  /* ---------- M10 enquiry forms ---------- */
  $$('[data-enquiry-form]').forEach(function (form) { enquiry(form); });

  function enquiry(form) {
    var kind = form.getAttribute('data-enquiry-form');
    var backend = form.getAttribute('data-backend');
    var S = JSON.parse($('[data-form-strings]', form).textContent);
    var summary = $('[data-error-summary]', form);
    var statusEl = $('[data-form-status]', form);
    var submit = $('[data-submit]', form);
    var restored = $('[data-restored]', form);
    var DRAFT = 'pk-draft-' + kind;
    var IDEM = 'pk-idem-' + kind;
    var started = Date.now();
    var attempted = false;
    var inFlight = false;
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var REQUIRED = kind === 'oem'
      ? { company: S.company, name: S.name, email: S.emailRequired, country: S.country, format: S.format, message: S.message, consent: S.consent }
      : { name: S.name, email: S.emailRequired, subject: S.subject, message: S.message, consent: S.consent };

    var key = function () {
      var k = store.get(IDEM, true);
      if (!k) { k = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2); store.set(IDEM, k, true); }
      return k;
    };

    function data() {
      var o = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.name === 'website' || el.type === 'submit') return;
        if (el.type === 'checkbox') {
          if (el.name === 'formats') { o.formats = o.formats || []; if (el.checked) o.formats.push(el.value); }
          else o[el.name] = el.checked ? el.value : '';
        } else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; else if (!(el.name in o)) o[el.name] = ''; }
        else o[el.name] = el.value;
      });
      return o;
    }
    function fill(o) {
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || !(el.name in o) || el.type === 'hidden') return;
        if (el.type === 'checkbox') el.checked = el.name === 'formats' ? (o.formats || []).indexOf(el.value) !== -1 : o[el.name] === el.value;
        else if (el.type === 'radio') el.checked = o[el.name] === el.value;
        else el.value = o[el.name];
      });
      // A restored draft with answers in the optional step shows them.
      var more = form.querySelector('[data-form-more]');
      if (more && Array.prototype.some.call(more.querySelectorAll('input, select, textarea'), function (el) { return el.type === 'checkbox' || el.type === 'radio' ? el.checked : !!el.value; })) more.open = true;
    }
    function hasContent(o) {
      return Object.keys(o).some(function (k) { return k !== 'kind' && k !== 'locale' && (Array.isArray(o[k]) ? o[k].length : o[k]); });
    }
    function save() { var o = data(); if (hasContent(o)) store.set(DRAFT, JSON.stringify(o), true); else store.del(DRAFT, true); }

    /* restore a draft (e.g. after switching language) */
    var draft = store.get(DRAFT, true);
    if (draft) {
      try { var od = JSON.parse(draft); if (hasContent(od)) { fill(od); if (restored) restored.hidden = false; } } catch (e) {}
    }
    var subj = new URLSearchParams(location.search).get('subject');
    if (subj && form.elements.subject && !form.elements.subject.value) form.elements.subject.value = subj;
    form.addEventListener('input', function (e) { save(); if (attempted && e.target.name) validateField(e.target.name); });
    form.addEventListener('change', function (e) { save(); if (attempted && e.target.name) validateField(e.target.name); });
    var clearBtn = $('[data-clear-draft]', form);
    if (clearBtn) clearBtn.addEventListener('click', function () { form.reset(); store.del(DRAFT, true); restored.hidden = true; });

    function fieldEl(name) { return form.elements[name]; }
    function errorFor(name) {
      var el = fieldEl(name);
      if (!el) return '';
      var v = el.type === 'checkbox' ? (el.checked ? 'yes' : '') : (el.value || '').trim();
      if (REQUIRED[name] && !v) return REQUIRED[name];
      if (name === 'email' && v && !EMAIL.test(v)) return S.emailInvalid;
      var max = el.getAttribute && el.getAttribute('maxlength');
      if (max && v.length > +max) return S.tooLong.replace('{max}', max);
      return '';
    }
    function show(name, msg) {
      var el = fieldEl(name);
      if (!el) return;
      var id = el.id;
      var err = document.getElementById(id + '-error') || document.getElementById(kind + '-' + name + '-error');
      var described = (el.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== (err && err.id); });
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
        if (err) { err.textContent = msg; err.hidden = false; described.push(err.id); }
      } else {
        el.removeAttribute('aria-invalid');
        if (err) { err.textContent = ''; err.hidden = true; }
      }
      if (described.length) el.setAttribute('aria-describedby', described.join(' ')); else el.removeAttribute('aria-describedby');
    }
    function validateField(name) { if (name in REQUIRED || name === 'email' || fieldEl(name)) show(name, errorFor(name)); }
    function validateAll(serverErrors) {
      var names = Object.keys(REQUIRED).concat(['phone', 'role', 'application', 'packaging', 'documents']);
      var errs = [];
      names.forEach(function (n) {
        if (!fieldEl(n)) return;
        var m = (serverErrors && serverErrors[n]) || errorFor(n);
        show(n, m);
        if (m) { var more = fieldEl(n).closest && fieldEl(n).closest('[data-form-more]'); if (more) more.open = true; }
        if (m) errs.push({ id: fieldEl(n).id, msg: m });
      });
      return errs;
    }
    function renderSummary(errs) {
      if (!errs.length) { summary.hidden = true; return; }
      $('h2', summary).textContent = errs.length === 1 ? S.errSummaryOne : S.errSummaryOther.replace('{n}', errs.length);
      var ul = $('ul', summary);
      ul.innerHTML = '';
      errs.forEach(function (e) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + e.id;
        a.textContent = e.msg;
        a.addEventListener('click', function (ev) { ev.preventDefault(); var t = document.getElementById(e.id); t.focus(); t.scrollIntoView({ block: 'center' }); });
        li.appendChild(a);
        ul.appendChild(li);
      });
      summary.hidden = false;
      summary.focus();
    }

    function briefText() {
      var o = data();
      var lines = [S.briefTitle, ''];
      Array.prototype.forEach.call(form.querySelectorAll('[data-field]'), function (f) {
        var label = $('label, legend', f);
        var name = f.getAttribute('data-field');
        var v = name === 'formats'
          ? $$('input:checked', f).map(function (i) { return i.nextElementSibling.textContent; }).join(', ')
          : name === 'need' ? ($$('input:checked', f).map(function (i) { return i.nextElementSibling.textContent; })[0] || '')
          : name === 'consent' ? '' : (fieldEl(name) && fieldEl(name).tagName === 'SELECT' && fieldEl(name).value ? fieldEl(name).selectedOptions[0].textContent : (o[name] || ''));
        if (v && label) lines.push(label.childNodes[0].textContent.trim() + ': ' + v);
      });
      return lines.join('\n');
    }
    function tools() {
      var wrap = document.createElement('div');
      wrap.className = 'brief-tools';
      var mk = function (label, fn, cls) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'btn ' + (cls || 'btn--line'); b.textContent = label;
        b.addEventListener('click', function () { fn(b); });
        wrap.appendChild(b);
        return b;
      };
      mk(S.copy, function (b) { copyText(briefText()).then(function () { var l = b.textContent; b.textContent = S.copied; setTimeout(function () { b.textContent = l; }, 2400); }); });
      mk(S.download, function () {
        var blob = new Blob([briefText()], { type: 'text/plain;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'pankao-' + kind + '-brief.txt';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      var mail = form.getAttribute('data-mail');
      if (mail) {
        var a = document.createElement('a');
        a.className = 'btn btn--line';
        a.href = 'mailto:' + mail + '?subject=' + encodeURIComponent(S.briefTitle) + '&body=' + encodeURIComponent(briefText());
        a.textContent = S.emailIt;
        wrap.appendChild(a);
      }
      var tel = form.getAttribute('data-tel');
      if (tel && S.call) { var c = document.createElement('a'); c.className = 'btn btn--line'; c.href = 'tel:' + tel; c.textContent = S.call; wrap.appendChild(c); }
      return wrap;
    }
    function state(tone, title, body, opts) {
      statusEl.innerHTML = '';
      statusEl.setAttribute('data-tone', tone);
      var h = document.createElement('h3'); h.textContent = title; statusEl.appendChild(h);
      if (body) { var p = document.createElement('p'); p.textContent = body; statusEl.appendChild(p); }
      if (opts && opts.retry) {
        var row = document.createElement('div'); row.className = 'btn-row';
        var r = document.createElement('button'); r.type = 'button'; r.className = 'btn btn--primary'; r.textContent = S.retry;
        r.addEventListener('click', function () { form.requestSubmit ? form.requestSubmit() : send(); });
        row.appendChild(r); statusEl.appendChild(row);
      }
      if (opts && opts.tools) statusEl.appendChild(tools());
      statusEl.hidden = false;
      if (opts && opts.focus) { statusEl.setAttribute('tabindex', '-1'); statusEl.focus(); }
    }
    function busy(on) {
      inFlight = on;
      if (!submit) return;
      submit.disabled = on;
      submit.setAttribute('aria-disabled', String(on));
      if (on) { submit.setAttribute('data-label', submit.textContent); submit.textContent = S.sending; }
      else if (submit.getAttribute('data-label')) submit.textContent = submit.getAttribute('data-label');
    }
    function stamp(iso) {
      try {
        var loc = form.getAttribute('data-locale');
        return new Intl.DateTimeFormat(loc === 'th' ? 'th-TH' : loc === 'vi' ? 'vi-VN' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(new Date(iso));
      } catch (e) { return iso; }
    }
    function succeeded(tone, res) {
      store.del(DRAFT, true);
      store.del(IDEM, true);
      form.reset();
      if (restored) restored.hidden = true;
      state('ok', tone === 'dup' ? S.dupH : S.okH, (tone === 'dup' ? S.dupBody : S.okBody).replace('{id}', res.enquiryId).replace('{time}', stamp(res.receivedAt)), { focus: true });
    }

    function send() {
      if (inFlight) return;
      if (backend !== 'mock') { state('bad', S.unavailableH, S.unavailableBody, { tools: true, focus: true }); return; }
      if (navigator.onLine === false) { state('bad', S.offlineH, S.offlineBody, { tools: true, focus: true }); return; }
      busy(true);
      statusEl.hidden = true;
      var slow = setTimeout(function () { state('info', S.slow, ''); }, 4000);
      var ctrl = window.AbortController ? new AbortController() : null;
      var timeout = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
      var payload = data();
      payload.elapsedMs = Date.now() - started;
      payload.website = form.elements.website ? form.elements.website.value : '';
      var headers = { 'Content-Type': 'application/json', 'Idempotency-Key': key() };
      var scenario = new URLSearchParams(location.search).get('mock');
      if (scenario) headers['X-Mock-Scenario'] = scenario;
      fetch(form.getAttribute('action'), { method: 'POST', headers: headers, body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined, credentials: 'same-origin' })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; }); })
        .then(function (res) {
          clearTimeout(slow); clearTimeout(timeout); busy(false);
          if (res.status === 201 && res.body.enquiryId) succeeded('ok', res.body);
          else if (res.status === 409 && res.body.enquiryId) succeeded('dup', res.body);
          else if (res.status === 400 && res.body.fields) { statusEl.hidden = true; renderSummary(validateAll(res.body.fields)); }
          else if (res.status === 429) state('bad', S.rateH, S.rateBody, { focus: true });
          else state('bad', S.failH, S.failBody, { retry: true, tools: true, focus: true });
        })
        .catch(function () {
          clearTimeout(slow); clearTimeout(timeout); busy(false);
          if (navigator.onLine === false) state('bad', S.offlineH, S.offlineBody, { tools: true, focus: true });
          else state('bad', S.failH, S.failBody, { retry: true, tools: true, focus: true });
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      attempted = true;
      var errs = validateAll();
      renderSummary(errs);
      if (errs.length) return;
      send();
    });
  }
})();
