/* Masters' Union Nations URL routing.
 * Retains the existing cinematic single-document experience. Browser routes
 * are real, reloadable Vercel paths, while in-site transitions stay client-side. */
(() => {
  'use strict';
  const HOME = '/';
  const MAP = '/world-map/';
  const SLUGS = Object.freeze({
    UNHRC: 'unhrc',
    MCC: 'mcc',
    CCEP: 'ccep',
    IPL: 'ipl',
    AIPPM: 'aippm',
    DALAL: 'dalal-street',
    STARTUP: 'startup-boardroom',
    IP: 'international-press'
  });
  const NAMES = Object.freeze({
    UNHRC: 'UN Human Rights Council',
    MCC: 'Midnight Crisis Committee',
    CCEP: 'CCEP',
    IPL: 'Indian Premier League',
    AIPPM: 'All India Political Parties Meet',
    DALAL: 'Dalal Street',
    STARTUP: 'Startup Boardroom',
    IP: 'International Press'
  });
  const BY_SLUG = Object.fromEntries(Object.entries(SLUGS).map(([code, slug]) => [slug, code]));
  BY_SLUG.startup = 'STARTUP'; // Compatibility for short links
  BY_SLUG.ip = 'IP';
  const BASE_TITLE = "Masters' Union Nations — ZERO: The World Reset";
  let applying = false;

  function read(path = location.pathname) {
    const slug = String(path).replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!slug) return { kind: 'home', path: HOME };
    if (slug === 'world-map') return { kind: 'map', path: MAP };
    const code = BY_SLUG[slug];
    return code ? { kind: 'committee', code, path: '/' + SLUGS[code] + '/' } : { kind: 'unknown', path };
  }
  function stateFor(route, returnMap = false) {
    return { munPage: route.kind, munCommittee: route.code || null, munReturnMap: returnMap };
  }
  function titleFor(route) {
    if (route.kind === 'committee') return NAMES[route.code] + ' | ' + BASE_TITLE;
    if (route.kind === 'map') return 'World Map | ' + BASE_TITLE;
    return BASE_TITLE;
  }
  function updateTitle(route) {
    document.title = titleFor(route);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://www.mastersunionmun.com' + route.path;
  }
  function apply(route) {
    if (route.kind === 'unknown') return;
    applying = true;
    try {
      const app = window.MUNApp;
      const home = window.MUNHomeNavigation;
      if (route.kind === 'committee') {
        home?.goto('map');
        app?.showCommittee(route.code);
      } else {
        app?.closeActive();
        home?.goto(route.kind === 'map' ? 'map' : 'top');
      }
      updateTitle(route);
    } finally {
      applying = false;
    }
  }
  function push(route, returnMap = false) {
    if (read().path === route.path) return false;
    history.pushState(stateFor(route, returnMap), '', route.path);
    updateTitle(route);
    return true;
  }
  function navigateSection(where) {
    const target = where === 'map' ? { kind: 'map', path: MAP } : { kind: 'home', path: HOME };
    push(target);
    apply(target);
  }
  function onCommitteeOpening(code) {
    if (applying || !Object.hasOwn(SLUGS, code)) return;
    const route = read();
    if (route.kind === 'committee' && route.code === code) return;
    // Scrolling from the homepage to the map may not have produced a map
    // history entry yet. Preserve it so Back always lands on the world map.
    if (route.kind === 'home') push({ kind: 'map', path: MAP });
    push({ kind: 'committee', code, path: '/' + SLUGS[code] + '/' }, true);
  }
  function onCommitteeClosed() {
    if (applying) return;
    const route = read();
    if (route.kind !== 'committee') return;
    if (history.state?.munReturnMap === true) {
      history.back(); // Popstate will restore the map, not leave the website.
    } else {
      // A visitor who loaded /aippm/ directly has no previous map entry.
      const map = { kind: 'map', path: MAP };
      history.replaceState(stateFor(map), '', MAP);
      apply(map);
    }
  }

  // Known deep links are served by Vercel's path rewrites to index.html.
  // Only normalize URL syntax: never remount or rerun a cinematic on refresh.
  let initial = read();
  if (initial.kind !== 'unknown') {
    const keepSearch = location.search || '';
    const keepHash = location.hash || '';
    const originalState = history.state;
    const returnMap = Boolean(originalState?.munReturnMap);
    if (location.pathname !== initial.path || !originalState?.munPage) {
      history.replaceState(stateFor(initial, returnMap), '', initial.path + keepSearch + keepHash);
    }
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.MUNRouter = { read, navigateSection, onCommitteeOpening, onCommitteeClosed };

  window.addEventListener('popstate', () => apply(read()));

  // When scrolling naturally through the full cinematic to the world map,
  // give the map a history entry as well. The route is not changed mid-scene.
  window.addEventListener('journey', e => {
    if (applying || document.body.classList.contains('overlay')) return;
    if (e.detail >= .995 && read().kind === 'home') {
      push({ kind: 'map', path: MAP });
    }
  });

  // With <base href="/">, relative assets resolve correctly on /aippm/.
  // In-page #section links still scroll inside the committee overlay instead
  // of accidentally requesting the homepage.
  document.addEventListener('click', e => {
    const link = e.target.closest?.('a[href^="#"]');
    if (!link || link.hasAttribute('data-goto')) return;
    const id = link.getAttribute('href')?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, true);

  if (initial.kind !== 'unknown') updateTitle(initial);
  if (initial.kind === 'map' || initial.kind === 'committee') {
    // Wait one frame for the original map layout before opening the route.
    requestAnimationFrame(() => apply(initial));
  }
})();
