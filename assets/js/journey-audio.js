(() => {
  'use strict';
  const toggle = document.getElementById('journeyMusicToggle');
  const topToggle = document.getElementById('soundToggle');
  if (!toggle || !topToggle) return;
  const epic = new Audio('assets/audio/theseus-athenian-hero.mp3');
  const explosion = new Audio('assets/audio/bomb-blast.mp3');
  const resetLine = new Audio('assets/audio/world-resets-voice.mp3');
  epic.loop = true;
  epic.preload = 'none';
  epic.volume = .42;
  explosion.preload = 'none';
  explosion.volume = .26;
  resetLine.preload = 'none';
  resetLine.volume = 1;
  const explosionCue = .16;
  explosion.addEventListener('loadedmetadata', () => {
    if (explosion.duration > explosionCue) explosion.currentTime = explosionCue;
  }, { once: true });
  let scene = '';
  let enabled = true;
  try { const choice=localStorage.getItem('mun26-sound-choice');enabled=choice==='on'||(!window.MUNPerformance?.lite&&choice!=='off'); } catch (e) { enabled=!window.MUNPerformance?.lite; }
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
  /* The spoken line plays from a decoded buffer through WebAudio: it starts on the exact frame, is not
     affected by media-element buffering, and is lifted by a gain stage. The <audio> element is the fallback. */
  const VOICE_GAIN = 1.7;
  let voiceBuf = null, voiceLoading = null, voiceSrc = null, voiceSafety = 0;
  function ctxReady() { return voiceContext && voiceContext.state === 'running'; }
  function unlockVoice() {
    if (!enabled || !(window.AudioContext || window.webkitAudioContext)) return;
    try {
      voiceContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (voiceContext.state === 'suspended') voiceContext.resume().catch(() => {});
      loadVoice();
    } catch (e) { /* the media element still plays without the gain stage */ }
  }
  function loadVoice() {
    if (voiceBuf || voiceLoading || !voiceContext) return;
    voiceLoading = fetch(resetLine.src).then(r => r.arrayBuffer()).then(b => voiceContext.decodeAudioData(b)).then(buf => { voiceBuf = buf; }).catch(() => {}).finally(() => { voiceLoading = null; });
  }
  function stopVoiceSource() { if (voiceSrc) { try { voiceSrc.onended = null; voiceSrc.stop(); } catch (e) {} voiceSrc = null; } }
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
      voiceActive = false; clearTimeout(voiceTimer); stopVoiceSource();
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
    clearTimeout(voiceSafety); voiceSafety = setTimeout(() => { if (voiceActive) { voiceActive = false; mixLevel(); } }, 4500);
  }
  function playVoice() {
    if (!enabled || !voiceActive) return;
    voicePending = false;
    if (ctxReady() && voiceBuf) {
      stopVoiceSource();
      const g = voiceContext.createGain(); g.gain.value = VOICE_GAIN;
      voiceSrc = voiceContext.createBufferSource(); voiceSrc.buffer = voiceBuf;
      voiceSrc.connect(g).connect(voiceContext.destination);
      voiceSrc.onended = voiceDone; voiceSrc.start();
      return;
    }
    resetLine.currentTime = 0;
    resetLine.play().catch(() => { voiceActive = false; voicePending = true; mixLevel(); });
  }
  function voiceDone() {
    voiceActive = false; voicePending = false; voiceSrc = null; clearTimeout(voiceSafety);
    if (enabled && !overlayMuted() && scene === 'epic') { if (epic.paused) epic.play().catch(() => {}); fadeEpic(.42, 2200); }
  }
  resetLine.addEventListener('ended', voiceDone);
  function resetCycle() {
    resetLinePlayed = false;
    stopVoiceSource(); clearTimeout(voiceSafety);
    clearTimeout(voiceTimer);
    voiceActive = false;
    voicePending = false;
    resetLine.pause();
    resetLine.currentTime = 0;
  }
  function preload() {
    explosion.load();
    resetLine.load();
    unlockVoice();
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
  const voicePlaying = () => voiceActive;
  window.MUNJourneyAudio = { blast, resetVoice, resetCycle, preload, voicePlaying };
  start().catch(() => updateButton());
  updateButton();
})();
