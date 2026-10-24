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
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let context, master, timer, nextBar = 0, scene = '', progress = 0;
  let enabled = topToggle.getAttribute('aria-pressed') === 'true';
  let duckTimer = 0;
  const overlayMuted = () => document.body.classList.contains('overlay');
  const desiredScene = () => progress >= .83 && progress < .93 ? 'silence' : progress >= .93 ? 'map' : 'epic';

  function updateButton() {
    const playing = enabled && !!context && context.state === 'running';
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Turn off soundtrack' : 'Turn on soundtrack');
    toggle.querySelector('.journey-music-label').textContent = playing ? 'Music on' : enabled ? 'Play music' : 'Music off';
  }
  function init() {
    if (context || !AudioContextClass) return;
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
  }
  function note(frequency, at, duration, volume, type = 'sine') {
    if (!context || !master) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    envelope.gain.setValueAtTime(.0001, at);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), at + .045);
    envelope.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(envelope).connect(master);
    oscillator.start(at);
    oscillator.stop(at + duration + .03);
  }
  function scoreMap(at) {
    const beat = .8;
    [146.83, 174.61, 220, 261.63].forEach(f => note(f, at, 6.25, .023));
    [293.66, 349.23, 440, 523.25, 440, 349.23, 293.66, 261.63].forEach((f, i) => {
      note(f, at + i * beat, 1.16, .046);
      note(f * 2, at + i * beat + .02, .44, .012, 'triangle');
    });
    return beat * 8;
  }
  function schedule() {
    if (!enabled || !context || context.state !== 'running' || scene !== 'map') return;
    if (nextBar < context.currentTime - .2) nextBar = context.currentTime + .04;
    while (nextBar < context.currentTime + .7) nextBar += scoreMap(nextBar);
  }
  function mixLevel() {
    const audible = enabled && !overlayMuted();
    if (master && context) master.gain.setTargetAtTime(audible && scene === 'map' ? .72 : 0, context.currentTime, .08);
    epic.volume = audible && scene === 'epic' ? .42 : 0;
  }
  function changeScene(next) {
    if (scene === next) return;
    scene = next;
    if (next === 'epic' && enabled && !overlayMuted()) epic.play().catch(() => updateButton());
    else epic.pause();
    if (context) nextBar = context.currentTime + .04;
    mixLevel();
    schedule();
  }
  async function start() {
    if (!enabled) return;
    init();
    if (context) await context.resume();
    changeScene(desiredScene());
    if (scene === 'epic' && epic.paused && !overlayMuted()) epic.play().catch(() => updateButton());
    mixLevel();
    if (!timer) timer = setInterval(schedule, 220);
    updateButton();
  }
  function setEnabled(on) {
    enabled = !!on;
    if (enabled) start().catch(() => updateButton());
    else {
      clearInterval(timer); timer = 0;
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
  function reveal() {
    if (!enabled || !context || context.state !== 'running') return;
    const at = context.currentTime;
    [146.83, 220, 293.66].forEach((f, i) => note(f, at + i * .28, 2.15, .045, 'triangle'));
  }
  toggle.addEventListener('click', () => {
    if (enabled && (!context || context.state !== 'running')) start().catch(() => updateButton());
    else topToggle.click();
  });
  window.addEventListener('mun-sound-change', event => setEnabled(event.detail.enabled));
  window.addEventListener('journey', event => {
    progress = event.detail;
    if (enabled) changeScene(desiredScene());
  });
  new MutationObserver(() => {
    if (overlayMuted()) epic.pause();
    else if (enabled && scene === 'epic' && epic.paused && context?.state === 'running') epic.play().catch(() => {});
    mixLevel();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('pointerdown', event => {
    if (event.target.closest('#journeyMusicToggle,#soundToggle')) return;
    if (enabled && (!context || context.state !== 'running')) start().catch(() => updateButton());
  }, { once: true });
  window.MUNJourneyAudio = { blast, reveal };
  progress = Number(getComputedStyle(document.getElementById('journeyStick')).getPropertyValue('--p')) || 0;
  updateButton();
})();
