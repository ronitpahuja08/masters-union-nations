const root = document.querySelector('#dalalCrash');
const canvas = document.querySelector('#dalalCrashCanvas');
const video = document.querySelector('#dcMarketVideo');

if (root && canvas) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d', { alpha: true });
  // Keep the market sequence long enough for its tagline to land before
  // committee-sequence.js reveals the DALAL STREET name card.
  const duration = 3500;
  const glyphs = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  let active = false, frame = 0, started = 0, complete = null, soundTimer = 0, dpr = 1, w = 1, h = 1;
  for (let i = 0; i < 58; i++) glyphs.push({ x: rand(-1, 1), y: rand(-1, 1), z: rand(.12, 1), n: String(Math.floor(rand(0, 10000))).padStart(4, '0'), speed: rand(.35, 1.5) });
  function resize() { dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.2 : 1.6); w = root.clientWidth || innerWidth; h = root.clientHeight || innerHeight; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.width = `${w}px`; canvas.style.height = `${h}px`; ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', resize, { passive: true }); resize();
  function impact() {
    if (!window.__munSoundEnabled) return;
    try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const ac = impact.ac || (impact.ac = new AC()); if (ac.state === 'suspended') ac.resume(); const t = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(); o.type = 'sine'; o.frequency.setValueAtTime(105, t); o.frequency.exponentialRampToValueAtTime(38, t + .92); f.type = 'lowpass'; f.frequency.value = 155; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.28, t + .018); g.gain.exponentialRampToValueAtTime(.0001, t + 1.05); o.connect(f).connect(g).connect(ac.destination); o.start(t); o.stop(t + 1.08);
      const noise = ac.createBufferSource(), buffer = ac.createBuffer(1, ac.sampleRate * .52, ac.sampleRate), data = buffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length); noise.buffer = buffer; const ng = ac.createGain(), nf = ac.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 360; ng.gain.setValueAtTime(.18, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .5); noise.connect(nf).connect(ng).connect(ac.destination); noise.start(t); noise.stop(t + .52);
    } catch { /* Audio remains optional. */ }
  }
  function draw(now) {
    if (!active || !ctx) return;
    const elapsed = now - started, digital = elapsed >= 850, crash = elapsed >= 1750, title = elapsed >= 2500, travel = Math.max(0, (elapsed - 1750) / 1000);
    root.classList.toggle('market-awake', elapsed > 0);
    root.classList.toggle('market-digital', digital);
    root.classList.toggle('market-falling', crash);
    root.classList.toggle('title-assembling', title);
    root.classList.toggle('title-expanding', elapsed >= 3300);
    ctx.clearRect(0, 0, w, h);
    const cx = w * .5, cy = h * .52, maxR = Math.max(w, h) * .82;
    if (crash) {
      // A perspective number tunnel replaces the former static quote cards and toy bull.
      for (const g of glyphs) {
        g.z -= .016 * g.speed + Math.min(.075, travel * .013);
        if (g.z <= .035) { g.z = 1; g.x = rand(-1, 1); g.y = rand(-1, 1); g.n = String(Math.floor(rand(0, 10000))).padStart(4, '0'); }
        const scale = 1 / g.z, x = cx + g.x * w * .55 * scale, y = cy + g.y * h * .52 * scale;
        const alpha = Math.min(.8, (1 - g.z) * .88);
        ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = g.z < .28 ? '#ff745a' : '#d9b36a'; ctx.font = `600 ${Math.min(30, 9 + scale * 1.6)}px ui-monospace,monospace`; ctx.fillText(g.n, x, y); ctx.restore();
      }
      // Thin converging chart traces carry the red market reversal without filling the frame.
      ctx.save(); ctx.globalAlpha = Math.min(.5, travel * .24); ctx.strokeStyle = '#ff4b43'; ctx.lineWidth = 1;
      for (let line = 0; line < 7; line++) { ctx.beginPath(); ctx.moveTo(cx + (line - 3) * 3, cy); const edge = (line - 3) * w * .15; ctx.lineTo(cx + edge, h * (.17 + line % 2 * .66)); ctx.stroke(); }
      const fall = Math.min(1, travel * 1.12); ctx.globalAlpha = Math.min(.9, travel * .85); ctx.lineWidth = Math.max(3, w * .004); ctx.beginPath(); ctx.moveTo(w * .14, h * .3); ctx.lineTo(w * .34, h * (.22 + fall * .3)); ctx.lineTo(w * .51, h * (.28 + fall * .36)); ctx.lineTo(w * .74, h * (.2 + fall * .5)); ctx.lineTo(w * .9, h * (.29 + fall * .44)); ctx.stroke();
      // A short cascade of bearish candles punctuates the break before the gold title resolves.
      ctx.globalAlpha = Math.min(.92, travel * .92); ctx.lineWidth = Math.max(1.4, w * .0017); const candleCount = Math.min(22, Math.ceil(w / 44));
      for (let i = 0; i < candleCount; i++) { const x = w * .12 + i * (w * .76 / Math.max(1, candleCount - 1)), drop = Math.min(h * .52, travel * h * (.18 + (i % 5) * .035)), top = h * (.2 + (i % 4) * .055) + drop, body = Math.max(8, h * (.025 + (i % 3) * .012)); ctx.strokeStyle = '#ff5d51'; ctx.fillStyle = i % 3 ? '#9f2827' : '#ed4b40'; ctx.beginPath(); ctx.moveTo(x, top - body * .62); ctx.lineTo(x, top + body * 1.2); ctx.stroke(); ctx.fillRect(x - Math.max(2.5, w * .003), top, Math.max(5, w * .006), body); }
      ctx.restore();
      if (elapsed > 1720 && elapsed < 1920) { ctx.fillStyle = `rgba(255,241,220,${(1 - Math.abs(elapsed - 1820) / 100) * .58})`; ctx.fillRect(0, 0, w, h); }
    } else {
      ctx.save(); ctx.globalAlpha = .12; ctx.strokeStyle = '#88e9ad'; ctx.lineWidth = 1; for (let i = 0; i < 12; i++) { const y = h * (.3 + i * .045) + Math.sin(now / 170 + i) * 5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); } ctx.restore();
    }
    if (elapsed < duration) frame = requestAnimationFrame(draw);
    else { active = false; complete?.(); complete = null; }
  }
  function stop() { active = false; cancelAnimationFrame(frame); clearTimeout(soundTimer); video?.pause(); video?.classList.remove('is-playing'); root.classList.remove('market-awake', 'market-digital', 'market-falling', 'title-assembling', 'title-expanding', 'reduced-motion'); complete = null; }
  window.MUNMarketCrash = {
    play({ onComplete, soundEnabled = false } = {}) {
      if (active) return; stop(); active = true; complete = onComplete || null; started = performance.now(); window.__munSoundEnabled = !!soundEnabled;
      root.classList.add('active'); root.classList.remove('reduced-motion');
      if (video) { video.currentTime = 0; video.playbackRate = 1; video.classList.add('is-playing'); video.play().catch(error => console.warn('Dalal market footage unavailable; the trading-floor scene will continue without it.', error)); }
      const ticker = document.querySelector('#dcIndex');
      if (ticker) ticker.innerHTML = 'MU INDEX&nbsp; 18,642.45&nbsp; <em>▲ 0.42%</em>';
      if (reduced.matches) { root.classList.add('reduced-motion', 'market-awake', 'title-assembling'); setTimeout(() => { if (active) { active = false; complete?.(); complete = null; } }, 260); return; }
      soundTimer = setTimeout(impact, 1750); frame = requestAnimationFrame(draw);
      const update = () => { if (!active) return; const e = performance.now() - started; if (ticker) { const crash = e >= 1750; const value = crash ? 18040.22 - Math.max(0, e - 1750) * .16 : 18642.45 + Math.sin(e / 260) * 12; ticker.innerHTML = `MU INDEX&nbsp; ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}&nbsp; <em>${crash ? '▼ 3.82%' : '▲ 0.42%'}</em>`; } if (active) setTimeout(update, 650); };
      update();
    },
    stop
  };
}
