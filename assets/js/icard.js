/* Delegate iCard: after a successful registration the delegate can design their own card, Canva style.
   Enabled for IPL, STARTUP, UNHRC and CCEP only (the other committees are added later: extend ENABLED).
   Everything stays in the browser: a chosen photo is framed and shrunk locally and never uploaded. */
(function () {
  'use strict';
  var ENABLED = {
    IPL: { code: 'IPL', accent: '#f0c14b' },
    STARTUP: { code: 'STARTUP', accent: '#ff9a7a' },
    UNHRC: { code: 'UNHRC', accent: '#6fb4ee' },
    CCEP: { code: 'CCEP', accent: '#3fd6bb' },
    MCC: { code: 'MCC', accent: '#a48cff' },
    AIPPM: { code: 'AIPPM', accent: '#ff8c4b' },
    IP: { code: 'IP', accent: '#f0e9db' },
    DALAL: { code: 'DALAL', accent: '#65e778' }
  };
  var BG = [['Midnight', '#10121f'], ['Navy', '#0b1f3a'], ['Wine', '#3a0f26'], ['Forest', '#0d2a20'], ['Plum', '#2a1650'], ['Cream', '#f6efe2'], ['White', '#ffffff']];
  var ACCENT = [['Committee', null], ['Gold', '#e9b949'], ['Crimson', '#e0405a'], ['Ocean', '#3c8cf0'], ['Emerald', '#27b574'], ['Violet', '#9a6bff'], ['Sunset', '#ff7a45'], ['Pink', '#ff6fa8']];
  var INK = [['White', '#ffffff'], ['Ivory', '#f4efe6'], ['Ink', '#14121c'], ['Slate', '#2c3a52']];
  var STYLES = [['classic', 'Classic'], ['geometric', 'Geometric'], ['gradient', 'Gradient'], ['dots', 'Dots']];
  var FONTS = [['sans', 'Modern', "'Manrope',Arial,sans-serif"], ['serif', 'Elegant', "'Playfair Display','Instrument Serif',Georgia,'Times New Roman',serif"], ['mono', 'Tech', "'DM Mono',ui-monospace,monospace"]];
  var CAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l-1.5 2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-3.5L15 4zM12 17a4.2 4.2 0 110-8.4A4.2 4.2 0 0112 17z"/></svg>';

  var root, card, ctx = null, state = null, crop = null, prevFocus = null, drag = null;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var reduce = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };

  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function toHex(a) { return '#' + a.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function shade(hex, amt) { var c = rgb(hex); return toHex(c.map(function (v) { return amt < 0 ? v * (1 + amt) : v + (255 - v) * amt; })); }
  function lum(hex) { var c = rgb(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function validHex(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v); }

  function fresh() { return { bg: '#10121f', accent: null, ink: '#ffffff', style: 'classic', font: 'sans', photo: null }; }
  function storeKey() { return 'mun-icard2:' + ctx.email; }
  function load() {
    try { var v = JSON.parse(localStorage.getItem(storeKey()) || 'null'); if (v && typeof v === 'object') { var s = Object.assign(fresh(), v); if (!validHex(s.bg)) s.bg = '#10121f'; if (s.accent && !validHex(s.accent)) s.accent = null; if (!validHex(s.ink)) s.ink = '#ffffff'; return s; } } catch (e) {}
    return fresh();
  }
  function save() { try { localStorage.setItem(storeKey(), JSON.stringify(state)); return true; } catch (e) { return false; } }
  function accent() { return state.accent || ENABLED[ctx.committee].accent; }
  function status(t) { var s = $('#icStatus'); if (s) s.textContent = t || ''; }

  /* ---------- personal QR ---------- */
  function checkinUrl(token) { return location.origin + '/checkin.html#' + token; }
  function cardUrl(token) { return location.origin + '/card.html#' + token; }
  function qrSVG(text) {
    if (typeof window.qrcode !== 'function') return '';
    var q = window.qrcode(0, 'L'); q.addData(text); q.make();
    var n = q.getModuleCount(), pad = 2, size = n + pad * 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + pad) + ' ' + (r + pad) + 'h1v1h-1z';
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges" role="img" aria-label="Your personal check-in QR code"><rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }
  function showBigQR() {
    if (!ctx.token) return; var b = $('#icQrBig'); b.querySelector('.mic-qrbig-code').innerHTML = qrSVG(checkinUrl(ctx.token));
    b.querySelector('.mic-qrbig-id').textContent = ctx.id + ' · ' + ctx.name; b.hidden = false; b.querySelector('button').focus({ preventScroll: true });
  }

  /* ---------- UI ---------- */
  function swatches(id, list, key, allowNull) {
    var box = $(id);
    box.innerHTML = list.map(function (it, i) { return '<button type="button" class="mic-sw" role="radio" data-i="' + i + '" aria-label="' + it[0] + '" title="' + it[0] + '"></button>'; }).join('') +
      '<label class="mic-sw mic-custom" title="Pick any colour" aria-label="Custom colour"><input type="color" data-key="' + key + '"><span>+</span></label>';
    box.addEventListener('click', function (e) { var b = e.target.closest('button.mic-sw'); if (!b) return; state[key] = list[+b.dataset.i][1]; render(); });
    box.querySelector('input').addEventListener('input', function (e) { state[key] = e.target.value; render(true); });
  }
  function build() {
    root = document.createElement('div');
    root.className = 'mic-overlay'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'icTitle'); root.hidden = true;
    root.innerHTML =
      '<div class="mic-shell">' +
      '<header class="mic-top"><div><p class="mic-kicker">REGISTRATION RECEIVED</p><h2 id="icTitle">Design your iCard</h2></div>' +
      '<div class="mic-top-actions"><button class="mic-btn primary" id="icSave" type="button">Save</button><button class="mic-close" type="button" aria-label="Close">&times;</button></div></header>' +
      '<div class="mic-body"><div class="mic-canvas"><div class="mic-scene"><article class="mic-card" id="icCard"></article></div><p class="mic-hint">Hover the photo circle to add your photo.</p></div>' +
      '<aside class="mic-panel">' +
      '<div class="mic-tabs" role="tablist"><button type="button" role="tab" class="on" data-tab="colours" aria-selected="true">Colours</button><button type="button" role="tab" data-tab="style" aria-selected="false">Style</button></div>' +
      '<section data-pane="colours"><h3>Background</h3><div class="mic-swatches" id="icBg" role="radiogroup" aria-label="Background colour"></div>' +
      '<h3>Accent</h3><div class="mic-swatches" id="icAcc" role="radiogroup" aria-label="Accent colour"></div>' +
      '<h3>Text</h3><div class="mic-swatches" id="icInk" role="radiogroup" aria-label="Text colour"></div></section>' +
      '<section data-pane="style" hidden><h3>Background style</h3><div class="mic-styles" id="icStyles" role="radiogroup" aria-label="Background style"></div>' +
      '<h3>Font</h3><div class="mic-fonts" id="icFonts" role="radiogroup" aria-label="Font"></div></section>' +
      '<div class="mic-linkbox" id="icLink" hidden><p>Your personal QR code is on the card. On the day, open your card on your phone and show the QR at the registration desk. <b>Keep it to yourself.</b></p><button class="mic-btn" id="icCopy" type="button">Copy my card link</button></div>' +
      '<div class="mic-actions"><button class="mic-btn ghost" id="icSurprise" type="button">Surprise me</button><button class="mic-btn ghost" id="icReset" type="button">Reset</button></div>' +
      '<p class="mic-status" id="icStatus" role="status" aria-live="polite"></p></aside></div>' +
      '<div class="mic-qrbig" id="icQrBig" hidden role="dialog" aria-modal="true" aria-label="Your check-in QR code"><div class="mic-qrbig-box"><div class="mic-qrbig-code"></div><p class="mic-qrbig-id"></p><p class="mic-qrbig-tip">Turn your screen brightness up and show this at the registration desk.</p><button type="button" class="mic-btn primary">Done</button></div></div>' +
      '<input id="icFile" type="file" accept="image/png,image/jpeg,image/webp" hidden>' +
      '<div class="mic-crop" id="icCrop" hidden role="dialog" aria-modal="true" aria-label="Frame your photo"><div class="mic-crop-box"><h3>Frame your photo</h3><p>Drag to move, use the slider to zoom.</p>' +
      '<div class="mic-crop-view" id="icCropView"><canvas id="icCropCv" width="280" height="280"></canvas><i class="mic-crop-ring"></i></div>' +
      '<label class="mic-range">Zoom <input id="icZoom" type="range" min="1" max="3" step="0.02" value="1"></label>' +
      '<div class="mic-row"><button type="button" class="mic-btn ghost" id="icCropCancel">Cancel</button><button type="button" class="mic-btn primary" id="icCropApply">Use photo</button></div></div></div>' +
      '</div>';
    document.body.appendChild(root);
    card = $('#icCard');

    swatches('#icBg', BG, 'bg'); swatches('#icAcc', ACCENT, 'accent'); swatches('#icInk', INK, 'ink');
    $('#icStyles').innerHTML = STYLES.map(function (s) { return '<button type="button" class="mic-style" role="radio" data-v="' + s[0] + '"><i class="mic-mini mic-mini-' + s[0] + '"></i><span>' + s[1] + '</span></button>'; }).join('');
    $('#icStyles').addEventListener('click', function (e) { var b = e.target.closest('.mic-style'); if (b) { state.style = b.dataset.v; render(); } });
    $('#icFonts').innerHTML = FONTS.map(function (f) { return '<button type="button" class="mic-font" role="radio" data-v="' + f[0] + '" style="font-family:' + f[2] + '"><b>Aa</b><span>' + f[1] + '</span></button>'; }).join('');
    $('#icFonts').addEventListener('click', function (e) { var b = e.target.closest('.mic-font'); if (b) { state.font = b.dataset.v; render(); } });
    root.querySelector('.mic-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]'); if (!b) return;
      root.querySelectorAll('.mic-tabs button').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', String(on)); });
      root.querySelectorAll('[data-pane]').forEach(function (p) { p.hidden = p.dataset.pane !== b.dataset.tab; });
    });
    $('#icQrBig').addEventListener('click', function () { $('#icQrBig').hidden = true; });
    $('#icCopy').addEventListener('click', function () {
      var link = ctx.token ? cardUrl(ctx.token) : ''; if (!link) return;
      var done = function () { status('Link copied. Keep it safe: it opens your card and QR.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, function () { window.prompt('Copy your card link:', link); });
      else window.prompt('Copy your card link:', link);
    });
    card.addEventListener('click', function (e) { if (e.target.closest('.mic-qr[data-token]')) showBigQR(); });
    $('#icSurprise').addEventListener('click', surprise);
    $('#icReset').addEventListener('click', function () { var p = state.photo; state = fresh(); state.photo = p; render(); status('Back to the starting design.'); });
    $('#icSave').addEventListener('click', function () { status(save() ? 'Saved on this device. You can come back and change it any time.' : 'Could not save in this browser, but your card is ready.'); });
    $('.mic-close', root).addEventListener('click', close);
    root.addEventListener('mousedown', function (e) { if (e.target === root) close(); });
    document.addEventListener('keydown', function (e) { if (root.hidden) return; if (e.key === 'Escape') { if (!$('#icQrBig').hidden) $('#icQrBig').hidden = true; else if (!$('#icCrop').hidden) closeCrop(); else close(); } else if (e.key === 'Tab') trap(e); });

    // photo: upload button on the card, then a framing panel
    card.addEventListener('click', function (e) { if (e.target.closest('.mic-upload')) $('#icFile').click(); });
    $('#icFile').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; if (f) openCrop(f); e.target.value = ''; });
    var view = $('#icCropView');
    view.addEventListener('pointerdown', function (e) { if (!crop) return; drag = { x: e.clientX, y: e.clientY, ox: crop.ox, oy: crop.oy }; view.setPointerCapture(e.pointerId); view.classList.add('drag'); });
    view.addEventListener('pointermove', function (e) { if (!drag) return; crop.ox = drag.ox + (e.clientX - drag.x); crop.oy = drag.oy + (e.clientY - drag.y); drawCrop(); });
    view.addEventListener('pointerup', function () { drag = null; view.classList.remove('drag'); });
    view.addEventListener('wheel', function (e) { if (!crop) return; e.preventDefault(); setZoom(crop.zoom * (e.deltaY < 0 ? 1.06 : 0.94)); }, { passive: false });
    $('#icZoom').addEventListener('input', function (e) { setZoom(+e.target.value); });
    $('#icCropCancel').addEventListener('click', closeCrop);
    $('#icCropApply').addEventListener('click', applyCrop);

    // card tilt
    card.addEventListener('pointermove', function (e) {
      if (reduce()) return; var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg'); card.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', function () { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  }

  /* ---------- photo framing ---------- */
  var VIEW = 280;
  function openCrop(file) {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) { status('Please choose a PNG, JPG or WebP image.'); return; }
    if (file.size > 8e6) { status('That image is over 8 MB. Please choose a smaller one.'); return; }
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = Math.min(1, 1000 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      crop = { src: c, zoom: 1, ox: 0, oy: 0, base: VIEW / Math.min(c.width, c.height) };
      $('#icZoom').value = 1; $('#icCrop').hidden = false; drawCrop(); $('#icZoom').focus({ preventScroll: true });
    };
    img.onerror = function () { URL.revokeObjectURL(url); status('That file could not be read as an image.'); };
    img.src = url;
  }
  function clampCrop() { var sc = crop.base * crop.zoom, mx = Math.max(0, (crop.src.width * sc - VIEW) / 2), my = Math.max(0, (crop.src.height * sc - VIEW) / 2); crop.ox = Math.max(-mx, Math.min(mx, crop.ox)); crop.oy = Math.max(-my, Math.min(my, crop.oy)); }
  function setZoom(z) { crop.zoom = Math.max(1, Math.min(3, z)); $('#icZoom').value = crop.zoom; drawCrop(); }
  function paint(cv, size) {
    var g = cv.getContext('2d'), k = size / VIEW, sc = crop.base * crop.zoom * k, w = crop.src.width * sc, h = crop.src.height * sc;
    g.clearRect(0, 0, size, size); g.drawImage(crop.src, size / 2 + crop.ox * k - w / 2, size / 2 + crop.oy * k - h / 2, w, h);
  }
  function drawCrop() { clampCrop(); paint($('#icCropCv'), VIEW); }
  function applyCrop() {
    var out = document.createElement('canvas'); out.width = out.height = 480; paint(out, 480);
    state.photo = out.toDataURL('image/jpeg', 0.88); closeCrop(); render(); status('Photo added. Hover the circle again to change it.');
  }
  function closeCrop() { crop = null; drag = null; $('#icCrop').hidden = true; var u = card && card.querySelector('.mic-upload'); u && u.focus({ preventScroll: true }); }

  function surprise() {
    var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    var bg = pick(BG)[1], light = lum(bg) > 0.5;
    state.bg = bg; state.accent = pick(ACCENT)[1]; state.ink = light ? '#14121c' : '#ffffff'; state.style = pick(STYLES)[0]; state.font = pick(FONTS)[0];
    render(); status('A fresh look. Not feeling it? Hit Surprise me again.');
  }

  /* ---------- the card ---------- */
  function trap(e) {
    var f = [].slice.call(root.querySelectorAll('button:not([disabled]),input:not([disabled]):not([hidden]),[href]')).filter(function (n) { return n.offsetParent !== null; });
    if (!f.length) return; var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
  }
  function render(light) {
    var acc = accent(), meta = ENABLED[ctx.committee], id = ctx.id || ('MUN26-' + ctx.committee + '-' + hash(ctx.email + ctx.committee).toString(16).slice(0, 4).toUpperCase());
    var qr = ctx.token ? qrSVG(checkinUrl(ctx.token)) : '';
    var font = FONTS.filter(function (f) { return f[0] === state.font; })[0][2];
    card.dataset.style = state.style;
    card.style.setProperty('--bg', state.bg); card.style.setProperty('--bg2', shade(state.bg, lum(state.bg) > 0.5 ? -0.12 : -0.45)); card.style.setProperty('--acc', acc);
    card.style.setProperty('--ink', state.ink); card.style.setProperty('--soft', toHex(rgb(state.ink).map(function (v, i) { return v * 0.72 + rgb(state.bg)[i] * 0.28; })));
    card.style.setProperty('--font', font); card.style.setProperty('--accink', lum(acc) > 0.45 ? '#14121c' : '#ffffff');
    var initials = ctx.name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    if (!light || !card.firstChild) {
      card.innerHTML =
        '<div class="mic-slot"></div><div class="mic-pattern"></div><div class="mic-sheen"></div>' +
        '<header class="mic-head"><span class="mic-brand">MASTERS&rsquo; UNION NATIONS</span><span class="mic-year">2026</span></header>' +
        '<div class="mic-photo">' + (state.photo ? '<img src="' + state.photo + '" alt="Your photo" draggable="false">' : '<span class="mic-initials">' + esc(initials) + '</span>') +
        '<button type="button" class="mic-upload" aria-label="' + (state.photo ? 'Change photo' : 'Upload photo') + '">' + CAM + '<span>' + (state.photo ? 'Change photo' : 'Upload photo') + '</span></button></div>' +
        '<p class="mic-role">DELEGATE</p><h3 class="mic-name">' + esc(ctx.name) + '</h3>' +
        '<p class="mic-committee"><i></i>' + esc(meta.code) + '</p>' +
        '<dl class="mic-info"><div><dt>SCHOOL / UNIVERSITY</dt><dd>' + esc(ctx.institution) + '</dd></div><div><dt>EMAIL</dt><dd>' + esc(ctx.email) + '</dd></div></dl>' +
        '<div class="mic-foot"><div class="mic-idbox"><b>' + esc(id) + '</b><span>28&ndash;29 NOV 2026</span><span>GURUGRAM</span></div>' + (qr ? '<button type="button" class="mic-qr live" data-token="1" aria-label="Show my check-in QR code bigger">' + qr + '</button>' : '<div class="mic-qr" role="img" aria-label="QR code appears once registration is confirmed"><span>QR</span></div>') + '</div>';
    }
    // panel state
    $('#icLink').hidden = !ctx.token;
    var mark = function (id, list, key, cur) {
      var box = $(id); box.querySelectorAll('button.mic-sw').forEach(function (b, i) { var v = list[i][1] || ENABLED[ctx.committee].accent; b.style.background = v; b.setAttribute('aria-checked', String(list[i][1] === cur || (list[i][1] == null && cur == null))); });
      var inp = box.querySelector('input'); var shown = cur || ENABLED[ctx.committee].accent; if (inp.value !== shown) inp.value = shown; box.querySelector('.mic-custom').style.background = 'conic-gradient(#ff5e5e,#ffd24a,#4be37b,#38d0ff,#8a6bff,#ff5ec4,#ff5e5e)';
    };
    mark('#icBg', BG, 'bg', state.bg); mark('#icAcc', ACCENT, 'accent', state.accent); mark('#icInk', INK, 'ink', state.ink);
    $('#icStyles').querySelectorAll('.mic-style').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.v === state.style)); });
    $('#icFonts').querySelectorAll('.mic-font').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.v === state.font)); });
    if (contrast(state.bg, state.ink) < 3) status('Tip: your text and background are close in colour, so the card may be hard to read.');
    else if ($('#icStatus').textContent.indexOf('Tip:') === 0) status('');
  }

  function open(detail) {
    ctx = { name: detail.name, email: String(detail.email || '').toLowerCase(), institution: detail.institution, committee: detail.committee, id: detail.id || '', token: /^[a-f0-9]{32}$/.test(detail.token || '') ? detail.token : '' };
    if (!ctx.token) { try { var sv = JSON.parse(localStorage.getItem('mun-delegate:' + ctx.email) || 'null'); if (sv && /^[a-f0-9]{32}$/.test(sv.token)) { ctx.token = sv.token; ctx.id = sv.id; } } catch (e) {} }
    else { try { localStorage.setItem('mun-delegate:' + ctx.email, JSON.stringify({ id: ctx.id, token: ctx.token })); } catch (e) {} }
    if (!root) build();
    state = load(); card.innerHTML = ''; status(''); $('#icCrop').hidden = true; crop = null;
    prevFocus = document.activeElement; root.hidden = false; document.body.classList.add('mic-open');
    setTimeout(function () { root.classList.add('in'); }, 20); render(); var c = $('.mic-close'); c && c.focus({ preventScroll: true });
  }
  function close() { if (!root || root.hidden) return; root.classList.remove('in'); document.body.classList.remove('mic-open'); setTimeout(function () { root.hidden = true; }, 250); if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true }); }

  function addReopen(form, detail) {
    if (form.querySelector('.mic-reopen')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'mic-reopen'; b.textContent = 'Design my iCard';
    b.addEventListener('click', function () { open(detail); });
    var s = form.querySelector('.mu-form-status'); (s || form.lastElementChild).insertAdjacentElement('afterend', b);
  }
  document.addEventListener('mun:registered', function (e) {
    var d = Object.assign({}, e.detail || {}); if (!ENABLED[d.committee]) return;
    if (d.delegate) { d.id = d.delegate.id; d.token = d.delegate.token; }
    var form = e.target && e.target.closest ? e.target.closest('form') : null;
    if (form) addReopen(form, d);
    setTimeout(function () { open(d); }, reduce() ? 0 : 700);
  });
  window.MUNICard = { open: open, enabled: Object.keys(ENABLED), qrSVG: qrSVG, checkinUrl: checkinUrl, cardUrl: cardUrl };
})();
