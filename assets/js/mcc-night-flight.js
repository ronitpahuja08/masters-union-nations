(() => {
  const root = document.querySelector('#mccNightFlight');
  const video = document.querySelector('#mccDroneVideo');
  if (!root || !video) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, timer = 0, complete = null, started = 0, raf = 0;
  const clearGrade = () => { for (const key of ['--night-progress','--night-brightness','--night-saturation','--night-hue','--night-alpha-top','--night-alpha-bottom','--night-alpha-low','--night-lights']) root.style.removeProperty(key); };
  const showFallback = error => {
    if (!active) return;
    root.classList.add('video-fallback');
    console.warn('MCC drone footage unavailable; showing the New York night image instead.', error || video.error || 'Playback did not start');
  };
  video.addEventListener('error',()=>showFallback(video.error));
  video.addEventListener('playing',()=>{if(active)root.classList.remove('video-fallback');});
  const finish = () => { if (!active) return; active = false; clearTimeout(timer); cancelAnimationFrame(raf); video.pause(); const cb = complete; complete = null; if (cb) { cb(); } else { root.classList.remove('active', 'nightfall', 'title-reveal', 'reduced-motion', 'video-fallback'); clearGrade(); } };
  function tick() {
    if (!active) return;
    const elapsed = performance.now() - started;
    const progress = Math.min(1, elapsed / 4300);
    root.style.setProperty('--night-progress', String(progress));
    root.style.setProperty('--night-brightness', String(1.08 - progress * .24));
    root.style.setProperty('--night-saturation', String(1.05 - progress * .15));
    root.style.setProperty('--night-hue', `${Math.round(progress * 6)}deg`);
    root.style.setProperty('--night-alpha-top', String(progress * .18));
    root.style.setProperty('--night-alpha-bottom', String(progress * .34));
    root.style.setProperty('--night-alpha-low', String(progress * .22));
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
      if (reduced.matches) { root.classList.add('reduced-motion', 'title-reveal', 'video-fallback'); timer = setTimeout(finish, 280); return; }
      root.classList.add('video-fallback');
      video.muted = true; video.playsInline = true; video.playbackRate = 2; video.currentTime = 0;
      video.play().then(()=>{if(active&&video.error)showFallback(video.error);}).catch(showFallback);
      timer = setTimeout(finish, 4150); raf = requestAnimationFrame(tick);
    },
    stop() { clearTimeout(timer); cancelAnimationFrame(raf); video.pause(); active = false; complete = null; root.classList.remove('active', 'nightfall', 'title-reveal', 'reduced-motion', 'video-fallback'); clearGrade(); root.setAttribute('aria-hidden', 'true'); }
  };
})();
