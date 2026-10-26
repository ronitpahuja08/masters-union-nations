/* Masters' Union Nations — distinct committee journeys and cinematic hero scenes.
   Standalone extension of the existing boardroom.js journey/page system. */
(() => {
  'use strict';

  const CONFIG = {
    UNHRC: { duration: 7400, city: 'GENEVA / SWITZERLAND', eyebrow: 'THE EVIDENCE FILES', name: 'UNHRC', phrase: 'HUMAN RIGHTS CANNOT WAIT', hero: ['HUMAN RIGHTS', 'CANNOT WAIT.'] },
    CCEP:  { duration: 5400, city: 'SINGAPORE / REPUBLIC OF SINGAPORE', eyebrow: 'A NEW WORLD ECONOMY', name: 'CCEP', phrase: 'THE FUTURE IS NEGOTIABLE', hero: ['THE FUTURE', 'IS NEGOTIABLE.'] },
    IPL:   { duration: 6400, city: 'BENGALURU / INDIA', eyebrow: 'THE AUCTION ROOM', name: 'IPL', phrase: 'GOING ONCE. GOING TWICE. SOLD.', hero: null },
    STARTUP: { duration: 7600, city: 'SAN FRANCISCO / USA', eyebrow: 'DEMO DAY', name: 'STARTUP', phrase: 'BUILD THE NEXT BIG THING', hero: ['STARTUP', 'BOARDROOM.'] },
    AIPPM: { duration: 3800, city: 'NEW DELHI / INDIA', eyebrow: 'THE HOUSE ASSEMBLES', name: 'AIPPM', phrase: 'THE HOUSE IS IN SESSION', hero: ['THE HOUSE', 'IS IN SESSION.'] },
  };
  const HEROES = {
    UNHRC: { hero: ['HUMAN RIGHTS', 'CANNOT WAIT.'], tag: 'JUSTICE WITHOUT BORDERS' },
    CCEP: { hero: ['THE FUTURE', 'IS NEGOTIABLE.'], tag: 'THE COMMERCE OF TOMORROW' },
    AIPPM: { hero: ['THE HOUSE', 'IS IN SESSION.'], tag: 'POLITICS. POLICY. POWER.' },
    STARTUP: { hero: ['STARTUP', 'BOARDROOM.'], tag: 'BUILD THE NEXT BIG THING' },
    IPL: { hero: null, tag: null, sceneOnly: true },
    IP: { hero: ['THE WORLD', 'IS WATCHING.'], tag: 'THE STORY STARTS HERE' }
  };
  const $ = (s, root = document) => root.querySelector(s);
  const videoSrc = 'assets/video/san-francisco-golden-gate-pexels.mp4';
  const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} Q${(x1+x2)/2} ${Math.min(y1,y2)-28} ${x2} ${y2}" />`;
  const routeSVG = `<svg class="mc-route-svg" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">${line(20,460,620,220)}${line(980,435,620,220)}${line(110,150,620,220)}${line(860,90,620,220)}${line(500,520,620,220)}<circle cx="620" cy="220" r="6" /></svg>`;
  const timelineScreens = {
    UNHRC: `<div class="mc-dossier"><small>UN HUMAN RIGHTS COUNCIL</small><b>CASE FILE / 001</b><i></i><span>ACCOUNTABILITY</span><span>PROTECTION</span><span>COOPERATION</span><strong>FOR HUMAN DIGNITY</strong></div><div class="mc-network" aria-hidden="true">${routeSVG}</div>`,
    CCEP: `<div class="mc-network" aria-hidden="true">${routeSVG}</div><div class="mc-trade"><span>GLOBAL TRADE NETWORK</span><b>MARKETS CONNECTED</b><small>POLICY · ENTERPRISE · COMMERCE</small></div>`,
    IPL: `<div class="mc-stadium-beam beam-one"></div><div class="mc-stadium-beam beam-two"></div><div class="mc-auction"><span>LIVE · FRANCHISE AUCTION</span><b>FINAL BID</b><strong>SOLD!</strong><small>THE SEASON STARTS HERE</small></div>`,
    AIPPM: `<div class="mc-door mc-left"></div><div class="mc-door mc-right"></div><div class="mc-session"><span>THE PARLIAMENT OF INDIA</span><b>HOUSE IN SESSION</b><i></i><small>LET THE DEBATE BEGIN</small></div>`
  };
  const sceneBuild = {
    UNHRC: `<div class="ch-photo"></div><div class="ch-grid"></div><div class="ch-document"><small>UNITED NATIONS · GENEVA</small><b>HUMAN RIGHTS</b><span>THE MANDATE IS CLEAR</span><i></i><em>ACCOUNTABILITY / ACTION</em></div><div class="ch-light"></div>`,
    CCEP: `<div class="ch-photo"></div><div class="ch-grid"></div><div class="ch-route">${routeSVG}</div><div class="ch-market"><small>GLOBAL ECONOMY / LIVE</small><b>POLICY SHAPES PROGRESS</b></div><div class="ch-light"></div>`,
    AIPPM: `<div class="ch-photo"></div><div class="ch-grain"></div><div class="ch-parliament-bar"><b>HOUSE IN SESSION</b><span>NEW DELHI · INDIA</span></div><div class="ch-light"></div>`,
    STARTUP: `<div class="ch-photo"></div><video class="ch-video" src="${videoSrc}" poster="assets/images/startup-san-francisco-cinematic.webp" muted loop playsinline preload="metadata" aria-hidden="true"></video><div class="ch-grid"></div><div class="ch-funding"><small>STARTUP / THE PITCH</small><span>SEED</span><i></i><span>SERIES A</span><i></i><b>WHAT'S NEXT?</b></div><div class="ch-light"></div>`,
    IP: `<div class="ch-photo"></div><div class="ch-grain"></div><div class="ch-paper p-one"><small>THE DAILY DISPATCH</small><b>THE WORLD<br>IS WATCHING.</b><span>EXCLUSIVE COVERAGE</span></div><div class="ch-paper p-two"><small>GLOBAL DESK / 001</small><b>ON THE<br>RECORD</b></div><div class="ch-flash"></div>`
  };

  const sceneImages = [
    'assets/images/unhrc-geneva-cinematic.webp',
    'assets/images/ccep-singapore-cinematic.webp',
    'assets/images/ipl-stadium-cinematic.png',
    'assets/images/aippm-parliament-live.png'
  ];
  const warmedImages = [];

  let root, timer, onComplete, active=false;
  function ensureRoot(){
    if (root) return root;
    root = document.createElement('section');
    root.id = 'munCinemaJourney';
    root.className = 'mc-journey';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-labelledby', 'mcHeadingTitle');
    root.innerHTML = `<div class="mc-world"><div class="mc-photo"></div><div class="mc-haze"></div><div class="mc-playfield" id="mcPlayfield"></div><div class="mc-grain"></div></div><div class="mc-top"><span>MASTERS' UNION NATIONS</span><span id="mcTopCity"></span></div><div class="mc-heading"><small id="mcHeadingKicker"></small><h2 id="mcHeadingTitle"></h2><p id="mcHeadingSub"></p></div><div class="mc-bottom"><span>THE WORLD RESET · 2026</span><span>YOUR COMMITTEE AWAITS</span></div><button class="mc-skip" type="button" aria-label="Skip committee animation">Skip intro ↗</button>`;
    document.body.appendChild(root);
    $('.mc-skip', root).addEventListener('click', complete);
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && active) complete(); });
    return root;
  }
  function stop(){
    if (timer) { clearTimeout(timer);timer=null; }
    onComplete=null; active=false;
    if (root) { root.classList.remove('playing');root.setAttribute('aria-hidden','true'); root.removeAttribute('data-code'); }
  }
  function complete(){
    if (!active) return;
    const cb=onComplete;
    stop();
    if (typeof cb==='function') cb();
  }
  function play(code, opts={}) {
    if (!CONFIG[code]) { opts.onComplete?.(); return; }
    stop(); ensureRoot();
    const cfg=CONFIG[code]; onComplete=opts.onComplete; active=true;
    root.dataset.code=code;
    $('#mcTopCity',root).textContent=cfg.city;
    $('#mcHeadingKicker',root).textContent=cfg.eyebrow;
    $('#mcHeadingTitle',root).textContent=cfg.name;
    $('#mcHeadingSub',root).textContent=cfg.phrase;
    $('#mcPlayfield',root).innerHTML=(window.MUNScenes?.intro[code])||timelineScreens[code];
    window.MUNScenes?.onPlay?.(code,root);
    root.setAttribute('aria-hidden','false');
    // Restart CSS timeline even when the same committee is opened twice.
    void root.offsetWidth;
    root.classList.add('playing');
    $('.mc-skip',root).focus({preventScroll:true});
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    timer = setTimeout(complete,reduce?180:cfg.duration);
  }
  function decoratePage(code){
    const page=$('#committeePage');
    const hero=page && $('.cp-hero',page);
    if (!hero || !HEROES[code]) return;
    let scene=$('.cinema-hero-scene',hero);
    if (!scene) {
      scene=document.createElement('div');scene.className='cinema-hero-scene';scene.setAttribute('aria-hidden','true');
      hero.insertBefore(scene,hero.firstChild);
    }
    scene.dataset.code=code;
    scene.innerHTML=(window.MUNScenes?.hero[code])||sceneBuild[code];
    const config=HEROES[code];
    if(config.sceneOnly) return;
    const a=$('#cpHeroA'), b=$('#cpHeroB');
    if(a && b) { a.textContent=config.hero[0];b.textContent=config.hero[1]; }
    let tag=$('.cinema-hero-tag',hero);
    if(!tag) {
      tag=document.createElement('p');
      tag.className='cinema-hero-tag';
      $('#cpTitle').after(tag);
    }
    tag.textContent=config.tag;
    const vid=$('.ch-video',scene);
    if(vid && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) vid.play().catch(()=>{});
  }
  function closePage(){ const vid=$('.cinema-hero-scene .ch-video'); if(vid) vid.pause(); }
  // Prevent the background media from playing after leaving the committee detail page.
  document.addEventListener('DOMContentLoaded',()=>{
    const page=$('#committeePage');
    if (!page) return;
    new MutationObserver(()=>{if(!page.classList.contains('open')) closePage();})
      .observe(page,{attributes:true,attributeFilter:['class']});
    // Avoid downloading every committee background before it is needed.
  });
  window.MUNCommitteeCinematics={play,stop,decoratePage,closePage};
})();
