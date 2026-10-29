/* ZERO: "Order of Business" — the committee itinerary as one vertical timeline.
 * Renders into #cpItinerary (shared committee page, per committee) and #dpItinerary (Dalal).
 * Data: assets/data/itineraries.json, transcribed from Itinerary.docx.
 * During 28–29 Nov 2026 (IST) the current row is marked NOW and the following one NEXT.
 * This script never touches registration, award, cinematic or routing code. */
(() => {
  'use strict';
  const SHARED = document.getElementById('cpItinerary');
  const DALAL = document.getElementById('dpItinerary');
  const SHARED_PAGE = document.getElementById('committeePage');
  const DALAL_PAGE = document.getElementById('dalalCommitteePage');
  if (!SHARED || !DALAL || !SHARED_PAGE || !DALAL_PAGE) return;

  const MINUTE = 6e4, DAY = 864e5;
  const IST_OFFSET = 330 * MINUTE;                       // Asia/Kolkata, no DST
  const DAY0 = Date.UTC(2026, 10, 28) - IST_OFFSET;      // 28 Nov 2026, 00:00 IST
  const LIVE_FROM = DAY0, LIVE_TO = DAY0 + 2 * DAY;      // until 30 Nov, 00:00 IST
  const DATES = [
    { short: 'Sat 28 Nov', long: 'Saturday 28 November', overnight: 'Sat 28 → Sun 29 November' },
    { short: 'Sun 29 Nov', long: 'Sunday 29 November', overnight: 'Sun 29 → Mon 30 November' }
  ];
  const WORDS = ['zero', 'one', 'two', 'three', 'four'];
  const TIME_RE = /(\d{1,2}):(\d{2})\s*([AP])\.?M\.?/gi;

  const esc = input => String(input ?? '').replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[s]);
  const reduce = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  let RECORDS = {};
  let COMMON = null;
  const STATE = new Map(); // host -> { code, day, page, observer }

  /* ---------- parsing ---------- */
  function clock(text) {
    return [...String(text || '').matchAll(TIME_RE)].slice(0, 2).map(m => ({
      label: m[1] + ':' + m[2] + ' ' + m[3].toUpperCase() + 'M',
      minutes: (Number(m[1]) % 12 + (m[3].toUpperCase() === 'P' ? 12 : 0)) * 60 + Number(m[2])
    }));
  }
  const crossesMidnight = range => {
    const [a, b] = clock(range);
    return !!(a && b && b.minutes > 0 && b.minutes < a.minutes);
  };
  const duration = mins => {
    const h = Math.floor(mins / 60), m = mins % 60;
    return (h ? h + '\u00a0h' : '') + (h && m ? ' ' : '') + (m ? m + '\u00a0min' : '');
  };
  const recordFor = code => RECORDS[code] || (COMMON?.days ? { name: code, days: COMMON.days } : null);

  /* Each day's events as absolute IST timestamps. Rows run in order, so a start
   * earlier than the previous start means the night has rolled past midnight. */
  function schedule(day, index) {
    if (!Array.isArray(day?.events) || !day.events.length) return null;
    let offset = 0, previous = -1;
    return day.events.map(([time, event]) => {
      const [a, b] = clock(time);
      const row = { time: String(time || ''), event: String(event || ''), from: a, to: b, start: null, end: null };
      if (a && b) {
        if (previous >= 0 && a.minutes < previous) offset += 1440;
        previous = a.minutes;
        const base = DAY0 + index * DAY + offset * MINUTE;
        row.start = base + a.minutes * MINUTE;
        row.end = base + (b.minutes + (b.minutes <= a.minutes ? 1440 : 0)) * MINUTE;
      }
      return row;
    });
  }

  function liveState(record, now = Date.now()) {
    if (!record || now < LIVE_FROM || now >= LIVE_TO) return null;
    const rows = [];
    (record.days || []).forEach((day, d) => (schedule(day, d) || []).forEach((row, i) => {
      if (row.start != null) rows.push({ d, i, start: row.start, end: row.end });
    }));
    const current = rows.find(r => r.start <= now && now < r.end) || null;
    const next = rows.filter(r => r.start > now).sort((x, y) => x.start - y.start)[0] || null;
    return { now, current, next, rows };
  }

  function defaultDay(record) {
    const days = record?.days || [];
    const live = liveState(record);
    if (live?.current) return live.current.d;
    if (live?.next) return live.next.d;
    const withEvents = days.findIndex(day => Array.isArray(day?.events) && day.events.length);
    return withEvents < 0 ? 0 : withEvents;
  }

  /* ---------- markup ---------- */
  function dayTitle(day, index) {
    const title = String(day?.title || 'Day ' + (index + 1));
    const words = title.replace(/\d+/, n => WORDS[Number(n)] || n);
    const m = words.match(/^(day\s+\S+)\s+(.+)$/i);
    return m ? esc(m[1]) + ' <em>' + esc(m[2]) + '</em>' : esc(words);
  }
  function dayDate(day, index) {
    const date = DATES[index] || DATES[0];
    return crossesMidnight(day?.range) ? date.overnight : date.long;
  }
  function dayRange(day) {
    const [a, b] = clock(day?.range);
    return a && b ? a.label + ' – ' + b.label + ' IST' : 'Timings to be confirmed';
  }

  function rowMarkup(row, i) {
    const session = /committee session|paperwork/i.test(row.event);
    const ticket = /closing ceremony|masquerade/i.test(row.event);
    const split = row.event.match(/^(.*?)\s*\((.+)\)\s*$/);
    const name = split ? split[1] : row.event;
    const note = split ? split[2].charAt(0).toUpperCase() + split[2].slice(1) : '';
    const mins = row.start != null ? Math.round((row.end - row.start) / MINUTE) : 0;
    const meta = (session ? 'In session' : '') + (session && mins ? ' · ' : '') + (mins ? duration(mins) : '');
    const time = row.from && row.to
      ? '<span class="ob-start">' + esc(row.from.label) + '</span><span class="ob-end"><span class="ob-sr">to </span>' + esc(row.to.label) + '</span>'
      : '<span class="ob-start">' + esc(row.time) + '</span>';
    return '<li class="ob-row' + (session ? ' is-session' : '') + (ticket ? ' is-ticket' : '') + '" style="--i:' + i + '" data-row="' + i + '">' +
      '<p class="ob-time">' + time + '</p>' +
      '<span class="ob-node" aria-hidden="true"></span>' +
      '<div class="ob-event">' +
        '<span class="ob-chips"></span>' +
        '<span class="ob-name">' + esc(name) + '</span>' +
        (note ? '<span class="ob-note">' + esc(note) + '</span>' : '') +
        (meta ? '<span class="ob-meta">' + esc(meta) + '</span>' : '') +
      '</div></li>';
  }

  function trackMarkup(day, index) {
    const rows = schedule(day, index);
    if (!rows) {
      return '<div class="ob-track is-tba"><span class="ob-spine" aria-hidden="true"></span>' +
        '<div class="ob-row ob-tba" style="--i:0">' +
          '<p class="ob-time"><span class="ob-start">TBA</span></p>' +
          '<span class="ob-node" aria-hidden="true"></span>' +
          '<div class="ob-event"><span class="ob-name">Schedule to be announced</span>' +
          '<span class="ob-note">The published itinerary does not list timings for this day yet. They will appear here once confirmed.</span></div>' +
        '</div></div>';
    }
    return '<div class="ob-track"><span class="ob-spine" aria-hidden="true"></span>' +
      '<ol class="ob-list">' + rows.map(rowMarkup).join('') + '</ol></div>';
  }

  function render(host, code, page) {
    const record = recordFor(code);
    if (!record) return;
    const previous = STATE.get(host);
    previous?.observer?.disconnect();
    const id = host.id;
    const days = (record.days || []).slice(0, 2);
    const day = defaultDay(record);
    host.dataset.itineraryCode = code;
    host.innerHTML = '<div class="ob-inner">' +
      '<header class="ob-head">' +
        '<p class="ob-label">Programme · 28—29 Nov 2026</p>' +
        '<h2 class="ob-title" id="' + id + '-title">Order of<br><em>business.</em></h2>' +
        '<p class="ob-lede">' + esc(record.name) + ', sitting by sitting. All times are IST.</p>' +
        '<div class="ob-switch" role="tablist" aria-label="Choose a conference day">' +
          '<span class="ob-thumb" aria-hidden="true"></span>' +
          days.map((d, i) =>
            '<button type="button" class="ob-tab" role="tab" id="' + id + '-tab-' + i + '" data-day="' + i + '" ' +
              'aria-controls="' + id + '-panel" aria-selected="false" tabindex="-1">' +
              '<span class="ob-tab-day">Day ' + (i + 1) + '</span>' +
              '<span class="ob-tab-date">' + esc((DATES[i] || DATES[0]).short) + '</span>' +
            '</button>').join('') +
        '</div>' +
      '</header>' +
      '<div class="ob-panel" role="tabpanel" id="' + id + '-panel" tabindex="0">' +
        '<div class="ob-dayline">' +
          '<h3 class="ob-day"><span class="ob-flip"><span class="ob-flip-in" data-flip="title"></span></span></h3>' +
          '<p class="ob-date"><span class="ob-flip"><span class="ob-flip-in" data-flip="date"></span></span></p>' +
          '<p class="ob-range"><span class="ob-flip"><span class="ob-flip-in" data-flip="range"></span></span></p>' +
        '</div>' +
        '<div class="ob-body"></div>' +
      '</div>' +
    '</div>';

    const state = { code, record, page, day: -1, seen: false, observer: null };
    STATE.set(host, state);

    const tabs = [...host.querySelectorAll('.ob-tab')];
    tabs.forEach(tab => tab.addEventListener('click', () => select(host, Number(tab.dataset.day), true)));
    host.querySelector('.ob-switch').addEventListener('keydown', event => {
      const at = tabs.indexOf(document.activeElement);
      if (at < 0) return;
      let to = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') to = (at + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') to = (at - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') to = 0;
      else if (event.key === 'End') to = tabs.length - 1;
      if (to == null) return;
      event.preventDefault();
      tabs[to].focus();
      select(host, to, true);
    });

    select(host, day, false);

    // Draw the spine and stagger the rows the first time the timeline scrolls into view.
    const panel = host.querySelector('.ob-panel');
    if (!('IntersectionObserver' in window)) { state.seen = true; reveal(host); return; }
    state.observer = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      state.observer.disconnect();
      state.seen = true;
      reveal(host);
    }, { threshold: 0.12 });
    state.observer.observe(panel);
  }

  function reveal(host) {
    const track = host.querySelector('.ob-track');
    if (!track) return;
    track.classList.remove('is-in');
    void track.offsetWidth;
    track.classList.add('is-in');
  }

  function flip(el, html, animate, delay) {
    el.getAnimations?.().forEach(a => a.cancel());
    el.innerHTML = html;
    if (!animate || typeof el.animate !== 'function') return;
    const frames = reduce()
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 0, transform: 'translate3d(0,105%,0)' }, { opacity: 1, transform: 'none' }];
    el.animate(frames, { duration: reduce() ? 160 : 220, delay, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
  }

  function select(host, index, animate) {
    const state = STATE.get(host);
    if (!state) return;
    const days = state.record.days || [];
    if (!days[index] || index === state.day) return;
    state.day = index;
    const day = days[index];

    host.querySelectorAll('.ob-tab').forEach(tab => {
      const on = Number(tab.dataset.day) === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    host.querySelector('.ob-switch').style.setProperty('--d', String(index));
    const panel = host.querySelector('.ob-panel');
    panel.setAttribute('aria-labelledby', host.id + '-tab-' + index);

    flip(host.querySelector('[data-flip="title"]'), dayTitle(day, index), animate, 0);
    flip(host.querySelector('[data-flip="date"]'), esc(dayDate(day, index)), animate, 30);
    flip(host.querySelector('[data-flip="range"]'), esc(dayRange(day)), animate, 60);

    host.querySelector('.ob-body').innerHTML = trackMarkup(day, index);
    applyLive(host);
    if (state.seen) reveal(host);
  }

  /* ---------- live NOW / NEXT ---------- */
  function applyLive(host) {
    const state = STATE.get(host);
    if (!state) return;
    const live = liveState(state.record);
    const key = live ? [state.day, live.current?.d, live.current?.i, live.next?.d, live.next?.i,
      live.rows.filter(r => r.end <= live.now).length].join('|') : 'off';
    const track = host.querySelector('.ob-track');
    if (!track || track.dataset.live === key) return;
    track.dataset.live = key;
    track.classList.toggle('is-live', !!live);
    track.querySelectorAll('.ob-row[data-row]').forEach(li => {
      const i = Number(li.dataset.row);
      const row = live?.rows.find(r => r.d === state.day && r.i === i);
      const isNow = !!(live?.current && live.current.d === state.day && live.current.i === i);
      const isNext = !!(live?.next && live.next.d === state.day && live.next.i === i);
      li.classList.toggle('is-now', isNow);
      li.classList.toggle('is-next', isNext);
      li.classList.toggle('is-past', !!(row && row.end <= live.now));
      if (isNow) li.setAttribute('aria-current', 'time'); else li.removeAttribute('aria-current');
      li.querySelector('.ob-chips').innerHTML =
        isNow ? '<span class="ob-chip ob-chip-now"><i aria-hidden="true"></i>Now</span>' :
        isNext ? '<span class="ob-chip ob-chip-next">Next</span>' : '';
    });
  }
  const tick = () => STATE.forEach((_, host) => applyLive(host));

  /* ---------- boot ---------- */
  async function initialize() {
    try {
      const response = await fetch('assets/data/itineraries.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      RECORDS = data.committees || {};
      COMMON = data.common || null;

      let dalalOpen = DALAL_PAGE.classList.contains('open');
      render(DALAL, 'DALAL', DALAL_PAGE);
      new MutationObserver(() => {
        const open = DALAL_PAGE.classList.contains('open');
        if (open && !dalalOpen) render(DALAL, 'DALAL', DALAL_PAGE); // replay the reveal on each visit
        dalalOpen = open;
      }).observe(DALAL_PAGE, { attributes: true, attributeFilter: ['class'] });

      let currentCode = '', sharedOpen = false;
      const update = () => {
        const code = SHARED_PAGE.dataset.committee;
        const open = SHARED_PAGE.classList.contains('open');
        if (code && (code !== currentCode || !SHARED.children.length || (open && !sharedOpen))) {
          currentCode = code;
          render(SHARED, code, SHARED_PAGE);
        }
        sharedOpen = open;
      };
      new MutationObserver(update).observe(SHARED_PAGE, {
        attributes: true, attributeFilter: ['class', 'data-committee']
      });
      update();

      setInterval(tick, 30000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    } catch (error) {
      console.warn('Committee itinerary could not load:', error);
      for (const host of [SHARED, DALAL]) {
        host.innerHTML = '<p class="ob-error">The order of business is temporarily unavailable.</p>';
      }
    }
  }
  initialize();
})();
