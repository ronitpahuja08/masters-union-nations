/* One shared hand-over for all eight committees:
   1. the committee's animation, with its tagline popping up over it
   2. the committee page (boardroom.js crossfades to it), which is the only place the name is shown */
(function () {
  'use strict';
  const TAGS = {
    UNHRC: 'HUMAN RIGHTS CANNOT WAIT.',
    CCEP: 'THE FUTURE IS NEGOTIABLE.',
    AIPPM: 'POLITICS. POWER. POLICY.',
    IPL: 'EVERY BID BUILDS A CHAMPION.'
  };
  /* MCC, DALAL, STARTUP and IP intros print their own line, so they get no tagline overlay */
  /* how long each scene runs before its tagline has had its moment; the tagline pops in at this share */
  const SCENE = { UNHRC: 5600, CCEP: 4700, IPL: 6300, AIPPM: 3000 };
  const TAG_AT = 0.36;
  const timers = [];
  let tagEl;

  function make() {
    if (tagEl) return;
    tagEl = document.createElement('div'); tagEl.className = 'seq-tag'; tagEl.setAttribute('aria-hidden', 'true');
    tagEl.innerHTML = '<span class="seq-tag-line"></span><p></p>';
    document.body.append(tagEl);
  }
  function clear() { while (timers.length) clearTimeout(timers.pop()); }

  /* scene starts: schedule the tagline */
  function start(c) {
    make(); clear(); tagEl.classList.remove('on');
    if (!TAGS[c.code]) return;
    tagEl.querySelector('p').textContent = TAGS[c.code];
    tagEl.style.setProperty('--seq-c', c.color || '#f3d9a2');
    timers.push(setTimeout(function () { tagEl.classList.add('on'); }, Math.max(700, Math.round(SCENE[c.code] * TAG_AT))));
  }
  /* scene ended: hand straight to the page; its hero carries the name */
  function done(c, finish) { release(); finish(); }
  /* page is opening (or the visitor skipped): the tagline goes at once */
  function release() {
    clear();
    if (tagEl) tagEl.classList.remove('on');
  }
  window.MUNSeq = { start: start, done: done, release: release };
})();
