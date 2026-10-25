(() => {
  'use strict';
  const toggle = document.getElementById('journeyMusicToggle');
  const topToggle = document.getElementById('soundToggle');
  if (!toggle || !topToggle) return;
  const epic = new Audio('assets/audio/theseus-athenian-hero.mp3');
  const explosion = new Audio('assets/audio/bomb-blast.mp3');
  epic.loop = true;
  epic.preload = 'metadata';
  epic.volume = .42;
  explosion.preload = 'auto';
  explosion.volume = .76;
  const explosionCue = .16;
  explosion.addEventListener('loadedmetadata', () => {
    if (explosion.duration > explosionCue) explosion.currentTime = explosionCue;
  }, { once: true });
  let scene = '', progress = 0;
  let enabled = topToggle.getAttribute('aria-pressed') === 'true';
  let duckTimer = 0;
  const overlayMuted = () => document.body.classList.contains('overlay');
  const desiredScene = () => progress >= .83 ? 'silence' : 'epic';

  function updateButton() {
    const mapSilent = enabled && scene === 'silence';
    const playing = enabled && scene === 'epic' && !overlayMuted();
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? mapSilent ? 'Map soundtrack is silent; turn sound off' : 'Turn off soundtrack' : 'Turn on soundtrack');
    toggle.querySelector('.journey-music-label').textContent = playing ? 'Music on' : mapSilent ? 'Map silent' : enabled ? 'Play music' : 'Music off';
  }
  function mixLevel() {
    const audible = enabled && !overlayMuted();
    epic.volume = audible && scene === 'epic' ? .42 : 0;
  }
  function changeScene(next) {
    if (scene === next) return;
    scene = next;
    if (next === 'epic' && enabled && !overlayMuted()) epic.play().catch(() => updateButton());
    else epic.pause();
    mixLevel();
  }
  async function start() {
    if (!enabled) return;
    changeScene(desiredScene());
    if (scene === 'epic' && epic.paused && !overlayMuted()) epic.play().catch(() => updateButton());
    mixLevel();
    updateButton();
  }
  function setEnabled(on) {
    enabled = !!on;
    if (enabled) start().catch(() => updateButton());
    else {
      clearTimeout(duckTimer);
      epic.pause();
      explosion.pause(); explosion.currentTime = 0;
      mixLevel();
      updateButton();
    }
  }
  function blast() {
    if (!enabled || overlayMuted()) return;
    clearTimeout(duckTimer);
    epic.volume = .12;
    explosion.pause();
    explosion.currentTime = explosionCue;
    explosion.play().catch(() => {});
    duckTimer = setTimeout(mixLevel, 1800);
  }
  toggle.addEventListener('click', () => {
    topToggle.click();
  });
  window.addEventListener('mun-sound-change', event => setEnabled(event.detail.enabled));
  window.addEventListener('journey', event => {
    progress = event.detail;
    if (enabled) changeScene(desiredScene());
  });
  new MutationObserver(() => {
    if (overlayMuted()) epic.pause();
    else if (enabled && scene === 'epic' && epic.paused) epic.play().catch(() => {});
    mixLevel();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('pointerdown', event => {
    if (event.target.closest('#journeyMusicToggle,#soundToggle')) return;
    if (enabled && scene === 'epic' && epic.paused) epic.play().catch(() => updateButton());
  }, { once: true });
  window.MUNJourneyAudio = { blast };
  progress = Number(getComputedStyle(document.getElementById('journeyStick')).getPropertyValue('--p')) || 0;
  updateButton();
})();
