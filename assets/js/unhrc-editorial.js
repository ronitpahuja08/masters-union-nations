/* UNHRC editorial film treatment, after original UNHRC scenes and before the cinema controller.
   The official UDHR article numbers and paraphrases come from https://www.un.org/en/about-us/universal-declaration-of-human-rights .
   Photographic sources are illustrative, not event or UNHRC footage. */
(() => {
  'use strict';
  const scenes=window.MUNScenes;
  if(!scenes?.intro?.UNHRC || !scenes?.hero?.UNHRC)return;
  const originalIntro=scenes.intro.UNHRC;
  const originalHero=scenes.hero.UNHRC;
  const rights=[
    {n:'01',type:'EQUAL DIGNITY',line:'BORN FREE. BORN EQUAL.',source:'UNIVERSAL DECLARATION OF HUMAN RIGHTS'},
    {n:'03',type:'LIFE & LIBERTY',line:'LIFE. LIBERTY. SECURITY.',source:'UNIVERSAL DECLARATION OF HUMAN RIGHTS'},
    {n:'19',type:'FREEDOM OF EXPRESSION',line:'LET EVERY VOICE BE HEARD.',source:'UNIVERSAL DECLARATION OF HUMAN RIGHTS'},
    {n:'20',type:'PEACEFUL ASSEMBLY',line:'THE RIGHT TO GATHER.',source:'UNIVERSAL DECLARATION OF HUMAN RIGHTS'}
  ];
  const panels=rights.map((r,i)=>`<section class="ur-article ur-article-${i+1}" aria-hidden="true">
    <span class="ur-article-rule"></span>
    <p class="ur-article-type">UDHR / ARTICLE ${r.n} · ${r.type}</p>
    <strong>${r.line}</strong>
    <small>${r.source}</small>
  </section>`).join('');
  const editorial=`<div class="ur-rights-track" aria-hidden="true">
    <div class="ur-rights-rail"><span>ACCOUNTABILITY</span><i></i><span>PROTECTION</span><i></i><span>HUMAN DIGNITY</span></div>
    ${panels}
    <div class="ur-pulse-line"><span></span></div>
    <div class="ur-cinematic-count">01 — 04 / THE RIGHTS OF EVERY PERSON</div>
    <div class="ur-red-wipe"></div>
    <div class="ur-blackout-beat"></div>
  </div>`;
  // Attach editorial to the outer scene, not a specific photograph, so its timing
  // remains synchronized with the original 7.4-second timeline.
  const last=originalIntro.lastIndexOf('</div>');
  scenes.intro.UNHRC=originalIntro.slice(0,last)+editorial+originalIntro.slice(last);
  const drips=[
    [2,29,0],[8,51,.35],[17,40,.14],[26,65,.6],[35,33,.12],
    [43,57,.41],[51,48,.09],[60,69,.55],[69,39,.23],[78,56,.7],[88,34,.3],[96,64,.52]
  ];
  const blood=`<div class="ur-blood-flow" aria-hidden="true">
    <div class="ur-blood-edge"></div>
    ${drips.map(([x,h,delay],i)=>`<i class="ur-blood-drop" style="--blood-x:${x}%;--blood-h:${h}vh;--blood-delay:${delay}s;--blood-i:${i};--blood-t:${(1.6+i*.11).toFixed(2)}s"></i>`).join('')}
  </div>`;
  const paper=`<div class="ur-hero-poster" aria-hidden="true">
    <div class="ur-poster-center-architecture"></div>
    <div class="ur-editorial-scrim"></div>
    <div class="ur-news-fragment ur-news-left"><small>UDHR · ARTICLE 01</small><b>EQUAL IN DIGNITY.</b><span>THE WORLD MUST LISTEN.</span></div>
    <div class="ur-news-fragment ur-news-right"><small>UDHR · ARTICLE 20</small><b>THE RIGHT TO ASSEMBLE.</b><span>PROTECTION · ACCOUNTABILITY</span></div>
    <div class="ur-poster-grain"></div>
    ${blood}
  </div>`;
  const heroEnd=originalHero.lastIndexOf('</div>');
  scenes.hero.UNHRC=originalHero.slice(0,heroEnd)+paper+originalHero.slice(heroEnd);
})();