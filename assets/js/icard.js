/* Delegate iCard: after a successful registration the delegate can design their own card.
   Enabled for IPL, STARTUP, UNHRC and CCEP only (the other committees are added later: extend ENABLED).
   Everything stays in the browser: a chosen photo is shrunk locally and never uploaded. */
(function () {
  'use strict';
  var ENABLED = {
    IPL: { name: 'Indian Premier League', accent: '#f0c14b' },
    STARTUP: { name: 'Startup Boardroom', accent: '#ff9a7a' },
    UNHRC: { name: 'UN Human Rights Council', accent: '#6fb4ee' },
    CCEP: { name: 'Corporate Engagement & Policy Making', accent: '#3fd6bb' }
  };
  var THEMES = [['Committee', null], ['Gold', '#e9b949'], ['Crimson', '#d6334a'], ['Ocean', '#2b7de9'], ['Emerald', '#1fa66a'], ['Violet', '#8a5cf0'], ['Sunset', '#ff7a45'], ['Graphite', '#8b95a5']];
  var STYLES = [['classic', 'Classic'], ['gradient', 'Gradient'], ['geometric', 'Geometric'], ['neon', 'Neon'], ['minimal', 'Minimal']];
  var SHAPES = [['circle', 'Circle'], ['rounded', 'Rounded'], ['hex', 'Hexagon']];
  var FINISHES = [['matte', 'Matte'], ['glossy', 'Glossy'], ['holo', 'Holographic']];
  var TITLES = ['Delegate', 'Diplomat', 'Strategist', 'Dealmaker', 'Dark Horse'];
  var ICONS = {
    star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>',
    bolt: '<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z"/>',
    globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    trophy: '<path d="M7 3h10v5a5 5 0 01-10 0zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M10 14h4v3h2v3H8v-3h2z"/>',
    rocket: '<path d="M12 2c4 2 6 6 5 11l-3 3h-4l-3-3C6 8 8 4 12 2zM9 17l-3 4 4-1M15 17l3 4-4-1"/><circle cx="12" cy="9" r="1.8" fill="#000"/>'
  };
  var BADGE_LABEL = { star: 'Star', bolt: 'Bolt', globe: 'Globe', trophy: 'Trophy', rocket: 'Rocket' };

  var root, card, ctx = null, state = null, drag = null;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var reduce = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };

  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var f = function (v) { return Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt)))); };
    return '#' + [f(r), f(g), f(b)].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
  }
  function fresh() { return { theme: 0, style: 'classic', shape: 'circle', finish: 'glossy', title: 'Delegate', badges: [], photo: null, zoom: 1, ox: 0, oy: 0 }; }
  function storeKey() { return 'mun-icard:' + ctx.email; }
  function load() { try { var v = JSON.parse(localStorage.getItem(storeKey()) || 'null'); if (v && typeof v === 'object') return Object.assign(fresh(), v); } catch (e) {} return fresh(); }
  function save() { try { localStorage.setItem(storeKey(), JSON.stringify(state)); return true; } catch (e) { return false; } }

  function build() {
    root = document.createElement('div');
    root.className = 'ic-overlay'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'icTitle'); root.hidden = true;
    root.innerHTML =
      '<div class="ic-shell">' +
      '<button class="ic-close" type="button" aria-label="Close">&times;</button>' +
      '<div class="ic-stage"><p class="ic-kicker">REGISTRATION RECEIVED</p><h2 id="icTitle">Design your delegate iCard</h2>' +
      '<div class="ic-scene"><article class="ic-card" id="icCard"></article></div>' +
      '<p class="ic-hint">Move your mouse over the card. Your photo stays on this device.</p></div>' +
      '<div class="ic-panel">' +
      '<div class="ic-power"><div class="ic-power-top"><b id="icLevel">Rookie</b><span id="icCount">0 / 6 customised</span></div><div class="ic-bar"><i id="icBar"></i></div></div>' +
      '<fieldset><legend>Photo</legend><div class="ic-row"><label class="ic-btn ic-file">Upload photo<input id="icFile" type="file" accept="image/png,image/jpeg,image/webp" hidden></label><button class="ic-btn ghost" id="icPhotoClear" type="button">Remove</button></div>' +
      '<label class="ic-range">Zoom <input id="icZoom" type="range" min="1" max="2.6" step="0.05" value="1"></label><p class="ic-note" id="icPhotoNote">Drag the photo on the card to reposition it.</p>' +
      '<div class="ic-chips" id="icShapes" role="radiogroup" aria-label="Photo shape"></div></fieldset>' +
      '<fieldset><legend>Colour</legend><div class="ic-swatches" id="icThemes" role="radiogroup" aria-label="Card colour"></div></fieldset>' +
      '<fieldset><legend>Design</legend><div class="ic-chips" id="icStyles" role="radiogroup" aria-label="Card design"></div><div class="ic-chips" id="icFinishes" role="radiogroup" aria-label="Card finish"></div></fieldset>' +
      '<fieldset><legend>Card title</legend><div class="ic-chips" id="icTitles" role="radiogroup" aria-label="Card title"></div></fieldset>' +
      '<fieldset><legend>Badges <small>(pick up to 3)</small></legend><div class="ic-chips" id="icBadges"></div></fieldset>' +
      '<div class="ic-actions"><button class="ic-btn ghost" id="icSurprise" type="button">Surprise me</button><button class="ic-btn ghost" id="icReset" type="button">Reset</button><button class="ic-btn primary" id="icSave" type="button">Save my card</button></div>' +
      '<p class="ic-status" id="icStatus" role="status" aria-live="polite"></p></div></div>';
    document.body.appendChild(root);
    card = $('#icCard');

    // controls
    var chips = function (id, list, key, single) {
      var box = $(id); box.innerHTML = list.map(function (it) { var v = Array.isArray(it) ? it[0] : it, l = Array.isArray(it) ? it[1] : it; return '<button type="button" class="ic-chip" role="radio" data-v="' + esc(v) + '">' + esc(l) + '</button>'; }).join('');
      box.addEventListener('click', function (e) { var b = e.target.closest('.ic-chip'); if (!b) return; state[key] = b.dataset.v; render(); });
    };
    chips('#icShapes', SHAPES, 'shape'); chips('#icStyles', STYLES, 'style'); chips('#icFinishes', FINISHES, 'finish'); chips('#icTitles', TITLES, 'title');
    $('#icThemes').innerHTML = THEMES.map(function (t, i) { return '<button type="button" class="ic-sw" role="radio" data-i="' + i + '" aria-label="' + t[0] + '" title="' + t[0] + '"></button>'; }).join('');
    $('#icThemes').addEventListener('click', function (e) { var b = e.target.closest('.ic-sw'); if (!b) return; state.theme = +b.dataset.i; render(); });
    $('#icBadges').innerHTML = Object.keys(ICONS).map(function (k) { return '<button type="button" class="ic-chip ic-badgebtn" data-v="' + k + '" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>' + BADGE_LABEL[k] + '</button>'; }).join('');
    $('#icBadges').addEventListener('click', function (e) {
      var b = e.target.closest('.ic-chip'); if (!b) return; var k = b.dataset.v, i = state.badges.indexOf(k);
      if (i > -1) state.badges.splice(i, 1); else if (state.badges.length < 3) state.badges.push(k); else status('You can pick up to 3 badges.');
      render();
    });
    $('#icFile').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; if (f) loadPhoto(f); e.target.value = ''; });
    $('#icPhotoClear').addEventListener('click', function () { state.photo = null; state.zoom = 1; state.ox = 0; state.oy = 0; render(); });
    $('#icZoom').addEventListener('input', function (e) { state.zoom = +e.target.value; clampPan(); render(true); });
    $('#icSurprise').addEventListener('click', surprise);
    $('#icReset').addEventListener('click', function () { var p = state.photo; state = fresh(); state.photo = p; render(); status('Back to the starting design.'); });
    $('#icSave').addEventListener('click', function () { status(save() ? 'Saved on this device. You can come back and change it any time.' : 'Could not save on this browser, but your card is ready.'); });
    $('.ic-close', root).addEventListener('click', close);
    root.addEventListener('mousedown', function (e) { if (e.target === root) close(); });
    document.addEventListener('keydown', function (e) { if (root.hidden) return; if (e.key === 'Escape') close(); else if (e.key === 'Tab') trap(e); });

    // photo drag + card tilt
    card.addEventListener('pointerdown', function (e) { var ph = e.target.closest('.ic-photo'); if (!ph || !state.photo) return; drag = { x: e.clientX, y: e.clientY, ox: state.ox, oy: state.oy, w: ph.getBoundingClientRect().width }; ph.setPointerCapture(e.pointerId); e.preventDefault(); });
    card.addEventListener('pointermove', function (e) {
      if (drag) { state.ox = drag.ox + ((e.clientX - drag.x) / drag.w) * 100; state.oy = drag.oy + ((e.clientY - drag.y) / drag.w) * 100; clampPan(); applyPhoto(); return; }
      if (reduce()) return; var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((0.5 - py) * 12).toFixed(2) + 'deg'); card.style.setProperty('--ry', ((px - 0.5) * 14).toFixed(2) + 'deg'); card.style.setProperty('--sx', (px * 100).toFixed(1) + '%'); card.style.setProperty('--sy', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerup', function () { drag = null; });
    card.addEventListener('pointerleave', function () { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  }

  function clampPan() { var m = (state.zoom - 1) * 50; state.ox = Math.max(-m, Math.min(m, state.ox)); state.oy = Math.max(-m, Math.min(m, state.oy)); }
  function status(t) { var s = $('#icStatus'); if (s) s.textContent = t || ''; }
  function loadPhoto(file) {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) { status('Please choose a PNG, JPG or WebP image.'); return; }
    if (file.size > 8e6) { status('That image is over 8 MB. Please choose a smaller one.'); return; }
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = Math.min(1, 720 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      state.photo = c.toDataURL('image/jpeg', 0.86); state.zoom = 1; state.ox = 0; state.oy = 0; URL.revokeObjectURL(url); status('Photo added. Drag it on the card to line it up.'); render();
    };
    img.onerror = function () { URL.revokeObjectURL(url); status('That file could not be read as an image.'); };
    img.src = url;
  }
  function surprise() {
    var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    state.theme = Math.floor(Math.random() * THEMES.length); state.style = pick(STYLES)[0]; state.shape = pick(SHAPES)[0]; state.finish = pick(FINISHES)[0]; state.title = pick(TITLES);
    var ks = Object.keys(ICONS).sort(function () { return Math.random() - 0.5; }); state.badges = ks.slice(0, 1 + Math.floor(Math.random() * 3)); render(); status('A fresh look. Not feeling it? Hit Surprise me again.');
  }

  function themeColor() { var t = THEMES[state.theme]; return t[1] || ENABLED[ctx.committee].accent; }
  function applyPhoto() {
    var im = $('.ic-photo img', card); if (im) im.style.transform = 'translate(' + state.ox.toFixed(2) + '%,' + state.oy.toFixed(2) + '%) scale(' + state.zoom + ')';
  }
  function barcode(seed) {
    var h = hash(seed), x = 0, out = '';
    for (var i = 0; i < 30; i++) { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; var w = 1 + (h % 3), on = (h >> 5) & 1; if (on) out += '<rect x="' + x + '" y="0" width="' + w + '" height="26"/>'; x += w + 1; }
    return '<svg viewBox="0 0 ' + x + ' 26" preserveAspectRatio="none" aria-hidden="true">' + out + '</svg>';
  }
  function render(light) {
    var c = themeColor(), meta = ENABLED[ctx.committee], id = 'MUN26-' + ctx.committee + '-' + hash(ctx.email + ctx.committee).toString(16).slice(0, 4).toUpperCase();
    card.dataset.style = state.style; card.dataset.finish = state.finish; card.dataset.shape = state.shape;
    card.style.setProperty('--t', c); card.style.setProperty('--t2', shade(c, -0.55)); card.style.setProperty('--t3', shade(c, 0.35));
    var initials = ctx.name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    var photo = state.photo ? '<img src="' + state.photo + '" alt="Your photo" draggable="false">' : '<span class="ic-initials">' + esc(initials) + '</span>';
    var badges = state.badges.map(function (k) { return '<span class="ic-badge" title="' + BADGE_LABEL[k] + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg></span>'; }).join('');
    if (!light || !card.firstChild) {
      card.innerHTML =
        '<div class="ic-slot"></div><div class="ic-sheen"></div><div class="ic-pattern"></div>' +
        '<header class="ic-head"><span class="ic-brand">MASTERS&rsquo; UNION NATIONS</span><span class="ic-year">2026</span></header>' +
        '<div class="ic-photo" aria-label="Photo">' + photo + '</div>' +
        '<div class="ic-badges">' + badges + '</div>' +
        '<p class="ic-role">' + esc(state.title).toUpperCase() + '</p>' +
        '<h3 class="ic-name">' + esc(ctx.name) + '</h3>' +
        '<p class="ic-committee"><i></i>' + esc(meta.name) + '</p>' +
        '<dl class="ic-info"><div><dt>SCHOOL / UNIVERSITY</dt><dd>' + esc(ctx.institution) + '</dd></div><div><dt>EMAIL</dt><dd>' + esc(ctx.email) + '</dd></div></dl>' +
        '<footer class="ic-foot"><div><b>' + esc(id) + '</b><span>28&ndash;29 NOV 2026 &middot; GURUGRAM</span></div><div class="ic-bars">' + barcode(id) + '</div></footer>';
    }
    applyPhoto();
    $('#icThemes').querySelectorAll('.ic-sw').forEach(function (b) { var t = THEMES[+b.dataset.i], col = t[1] || ENABLED[ctx.committee].accent; b.style.background = col; b.setAttribute('aria-checked', String(+b.dataset.i === state.theme)); });
    [['#icShapes', 'shape'], ['#icStyles', 'style'], ['#icFinishes', 'finish'], ['#icTitles', 'title']].forEach(function (p) { $(p[0]).querySelectorAll('.ic-chip').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.v === state[p[1]])); }); });
    $('#icBadges').querySelectorAll('.ic-chip').forEach(function (b) { b.setAttribute('aria-pressed', String(state.badges.indexOf(b.dataset.v) > -1)); });
    $('#icZoom').value = state.zoom; $('#icZoom').disabled = !state.photo; $('#icPhotoClear').disabled = !state.photo;
    var done = [state.theme !== 0, state.style !== 'classic', !!state.photo, state.finish !== 'glossy' || state.shape !== 'circle', state.title !== 'Delegate', state.badges.length > 0].filter(Boolean).length;
    var level = ['Rookie', 'Rookie', 'Pro', 'Pro', 'Elite', 'Elite', 'Legend'][done];
    $('#icLevel').textContent = level; $('#icCount').textContent = done + ' / 6 customised'; $('#icBar').style.width = (done / 6 * 100) + '%';
  }

  var prevFocus = null;
  function trap(e) {
    var f = [].slice.call(root.querySelectorAll('button:not([disabled]),input:not([disabled]),[href]')).filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    if (!f.length) return; var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
  }
  function open(detail) {
    ctx = { name: detail.name, email: String(detail.email || '').toLowerCase(), institution: detail.institution, committee: detail.committee };
    if (!root) build();
    state = load(); card.innerHTML = ''; status('');
    prevFocus = document.activeElement; root.hidden = false; document.body.classList.add('ic-open');
    requestAnimationFrame(function () { root.classList.add('in'); }); render(); var c = $('.ic-close'); c && c.focus({ preventScroll: true });
  }
  function close() { if (!root || root.hidden) return; root.classList.remove('in'); document.body.classList.remove('ic-open'); setTimeout(function () { root.hidden = true; }, 250); if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true }); }

  // re-open button under the form once a registration has gone through
  function addReopen(form, detail) {
    if (form.querySelector('.ic-reopen')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ic-reopen'; b.textContent = 'Design my iCard';
    b.addEventListener('click', function () { open(detail); });
    var s = form.querySelector('.mu-form-status'); (s || form.lastElementChild).insertAdjacentElement('afterend', b);
  }
  document.addEventListener('mun:registered', function (e) {
    var d = e.detail || {}; if (!ENABLED[d.committee]) return;
    var form = e.target && e.target.closest ? e.target.closest('form') : null;
    if (form) addReopen(form, d);
    setTimeout(function () { open(d); }, reduce() ? 0 : 700);
  });
  window.MUNICard = { open: open, enabled: Object.keys(ENABLED) };
})();
