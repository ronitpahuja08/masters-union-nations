/* ZERO: The World Reset — ambient life for the world map hub.
   City lights shimmer on one small canvas, the camera drifts with the pointer (spring-smoothed),
   and everything stops when the map is not on screen. boardroom.js owns layout, focus and selection;
   it tells this file about geometry ('mun-map-geom') and focus ('mun-map-focus'). */
(() => {
  'use strict';
  const board = document.getElementById('boardroom');
  const stage = document.getElementById('mapStage');
  const canvas = document.getElementById('mapLights');
  const drift = document.getElementById('mapDrift');
  if (!board || !stage || !canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const lite = !!window.MUNPerformance?.lite;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const FRAME_MS = 1000 / 30;
  const MAX_LIGHTS = 520;

  let geom = null, lights = [], focus = null, dpr = 1;
  let onScreen = false, live = false, raf = 0, lastDraw = 0;
  const sprite = makeSprite('255,196,120');
  let focusSprite = null;

  // Drift spring state (px)
  const spring = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };

  function makeSprite(rgb) {
    const s = document.createElement('canvas');
    s.width = s.height = 32;
    const g = s.getContext('2d'), grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(.25, `rgba(${rgb},.55)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    return s;
  }
  const hexToRgb = hex => {
    const h = String(hex).replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  };

  // Sample the atlas once, off the hot path, to find the painted city lights.
  const atlas = new Image();
  atlas.decoding = 'async';
  atlas.src = 'assets/images/world-atlas-india-focus.webp';
  async function sampleLights() {
    if (!atlas.naturalWidth) return;
    const w = 420, h = Math.round(w * atlas.naturalHeight / atlas.naturalWidth);
    // Decode and shrink off the main thread; drawing the full atlas here cost ~180 ms on slower CPUs.
    let src = atlas;
    // From the file's bytes, not the <img>: only a Blob source decodes and resizes off-thread.
    try { src = await createImageBitmap(await (await fetch(atlas.src)).blob(), { resizeWidth: w, resizeHeight: h, resizeQuality: 'low' }); } catch (e) {}
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(src, 0, 0, w, h);
    if (src.close) src.close();
    let data;
    try { data = x.getImageData(0, 0, w, h).data; } catch (e) { return; }
    const found = [];
    // Scan a few rows at a time inside idle slices so the scan never holds a frame.
    for (let y = 0; y < h;) {
      const deadline = await new Promise(r => idle(r));
      do {
        for (let i = 0; i < w; i++) {
          const k = (y * w + i) * 4, r = data[k], g = data[k + 1], b = data[k + 2];
          const lum = r * .55 + g * .35 + b * .1;
          if (lum > 125 && r - b > 70 && r >= g) found.push([(i + .5) / w, (y + .5) / h, lum]);
        }
        y++;
      } while (y < h && (!deadline || !deadline.timeRemaining || deadline.timeRemaining() > 2));
    }
    // Shuffle, keep the brightest-ish subset.
    for (let i = found.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [found[i], found[j]] = [found[j], found[i]]; }
    lights = found.slice(0, MAX_LIGHTS).map(([u, v, lum]) => ({
      u, v,
      size: 5 + (lum - 125) / 130 * 9,
      base: .18 + Math.random() * .34,
      speed: .5 + Math.random() * 1.9,
      phase: Math.random() * Math.PI * 2
    }));
    drawFrame(performance.now());
  }
  const idle = fn => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 400));
  // Not at load (that lands on the hero's gavel strike): wait until the visitor reaches the
  // timed theme card or jumps to the map, both moments where a short task can't be seen.
  let sampleQueued = false;
  function queueSample() {
    if (sampleQueued) return;
    sampleQueued = true;
    if (atlas.complete) idle(sampleLights); else atlas.addEventListener('load', () => idle(sampleLights), { once: true });
  }
  window.addEventListener('journey', e => { if (e.detail > .15) queueSample(); });
  if (document.body.classList.contains('at-map')) queueSample();

  function resize() {
    if (!geom) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(geom.width * dpr));
    canvas.height = Math.max(1, Math.round(geom.height * dpr));
    canvas.style.width = geom.width + 'px';
    canvas.style.height = geom.height + 'px';
    drawFrame(performance.now());
  }

  function drawFrame(now) {
    if (!geom || !lights.length) return;
    const t = now / 1000, W = canvas.width, H = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const still = reduce.matches;
    const fx = focus ? (focus.x / 100) * W : 0, fy = focus ? (focus.y / 100) * H : 0;
    const radius = 110 * dpr, r2 = radius * radius;
    for (let i = 0; i < lights.length; i++) {
      const L = lights[i];
      const px = (geom.offsetX + L.u * geom.imageWidth) * dpr;
      const py = (geom.offsetY + L.v * geom.imageHeight) * dpr;
      if (px < -20 || py < -20 || px > W + 20 || py > H + 20) continue;
      const flicker = still ? .75 : .5 + .5 * Math.sin(t * L.speed + L.phase);
      let alpha = L.base * (.35 + .65 * flicker), img = sprite, size = L.size * dpr;
      if (focus) {
        const dx = px - fx, dy = py - fy, d2 = dx * dx + dy * dy;
        if (d2 < r2) { img = focusSprite || sprite; alpha = Math.min(1, alpha * 2.4 * (1 - d2 / r2) + .15); size *= 1.35; }
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, px - size / 2, py - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function stepDrift() {
    if (!drift) return false;
    const k = .045, damp = .82;
    spring.vx = (spring.vx + (spring.tx - spring.x) * k) * damp;
    spring.vy = (spring.vy + (spring.ty - spring.y) * k) * damp;
    spring.x += spring.vx; spring.y += spring.vy;
    const moving = Math.abs(spring.vx) + Math.abs(spring.vy) > .01 || Math.abs(spring.tx - spring.x) + Math.abs(spring.ty - spring.y) > .05;
    drift.style.transform = `translate3d(${spring.x.toFixed(2)}px,${spring.y.toFixed(2)}px,0)`;
    return moving;
  }

  function loop(now) {
    raf = 0;
    if (!live) return;
    if (now - lastDraw >= FRAME_MS) { lastDraw = now; drawFrame(now); }
    stepDrift();
    raf = requestAnimationFrame(loop);
  }

  function updateLive() {
    const b = document.body.classList;
    const next = b.contains('at-map') && !b.contains('overlay') && !document.hidden && onScreen;
    if (next === live) return;
    live = next;
    board.classList.toggle('map-live', live);
    window.dispatchEvent(new CustomEvent('mun-map-live', { detail: { live } }));
    if (live && !reduce.matches && !lite) { if (!raf) raf = requestAnimationFrame(loop); }
    else { cancelAnimationFrame(raf); raf = 0; if (live) drawFrame(performance.now()); }
  }

  new IntersectionObserver(entries => {
    entries.forEach(e => { onScreen = e.isIntersecting; });
    updateLive();
  }, { threshold: .05 }).observe(board);
  new MutationObserver(updateLive).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', updateLive);
  reduce.addEventListener?.('change', () => { spring.tx = spring.ty = 0; if (drift) drift.style.transform = ''; live = !live; updateLive(); });

  // Pointer drift: desktop fine pointers only, small and spring-smoothed, never 1:1.
  const RANGE = 11;
  board.addEventListener('pointermove', e => {
    if (!finePointer.matches || reduce.matches || e.pointerType !== 'mouse') return;
    spring.tx = -((e.clientX / innerWidth) - .5) * 2 * RANGE;
    spring.ty = -((e.clientY / innerHeight) - .5) * 2 * RANGE * .6;
  }, { passive: true });
  board.addEventListener('pointerleave', () => { spring.tx = 0; spring.ty = 0; }, { passive: true });

  window.addEventListener('mun-map-geom', e => { geom = e.detail; resize(); });
  window.addEventListener('mun-map-focus', e => {
    focus = e.detail;
    focusSprite = focus ? makeSprite(hexToRgb(focus.color)) : null;
    if (!raf) drawFrame(performance.now());
  });
})();
