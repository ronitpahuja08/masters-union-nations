(() => {
  'use strict';
  const toggle = document.getElementById('journeyMusicToggle');
  const topToggle = document.getElementById('soundToggle');
  if (!toggle || !topToggle) return;
  const epic = new Audio('assets/audio/theseus-athenian-hero.mp3');
  const explosion = new Audio('assets/audio/bomb-blast.mp3');
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
  let scene = '';
  let enabled = topToggle.getAttribute('aria-pressed') === 'true';
  let blastTimer = 0, duckTimer = 0, resetLinePlayed = false, voiceActive = false, voicePending = false, fadeTimer = 0, voiceTimer = 0;
  let voiceContext = null, voiceGain = null, musicAttempt = null;
  const overlayMuted = () => document.body.classList.contains('overlay');
  const desiredScene = () => 'epic';

  function updateButton() {
    const mapSilent = enabled && scene === 'silence';
    const playing = enabled && scene === 'epic' && !overlayMuted() && !epic.paused;
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? mapSilent ? 'Map soundtrack is silent; turn sound off' : 'Turn off soundtrack' : 'Turn on soundtrack');
    toggle.querySelector('.journey-music-label').textContent = playing ? 'Music on' : mapSilent ? 'Map silent' : enabled ? 'Tap for sound' : 'Music off';
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
  function boostVoice() {
    // Never route the voice through a suspended AudioContext: that produced a
    // silently playing element on browsers that blocked autoplay.
    if (voiceGain || voiceContext?.state !== 'running') return;
    try {
      voiceGain = voiceContext.createGain(); voiceGain.gain.value = 2.6;
      voiceContext.createMediaElementSource(resetLine).connect(voiceGain).connect(voiceContext.destination);
    } catch (e) { voiceGain = null; }
  }
  function unlockVoice() {
    if (!enabled || !(window.AudioContext || window.webkitAudioContext)) return;
    try {
      voiceContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (voiceContext.state === 'suspended') voiceContext.resume().then(boostVoice).catch(() => {});
      else boostVoice();
    } catch (e) { /* The media element can still play without the gain stage. */ }
  }
  function playEpic() {
    if (!enabled || overlayMuted() || scene !== 'epic' || !epic.paused || musicAttempt) return;
    musicAttempt = epic.play();
    musicAttempt.then(() => { musicAttempt = null; updateButton(); }).catch(() => { musicAttempt = null; updateButton(); });
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
    if (next === 'epic') playEpic();
    else epic.pause();
    mixLevel();
  }
  async function start() {
    if (!enabled) return;
    changeScene(desiredScene());
    playEpic();
    mixLevel();
    updateButton();
  }
  function setEnabled(on) {
    enabled = !!on;
    if (enabled) {
      unlockVoice(); start().catch(() => updateButton());
      if (document.body.classList.contains('in-blackout')) {
        if (voicePending) playVoice();
        else if (!resetLinePlayed) resetVoice();
      }
    }
    else {
      clearTimeout(duckTimer);
      epic.pause();
      voiceActive = false; clearTimeout(voiceTimer);
      voicePending = false;
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
    clearTimeout(duckTimer);
    if (!enabled || overlayMuted()) return;
    resetLinePlayed = true;
    voiceActive = true;
    clearTimeout(blastTimer);
    if (!explosion.paused) fadeOut(explosion, 300);   // the blast never overlaps the voice
    fadeEpic(0, 280);
    // Start the spoken line as the reset title begins to emerge from the debris.
    voiceTimer = setTimeout(playVoice, 250);
  }
  function playVoice() {
    if (!enabled || !document.body.classList.contains('in-blackout')) return;
    boostVoice();
    voicePending = false;
    resetLine.currentTime = 0;
    resetLine.play().catch(() => { voiceActive = false; voicePending = true; mixLevel(); });
  }
  resetLine.addEventListener('ended', () => {
    voiceActive = false;
    voicePending = false;
    if (enabled && !overlayMuted() && scene === 'epic') { if (epic.paused) epic.play().catch(() => {}); fadeEpic(.42, 2200); }
  });
  function resetCycle() {
    resetLinePlayed = false;
    clearTimeout(voiceTimer);
    voiceActive = false;
    voicePending = false;
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
    if (enabled) changeScene(desiredScene());
  });
  new MutationObserver(() => {
    if (overlayMuted()) epic.pause();
    else playEpic();
    mixLevel();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  function resumeOnGesture() {
    if (!enabled) return;
    unlockVoice();
    playEpic();
    if (document.body.classList.contains('in-blackout')) {
      if (voicePending) { voiceActive = true; playVoice(); }
      else if (!resetLinePlayed) resetVoice();
    }
  }
  document.addEventListener('pointerdown', resumeOnGesture, { passive: true });
  document.addEventListener('touchstart', resumeOnGesture, { passive: true });
  document.addEventListener('keydown', resumeOnGesture);
  // A queued play() request can remain unresolved under autoplay restrictions.
  // Only hold the map handoff for voice that is actually advancing.
  const voicePlaying = () => voiceActive && !resetLine.paused && resetLine.currentTime > 0 && !resetLine.ended && !resetLine.error;
  window.MUNJourneyAudio = { blast, resetVoice, resetCycle, preload, voicePlaying };
  start().catch(() => updateButton());
  updateButton();
})();
