/* One shared hand-over for all eight committees:
   1. the committee's animation, with its tagline popping up over it
   2. a name-only card for a beat
   3. the committee page (boardroom.js crossfades to it) */
(function () {
  'use strict';
  const TAGS = {
    UNHRC: 'HUMAN RIGHTS CANNOT WAIT.',
    MCC: 'WHEN THE CLOCK STOPS, JUDGMENT BEGINS.',
    CCEP: 'THE FUTURE IS NEGOTIABLE.',
    AIPPM: 'POLITICS. POWER. POLICY.',
    IPL: 'EVERY BID BUILDS A CHAMPION.',
    STARTUP: 'BUILD THE NEXT BIG THING.',
    IP: 'EVERY STORY CHANGES THE NARRATIVE.',
    DALAL: 'FORTUNES RISE. EMPIRES FALL.'
  };
  const NAMES = { STARTUP: 'STARTUP BOARDROOM', DALAL: 'DALAL STREET', IP: 'INTERNATIONAL PRESS' };
  /* how long each scene runs before its tagline has had its moment; the tagline pops in at this share */
  const SCENE = { UNHRC: 5600, CCEP: 4700, IPL: 6300, STARTUP: 4600, AIPPM: 3000, MCC: 4150, DALAL: 3500, IP: 3900 };
  const TAG_AT = 0.36, HOLD = 1000;
  const timers = [];
  let tagEl, cardEl, pendingFinish = null;

  function make() {
    if (tagEl) return;
    tagEl = document.createElement('div'); tagEl.className = 'seq-tag'; tagEl.setAttribute('aria-hidden', 'true');
    tagEl.innerHTML = '<span class="seq-tag-line"></span><p></p>';
    cardEl = document.createElement('div'); cardEl.className = 'seq-card'; cardEl.setAttribute('aria-hidden', 'true');
    cardEl.innerHTML = '<span class="seq-card-kicker">MASTERS\u2019 UNION NATIONS</span><h1 class="seq-card-name"></h1><span class="seq-card-line"></span><span class="seq-card-full"></span>';
    cardEl.addEventListener('click', function () { if (pendingFinish) { const f = pendingFinish; pendingFinish = null; f(); } });
    document.body.append(tagEl, cardEl);
  }
  function clear() { while (timers.length) clearTimeout(timers.pop()); }

  /* scene starts: schedule the tagline */
  function start(c) {
    const sceneMs = SCENE[c.code] || 4000;
    make(); clear(); release(true);
    tagEl.querySelector('p').textContent = TAGS[c.code] || '';
    tagEl.style.setProperty('--seq-c', c.color || '#f3d9a2');
    timers.push(setTimeout(function () { tagEl.classList.add('on'); }, Math.max(700, Math.round(sceneMs * TAG_AT))));
  }
  /* scene ended: name-only card, then hand to the page */
  function done(c, finish) {
    make(); clear();
    pendingFinish = finish;
    cardEl.style.setProperty('--seq-c', c.color || '#f3d9a2');
    cardEl.querySelector('.seq-card-name').textContent = NAMES[c.code] || c.code;
    cardEl.querySelector('.seq-card-full').textContent = c.full || '';
    cardEl.classList.remove('out'); void cardEl.offsetWidth; cardEl.classList.add('on');
    timers.push(setTimeout(function () { if (pendingFinish) { const f = pendingFinish; pendingFinish = null; f(); } }, HOLD));
  }
  /* page is opening (or the visitor skipped): tagline goes at once, the card dissolves */
  function release(instant) {
    clear(); pendingFinish = null;
    if (!tagEl) return;
    tagEl.classList.remove('on');
    if (instant) { cardEl.classList.remove('on', 'out'); return; }
    if (cardEl.classList.contains('on')) { cardEl.classList.add('out'); timers.push(setTimeout(function () { cardEl.classList.remove('on', 'out'); }, 1100)); }
  }
  window.MUNSeq = { start: start, done: done, release: release };
})();
