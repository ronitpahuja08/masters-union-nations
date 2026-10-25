(() => {
  const root = document.querySelector('#mccNightFlight');
  const video = document.querySelector('#mccDroneVideo');
  if (!root || !video) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, timer = 0, complete = null, started = 0, raf = 0;
  const clearGrade = () => { for (const key of ['--night-progress','--night-brightness','--night-saturation','--night-hue','--night-alpha-top','--night-alpha-bottom','--night-alpha-low','--night-lights']) root.style.removeProperty(key); };
  const finish = () => { if (!active) return; active = false; clearTimeout(timer); cancelAnimationFrame(raf); video.pause(); root.classList.remove('active', 'nightfall', 'title-reveal', 'reduced-motion'); clearGrade(); complete?.(); complete = null; };
  function tick() {
    if (!active) return;
    const elapsed = performance.now() - started;
    const progress = Math.min(1, elapsed / 4300);
    root.style.setProperty('--night-progress', String(progress));
    root.style.setProperty('--night-brightness', String(1 - progress * .48));
    root.style.setProperty('--night-saturation', String(1 - progress * .32));
    root.style.setProperty('--night-hue', `${Math.round(progress * 13)}deg`);
    root.style.setProperty('--night-alpha-top', String(progress * .32));
    root.style.setProperty('--night-alpha-bottom', String(progress * .6));
    root.style.setProperty('--night-alpha-low', String(progress * .42));
    root.style.setProperty('--night-lights', String(progress * .55));
    root.classList.toggle('nightfall', progress >= .45);
    if (elapsed >= 4120) root.classList.add('title-reveal');
    raf = requestAnimationFrame(tick);
  }
  window.MUNMCCNightFlight = {
    play({ onComplete } = {}) {
      if (active) return;
      active = true; complete = onComplete || null; started = performance.now(); clearGrade();
      root.classList.add('active'); root.setAttribute('aria-hidden', 'false');
      video.muted = true; video.playsInline = true; video.playbackRate = 2; video.currentTime = 0;
      video.play().catch(() => {});
      if (reduced.matches) { root.classList.add('reduced-motion', 'title-reveal'); timer = setTimeout(finish, 280); return; }
      timer = setTimeout(finish, 5000); raf = requestAnimationFrame(tick);
    },
    stop() { clearTimeout(timer); cancelAnimationFrame(raf); video.pause(); active = false; complete = null; root.classList.remove('active', 'nightfall', 'title-reveal', 'reduced-motion'); clearGrade(); root.setAttribute('aria-hidden', 'true'); }
  };
})();
