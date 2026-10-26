/* Bespoke animated scenes for IPL, STARTUP, UNHRC and CCEP.
   committee-cinematics.js asks window.MUNScenes for an intro (click cinematic)
   and a hero (committee-page background) before falling back to its defaults. */
(function(){
  const stars = (n, seed) => {
    let s = seed, out = '';
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) out += `<i style="left:${(r()*100).toFixed(1)}%;top:${(r()*100).toFixed(1)}%;animation-delay:${(r()*3).toFixed(2)}s"></i>`;
    return out;
  };

  /* ---------- IPL: stadium, batter, ball, SIX ---------- */
  const iplField = `
    <div class="ms-beam b1"></div><div class="ms-beam b2"></div><div class="ms-beam b3"></div>
    <div class="ms-crowd">${stars(46, 7)}</div>`;
  const iplIntro = `${iplField}
    <img class="ms-batter" src="assets/images/ipl-batsman.png" alt="">
    <div class="ms-ball"></div><div class="ms-trail"></div>
    <div class="ms-impact"></div>
    <div class="ms-six"><b>SIX!</b><small>OUT OF THE PARK</small></div>
    <div class="ms-scoreboard"><span>LIVE · MASTERS UNION PREMIER LEAGUE</span><b>MUN 184/3</b><small>OVER 19.4</small></div>`;
  const iplHero = `<div class="ms-sky"></div>${iplField}
    <div class="ms-pitch"></div>
    <img class="ms-batter" src="assets/images/ipl-batsman.png" alt="">
    <div class="ms-ball"></div><div class="ms-trail"></div><div class="ms-impact"></div>
    <div class="ms-six"><b>SIX!</b></div>
    <div class="ms-ticker"><span>● LIVE</span><span>FRANCHISE AUCTION</span><span>PURSE ₹120 CR</span><span>SOLD</span></div>`;

  /* ---------- STARTUP: San Francisco demo day ---------- */
  const bridge = `<svg class="ms-bridge" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g fill="none" stroke="#ff7a4d" stroke-width="3">
      <path d="M0 220 Q300 120 420 120 Q600 120 780 220"/><path d="M420 120 Q600 235 780 120" opacity="0" />
      <path d="M0 232 L1200 232" stroke-width="5"/>
      <path d="M180 232 V96 M180 96 L180 232" stroke-width="9"/><path d="M880 232 V96" stroke-width="9"/>
      <path d="M180 96 Q530 238 880 96"/><path d="M180 96 Q40 170 0 220"/><path d="M880 96 Q1040 170 1200 220"/>
    </g>
    <g stroke="#ff7a4d" stroke-width="1.2" opacity=".6">${Array.from({length:22},(_,i)=>`<path d="M${230+i*30} ${232} V${150+Math.abs(i-11)*5}"/>`).join('')}</g>
  </svg>`;
  const skyline = `<svg class="ms-skyline" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g fill="#0b0716">${[[30,90,60],[100,140,50],[160,70,40],[210,170,64],[285,110,46],[340,200,52],[400,95,40],[450,150,58],[520,80,44],[900,120,56],[964,180,50],[1020,100,46],[1076,150,60],[1146,90,44]].map(([x,h,w])=>`<rect x="${x}" y="${220-h}" width="${w}" height="${h}"/>`).join('')}
    <path d="M560 220 V70 L580 20 L600 70 V220 Z"/><path d="M620 220 V120 L650 40 L680 120 V220 Z"/></g>
    <g fill="#ffcf8a">${Array.from({length:60},(_,i)=>`<rect class="w" x="${(i*53)%1160+14}" y="${70+(i*37)%130}" width="4" height="5" style="animation-delay:${(i%9)*.35}s"/>`).join('')}</g>
  </svg>`;
  const startupIntro = `<div class="ms-sun"></div>${bridge}<div class="ms-fog f1"></div><div class="ms-fog f2"></div>${skyline}
    <div class="ms-deck d1"><small>01 · PROBLEM</small><b>The world is broken.</b></div>
    <div class="ms-deck d2"><small>02 · TRACTION</small><svg viewBox="0 0 200 90"><path class="g" d="M5 80 L45 62 L80 66 L120 38 L160 30 L195 8"/></svg></div>
    <div class="ms-deck d3"><small>03 · THE ASK</small><b>$2M <span>SEED</span></b></div>
    <div class="ms-demo"><span>DEMO DAY · SAN FRANCISCO</span><b>WELCOME TO THE ROOM</b></div>
    <div class="ms-term"><small>TERM SHEET</small><i></i><i></i><i class="s"></i><em>FUNDED</em></div>
    <div class="ms-coins">${stars(18, 3)}</div>`;
  const startupHero = `<div class="ms-sun"></div>${bridge}<div class="ms-fog f1"></div><div class="ms-fog f2"></div>${skyline}
    <div class="ms-ticker"><span>SEED $2M</span><span>SERIES A $14M</span><span>SERIES B $60M</span><span>UNICORN 🦄 $1B</span></div>
    <div class="ms-coins">${stars(14, 5)}</div>`;

  /* ---------- UNHRC: Geneva, flags, dove, Article 1 ---------- */
  const flags = ['#c8102e','#0a3d91','#f6c915','#1f7a3d','#e87722','#6b3fa0','#0a8f8f','#a31621','#2a4f9a','#f0f0f0','#14702d','#d4a017'];
  const flagRow = `<div class="ms-flags">${flags.map((c,i)=>`<span style="--c:${c};--i:${i}"><em></em></span>`).join('')}</div>`;
  const dove = `<svg class="ms-dove" viewBox="0 0 140 90" aria-hidden="true"><path d="M8 52 C34 56 52 48 68 30 C58 24 48 20 40 10 C64 12 82 22 92 38 C104 34 118 36 132 28 C126 46 108 58 86 60 C84 72 72 82 58 84 C62 74 60 66 54 62 C40 66 22 62 8 52Z" fill="#fff"/></svg>`;
  const unhrcIntro = `<div class="ms-mount"></div><div class="ms-lake"></div><div class="ms-stars" style="inset:0">${stars(30, 11)}</div>
    ${dove}${flagRow}
    <div class="ms-article"><small>UNIVERSAL DECLARATION · ARTICLE 1</small>
      <p><span>All human beings are born</span> <span>free and equal</span> <span>in dignity and rights.</span></p></div>
    <div class="ms-gavel"><i></i></div>`;
  const unhrcHero = `<div class="ms-mount"></div><div class="ms-lake"></div>${dove}${flagRow}
    <div class="ms-articles"><span>ARTICLE 1 · DIGNITY</span><span>ARTICLE 3 · LIFE &amp; LIBERTY</span><span>ARTICLE 19 · EXPRESSION</span></div><div class="ms-stars" style="inset:0">${stars(18, 2)}</div>`;

  /* ---------- CCEP: Singapore harbour, trade arcs, ships, tickers ---------- */
  const ports = [[120,330],[300,170],[500,250],[700,130],[880,280],[640,360]];
  const arcs = ports.slice(0,-1).map((p,i)=>{const q=ports[i+1];return `<path d="M${p[0]} ${p[1]} Q${(p[0]+q[0])/2} ${Math.min(p[1],q[1])-110} ${q[0]} ${q[1]}" pathLength="1" style="--d:${i*.45}s"/>`}).join('');
  const arcSVG = `<svg class="ms-arcs" viewBox="0 0 1000 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>${arcs}</g>${ports.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="6" style="--d:${i*.4}s"/>`).join('')}</svg>`;
  const ship = `<div class="ms-ship"><svg viewBox="0 0 220 70" aria-hidden="true"><path d="M4 44 H216 L196 64 H26 Z" fill="#12313a"/><g>${['#ff5a3c','#2fd0b4','#f5c542','#4aa3ff','#ff5a3c','#2fd0b4','#f5c542','#4aa3ff'].map((c,i)=>`<rect x="${30+i*22}" y="${i%2?24:32}" width="20" height="${i%2?20:12}" fill="${c}"/>`).join('')}<rect x="30" y="12" width="20" height="12" fill="#2fd0b4"/></g></svg></div>`;
  const quotes = ['USD/SGD 1.34 ▲','BRENT 82.4 ▼','GDP +4.2%','TARIFF 0%','FTA SIGNED','SOX 5,120 ▲','TEU 39.0M ▲'];
  const ccepTicker = `<div class="ms-quotes"><div>${quotes.concat(quotes).map(q=>`<span>${q}</span>`).join('')}</div></div>`;
  const ccepIntro = `<div class="ms-grid3"></div>${arcSVG}${ship}${ccepTicker}
    <div class="ms-skyline2"></div>
    <div class="ms-ledger"><small>GLOBAL TRADE NETWORK</small><b>DEAL CLOSED</b><span>POLICY · ENTERPRISE · COMMERCE</span></div>`;
  const ccepHero = `<div class="ms-grid3"></div>${arcSVG}${ship}<div class="ms-skyline2"></div>${ccepTicker}`;

  window.MUNScenes = {
    durations: { IPL: 5600, STARTUP: 5600, UNHRC: 5400, CCEP: 5400 },
    intro: { IPL: iplIntro, STARTUP: startupIntro, UNHRC: unhrcIntro, CCEP: ccepIntro },
    hero:  { IPL: iplHero, STARTUP: startupHero, UNHRC: unhrcHero, CCEP: ccepHero }
  };
})();
