(() => {
  'use strict';
  const toggle = document.getElementById('journeyMusicToggle');
  const topToggle = document.getElementById('soundToggle');
  if (!toggle || !topToggle) return;
  const epic = new Audio('assets/audio/theseus-athenian-hero.mp3');
  const explosion = new Audio('assets/audio/bomb-blast.mp3');
  // Replace this self-contained cue with a mastered voice asset without changing the timeline.
  const resetLine = new Audio('assets/audio/world-resets-voice.mp3');
  epic.loop = true;
  epic.preload = 'metadata';
  epic.volume = .42;
  explosion.preload = 'auto';
  explosion.volume = .26;
  resetLine.preload = 'auto';
  resetLine.volume = 1;
  const explosionCue = .16;
  explosion.addEventListener('loadedmetadata', () => {
    if (explosion.duration > explosionCue) explosion.currentTime = explosionCue;
  }, { once: true });
  let scene = '', progress = 0;
  let enabled = topToggle.getAttribute('aria-pressed') === 'true';
  let blastTimer = 0, duckTimer = 0, resetLinePlayed = false, voiceActive = false, fadeTimer = 0, voiceTimer = 0;
  const overlayMuted = () => document.body.classList.contains('overlay');
  const desiredScene = () => 'epic';

  function updateButton() {
    const mapSilent = enabled && scene === 'silence';
    const playing = enabled && scene === 'epic' && !overlayMuted();
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? mapSilent ? 'Map soundtrack is silent; turn sound off' : 'Turn off soundtrack' : 'Turn on soundtrack');
    toggle.querySelector('.journey-music-label').textContent = playing ? 'Music on' : mapSilent ? 'Map silent' : enabled ? 'Play music' : 'Music off';
  }
  function mixLevel() {
    const audible = enabled && !overlayMuted();
    clearInterval(fadeTimer);
    epic.volume = audible && scene === 'epic' && !voiceActive ? .42 : 0;
  }
  function fadeOut(el, ms) {
    const from = el.volume, t0 = performance.now();
    const id = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = Math.max(0, from * (1 - k));
      if (k >= 1) { clearInterval(id); el.pause(); el.volume = from; }
    }, 30);
  }
  let gain = null;
  function boostVoice() {          // the recorded line is quiet: lift it with a gain stage
    if (gain || !(window.AudioContext || window.webkitAudioContext)) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain(); gain.gain.value = 2.6;
      ctx.createMediaElementSource(resetLine).connect(gain).connect(ctx.destination);
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { gain = null; }
  }
  function fadeEpic(to, ms) {
    clearInterval(fadeTimer);
    const from = epic.volume, t0 = performance.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      epic.volume = Math.max(0, Math.min(1, from + (to - from) * (k * k * (3 - 2 * k))));
      if (k >= 1) clearInterval(fadeTimer);
    }, 40);
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
      voiceActive = false; clearTimeout(voiceTimer);
      explosion.pause(); explosion.currentTime = 0;
      resetLine.pause(); resetLine.currentTime = 0;
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
    explosion.volume = .26;
    explosion.play().catch(() => {});
    clearTimeout(blastTimer);
    blastTimer = setTimeout(() => fadeOut(explosion, 350), 650);
    duckTimer = setTimeout(mixLevel, 1100);
  }
  function resetVoice() {
    if (resetLinePlayed) return;
    resetLinePlayed = true;
    clearTimeout(duckTimer);
    if (!enabled || overlayMuted()) return;
    voiceActive = true;
    clearTimeout(blastTimer);
    if (!explosion.paused) fadeOut(explosion, 300);   // the blast never overlaps the voice
    fadeEpic(0, 280);
    // Start the spoken line as the reset title begins to emerge from the debris.
    voiceTimer = setTimeout(() => { boostVoice(); resetLine.currentTime = 0; resetLine.play().catch(() => { voiceActive = false; mixLevel(); }); }, 250);
  }
  resetLine.addEventListener('ended', () => {
    voiceActive = false;
    if (enabled && !overlayMuted() && scene === 'epic') { if (epic.paused) epic.play().catch(() => {}); fadeEpic(.42, 2200); }
  });
  function resetCycle() {
    resetLinePlayed = false;
    clearTimeout(voiceTimer);
    voiceActive = false;
    resetLine.pause();
    resetLine.currentTime = 0;
  }
  function preload() {
    explosion.load();
    resetLine.load();
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
  const voicePlaying = () => voiceActive && !resetLine.paused && !resetLine.ended && !resetLine.error;
  window.MUNJourneyAudio = { blast, resetVoice, resetCycle, preload, voicePlaying };
  progress = Number(getComputedStyle(document.getElementById('journeyStick')).getPropertyValue('--p')) || 0;
  updateButton();
})();
