const root = document.querySelector('#startupLaunch');
const bridge = document.querySelector('#slBridgeVideo');
const boardroom = document.querySelector('#slBoardroomVideo');
const canvas = document.querySelector('#slParticles');
if (root && bridge && boardroom && canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 3500;
  let active = false, frame = 0, started = 0, complete = null, w = 1, h = 1, dpr = 1;
  const dust = Array.from({ length: innerWidth < 700 ? 45 : 84 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), s: Math.random() * 1.7 + .3 }));
  function resize() { dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.2 : 1.5); w = root.clientWidth || innerWidth; h = root.clientHeight || innerHeight; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', () => { if (active) resize(); }, { passive: true });
  function playMedia(video) { video.currentTime = 0; video.playbackRate = 1; video.play().catch(() => {}); }
  function render(now) {
    if (!active) return;
    const elapsed = now - started, t = elapsed / 1000;
    root.classList.toggle('city-awake', elapsed > 0);
    root.classList.toggle('boardroom-phase', elapsed >= 1080);
    root.classList.toggle('valuation-phase', elapsed >= 1350 && elapsed < 2740);
    root.classList.toggle('boardroom-flash', elapsed >= 2490 && elapsed < 2630);
    root.classList.toggle('title-reveal', elapsed >= 2580);
    root.classList.toggle('title-push', elapsed >= 3250);
    const counter = document.querySelector('#slValuation');
    if (counter && elapsed >= 1320 && elapsed < 2520) {
      const p = Math.min(1, (elapsed - 1320) / 1200), value = Math.round(1_000_000 * Math.pow(1000, p));
      counter.textContent = value >= 1_000_000_000 ? '$1B' : value >= 100_000_000 ? `$${Math.round(value / 100_000_000) * 100}M` : `$${Math.max(1, Math.round(value / 1_000_000))}M`;
    } else if (counter && elapsed >= 2520) counter.textContent = '$1B';
    if (ctx) { ctx.clearRect(0, 0, w, h); for (const p of dust) { p.y -= .0018 + p.z * .005 + (elapsed > 2400 ? .008 : 0); p.x += Math.sin(now / 850 + p.y * 20) * .0002; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); } ctx.globalAlpha = .15 + p.z * .62; ctx.fillStyle = p.z > .72 ? '#c7b3ff' : '#93dfff'; const r = p.s * (.55 + p.z); ctx.beginPath(); ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; }
    if (elapsed < duration) frame = requestAnimationFrame(render); else { active = false; complete?.(); complete = null; }
  }
  function stop() { active = false; cancelAnimationFrame(frame); bridge.pause(); boardroom.pause(); canvas.width = canvas.height = 1; root.classList.remove('city-awake', 'boardroom-phase', 'valuation-phase', 'boardroom-flash', 'title-reveal', 'title-push', 'reduced-motion'); complete = null; }
  window.MUNStartupLaunch = {
    play({ onComplete, soundEnabled = false } = {}) {
      if (active) return; stop(); active = true; resize(); complete = onComplete || null; started = performance.now(); window.__munSoundEnabled = !!soundEnabled;
      root.classList.add('active'); playMedia(bridge); boardroom.pause(); boardroom.currentTime = 0;
      if (reduced.matches) { root.classList.add('reduced-motion', 'title-reveal'); setTimeout(() => { if (active) { active = false; complete?.(); complete = null; } }, 260); return; }
      frame = requestAnimationFrame(render);
      const switchRoom = () => { if (active && performance.now() - started >= 1050) { playMedia(boardroom); return; } if (active) setTimeout(switchRoom, 60); };
      setTimeout(switchRoom, 1050);
    },
    stop
  };
}
