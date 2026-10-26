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

  /* ---------- IPL: stadium, an animated batter, the ball, fan placards ---------- */
  const iplField = `
    <div class="ms-beam b1"></div><div class="ms-beam b2"></div><div class="ms-beam b3"></div>
    <div class="ms-crowd">${stars(46, 7)}</div>`;
  const batter = `<svg class="ms-bat" viewBox="0 0 400 600" aria-hidden="true">
    <ellipse cx="200" cy="588" rx="120" ry="10" fill="#000" opacity=".45"/>
    <g class="bt-body">
      <path d="M186 335 L150 470 L142 565" stroke="#f1f3f8" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M214 335 L252 470 L266 565" stroke="#e4e8f2" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <ellipse cx="140" cy="574" rx="26" ry="11" fill="#111"/><ellipse cx="272" cy="574" rx="26" ry="11" fill="#111"/>
      <path d="M200 340 L200 212" stroke="#1d4fc0" stroke-width="70" stroke-linecap="round"/>
      <path d="M170 250 H230" stroke="#ffd24a" stroke-width="8" stroke-linecap="round"/>
      <circle cx="214" cy="146" r="31" fill="#d9a17a"/>
      <path d="M182 150 A32 32 0 0 1 246 138 L246 152 L190 156 Z" fill="#14388f"/>
      <path d="M232 150 H258 L252 168 H232 Z" fill="#14388f" opacity=".85"/>
    </g>
    <g class="bt-arms">
      <path d="M200 220 L250 220" stroke="#1d4fc0" stroke-width="26" stroke-linecap="round"/>
      <path d="M244 220 L330 220" stroke="#7a5230" stroke-width="14" stroke-linecap="round"/>
      <path d="M318 220 L438 220" stroke="#e9c885" stroke-width="40" stroke-linecap="round"/>
      <path d="M326 212 L432 212" stroke="#fff6dc" stroke-width="6" stroke-linecap="round" opacity=".7"/>
      <circle cx="252" cy="220" r="13" fill="#d9a17a"/>
    </g>
  </svg>`;
  /* [code, name, colour, text colour, bid in CR, seat angle on the arc, order in which they bid] */
  const teams = [['MI','MUMBAI INDIANS','#1b6bd6','#fff','2.0',190,0],['RCB','ROYAL CHALLENGERS BENGALURU','#d4202e','#fff','5.0',150,2],['KKR','KOLKATA KNIGHT RIDERS','#5b2a86','#ffd24a','9.5',110,4],['SRH','SUNRISERS HYDERABAD','#f26a21','#1b1030','7.5',70,3],['RR','RAJASTHAN ROYALS','#e8338b','#fff','3.5',30,1],['CSK','CHENNAI SUPER KINGS','#f7c61b','#1a2a6c','12.0',-10,5]];
  const bidAt = o => (0.9 + o * 0.6).toFixed(2);
  const seats = teams.map(([c,n,bg,fg,v,ang,o],i)=>{const r=ang*Math.PI/180,x=(50+38*Math.cos(r)).toFixed(1),y=(64-42*Math.sin(r)).toFixed(1);const win=o===5;
    return `<div class="ms-seat" style="--x:${x}vw;--y:${y}vh;--i:${i};--t:${bidAt(o)}s;--r:${((90-ang)*0.12).toFixed(1)}deg"><div class="pd ${win?'win':''}" style="--bg:${bg};--fg:${fg}"><b>${c}</b><small>${n}</small><em>₹ ${v} CR</em></div><i></i></div>`}).join('');
  const bidOrder = teams.slice().sort((a,b)=>a[6]-b[6]);
  const cbs = bidOrder.map(([c,n,bg,fg,v,ang,o])=>`<div class="cb ${o===5?'last':''}" style="--t:${bidAt(o)}s"><b>₹ ${v} CR</b><em style="--bg:${bg};--fg:${fg}">${n}</em></div>`).join('');
  const podium = `<div class="ms-podium"><small>LOT 07 · ALL-ROUNDER · BASE ₹ 2.0 CR</small>
    <div class="who"><i></i><b>PLAYER<br>AUCTION</b></div>
    <div class="curr"><span>CURRENT BID</span><div class="cbs">${cbs}</div></div>
    <div class="ms-ring2"></div>
    <div class="ms-sold"><b>SOLD</b><small>₹ 12.0 CR · CHENNAI SUPER KINGS</small></div>
    <svg class="ms-gavel2" viewBox="0 0 120 120" aria-hidden="true"><g class="gv"><rect x="20" y="52" width="86" height="12" rx="6" fill="#8a5a2b"/><rect x="2" y="34" width="38" height="46" rx="8" fill="#e9c885"/></g></svg></div>`;
  const iplIntro = `${iplField}<div class="ms-ipl"><div class="ms-shade i"></div><div class="ms-stagelight"></div><div class="ms-floor"></div><div class="ms-aucthead"><small>LIVE · PLAYER AUCTION</small></div>${seats}${podium}</div><div class="ms-flash"></div>`;
  const placard = (cls, word, sub) => `<div class="ms-card ${cls}"><div class="pc"><b>${word}</b>${sub?`<small>${sub}</small>`:''}</div><i></i></div>`;
  const squad = [['rcb','RCB','#d4202e'],['csk','CSK','#f7c61b'],['mi','MI','#1b6bd6'],['pbks','PBKS','#e0262d'],['lsg','LSG','#1d6fd0'],['srh','SRH','#f26a21']];
  const iplHero = `<div class="ms-sky"></div>${iplField}
    <div class="ms-pitch"></div>
    <div class="ms-squad">${squad.map(([f,t,c],i)=>`<figure class="ms-player" style="--i:${i};--c:${c}"><img src="assets/images/ipl-players/${f}.webp" alt="" loading="eager" decoding="async"><figcaption>${t}</figcaption></figure>`).join('')}</div>`;

  /* ---------- STARTUP: San Francisco demo day, the founder journey ---------- */
  const skyline = `<svg class="ms-skyline" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g fill="#0b0716">${[[30,90,60],[100,140,50],[160,70,40],[210,170,64],[285,110,46],[340,200,52],[400,95,40],[450,150,58],[520,80,44],[900,120,56],[964,180,50],[1020,100,46],[1076,150,60],[1146,90,44]].map(([x,h,w])=>`<rect x="${x}" y="${220-h}" width="${w}" height="${h}"/>`).join('')}
    <path d="M560 220 V70 L580 20 L600 70 V220 Z"/><path d="M620 220 V120 L650 40 L680 120 V220 Z"/></g>
    <g fill="#ffcf8a">${Array.from({length:60},(_,i)=>`<rect class="w" x="${(i*53)%1160+14}" y="${70+(i*37)%130}" width="4" height="5" style="animation-delay:${(i%9)*.35}s"/>`).join('')}</g>
  </svg>`;
  const beat = (cls, step, big, sub, extra='') => `<div class="ms-beat ${cls}"><small>${step}</small><b>${big}</b><span>${sub}</span>${extra}</div>`;
  const card = (cls, step, title, sub) => `<div class="ms-node ${cls}"><small>${step}</small><b>${title}</b><span>${sub}</span></div>`;
  const startupIntro = `<div class="ms-sun"></div><div class="ms-fog f1"></div><div class="ms-fog f2"></div>${skyline}<div class="ms-shade"></div>
    <svg class="ms-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path class="l1" pathLength="1" d="M17 31 V69"/><path class="l2" pathLength="1" d="M17 69 H83"/><path class="l3" pathLength="1" d="M83 69 V31"/><path class="l4" pathLength="1" d="M83 31 H17"/>
      <path class="sp s1" pathLength="1" d="M26 31 L50 49"/><path class="sp s2" pathLength="1" d="M26 69 L50 49"/><path class="sp s3" pathLength="1" d="M74 31 L50 49"/><path class="sp s4" pathLength="1" d="M74 69 L50 49"/>
    </svg>
    ${card('n1','01 · THE SPARK','IDEA','Big enough to quit your plans for.')}
    ${card('n2','02 · BUILD','MVP','Ship it ugly. Ship it fast.')}
    ${card('n3','03 · DEMO DAY','PITCH','Two minutes. One shot.')}
    ${card('n4','04 · INVESTORS','TERM SHEET','Equity, runway, a handshake.')}
    <div class="ms-core"><small>VALUATION</small><div class="ms-vnum" aria-hidden="true"></div><div class="ms-vfinal">$1B</div><span class="ms-uni">UNICORN STATUS UNLOCKED</span></div>
    <div class="ms-coins">${stars(22, 3)}</div>`;
  const startupHero = `<div class="ms-sun"></div><div class="ms-fog f1"></div><div class="ms-fog f2"></div>${skyline}
    <div class="ms-ticker"><span>SEED $2M</span><span>SERIES A $14M</span><span>SERIES B $60M</span><span>VALUATION $1B</span></div>
    <div class="ms-coins">${stars(14, 5)}</div>`;

  /* ---------- UNHRC: "human rights" in the six UN languages ---------- */
  const flags = ['#c8102e','#0a3d91','#f6c915','#1f7a3d','#e87722','#6b3fa0','#0a8f8f','#a31621','#2a4f9a','#f0f0f0','#14702d','#d4a017'];
  const flagRow = `<div class="ms-flags">${flags.map((c,i)=>`<span style="--c:${c};--i:${i}"><em></em></span>`).join('')}</div>`;
  const langs = [['HUMAN RIGHTS','ENGLISH','en'],['DROITS HUMAINS','FRANÇAIS','fr'],['ПРАВА ЧЕЛОВЕКА','РУССКИЙ','ru'],['حقوق الإنسان','العربية','ar'],['人权','中文','zh'],['DERECHOS HUMANOS','ESPAÑOL','es']];
  const langHTML = (cls) => `<div class="ms-lang ${cls}">${langs.map(([w,n,l],i)=>`<div style="--i:${i}" lang="${l}"><b>${w}</b><small>${n}</small></div>`).join('')}</div>`;
  const wreath = `<svg class="ms-wreath" viewBox="-120 -120 240 240" aria-hidden="true"><g fill="#cfe9ff">${Array.from({length:22},(_,i)=>{const a=i*(360/22);return `<g transform="rotate(${a}) rotate(${i%2?18:-18} 0 -92)"><ellipse class="lf" style="--d:${(i*.045).toFixed(2)}s" cx="0" cy="-92" rx="5" ry="14"/></g>`}).join('')}</g></svg>`;
  const rings = `<div class="ms-rings"><i></i><i></i><i></i><i></i></div>`;
  const pops = [['HUMAN RIGHTS','ENGLISH','en'],['LIBERTÉ','FRANÇAIS','fr'],['СВОБОДА','РУССКИЙ','ru'],['كرامة','العربية','ar'],['FREEDOM','ENGLISH','en'],['正义','中文','zh'],['JUSTICIA','ESPAÑOL','es'],['DIGNITY','ENGLISH','en'],['EQUALITY','ENGLISH','en'],['ÉGALITÉ','FRANÇAIS','fr']];
  const popHTML = pops.slice(0,10).map(([w,n,l],i)=>`<div class="ms-pop ${i%2?'r':'l'}" style="--i:${i};--y:${[12,26,40,54,64,33][i%6]}%" lang="${l}"><b>${w}</b><small>${n}</small></div>`).join('');
  const globe = `<svg class="ms-globe" viewBox="-60 -60 120 120" aria-hidden="true"><circle r="50" fill="#0b2a52" fill-opacity=".55" stroke="#9ed0ff" stroke-width="1.4"/>
    <g fill="none" stroke="#9ed0ff" stroke-width=".8" opacity=".85"><ellipse class="m m1" rx="50" ry="50"/><ellipse class="m m2" rx="50" ry="50"/><ellipse class="m m3" rx="50" ry="50"/><path d="M-50 0H50M-43 -25H43M-43 25H43M-26 -43H26M-26 43H26"/></g></svg>`;
  const unhrcIntro = `<div class="ms-shade u"></div>${rings}${wreath}${globe}
    <div class="ms-udhr"><small>UNIVERSAL DECLARATION OF HUMAN RIGHTS · 30 ARTICLES</small><div class="ms-art"></div></div>
    ${popHTML}${flagRow}<div class="ms-stars" style="inset:0">${stars(26, 11)}</div>`;
  const unhrcHero = `<div class="ms-shade u"></div>${rings}${langHTML('hero')}${flagRow}<div class="ms-stars" style="inset:0">${stars(18, 2)}</div>`;

  /* ---------- CCEP: Singapore harbour, trade arcs, ships, tickers ---------- */
  const ports = [[120,330],[300,170],[500,250],[700,130],[880,280],[640,360]];
  const arcs = ports.slice(0,-1).map((p,i)=>{const q=ports[i+1];return `<path d="M${p[0]} ${p[1]} Q${(p[0]+q[0])/2} ${Math.min(p[1],q[1])-110} ${q[0]} ${q[1]}" pathLength="1" style="--d:${i*.45}s"/>`}).join('');
  const arcSVG = `<svg class="ms-arcs" viewBox="0 0 1000 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>${arcs}</g>${ports.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="6" style="--d:${i*.4}s"/>`).join('')}</svg>`;
  const ship = (() => {
    const pal = ['#d9412b','#1f8fd1','#f1b21c','#2da36b','#e8e2d4','#8a3fb0','#e0662a','#2a5fa8'];
    let box = '', k = 7;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) {
      k = (k * 37 + 11) % 97; const col = pal[k % pal.length], x = 44 + c * 22.4, y = 118 - (r + 1) * 17;
      box += `<g><rect x="${x}" y="${y}" width="21.4" height="16.2" fill="${col}"/><path d="M${x+4} ${y}V${y+16.2}M${x+8.5} ${y}V${y+16.2}M${x+13} ${y}V${y+16.2}M${x+17.5} ${y}V${y+16.2}" stroke="#0004" stroke-width=".9"/><rect x="${x}" y="${y}" width="21.4" height="2.2" fill="#fff3"/><rect x="${x}" y="${y+14}" width="21.4" height="2.2" fill="#0003"/></g>`;
    }
    return `<div class="ms-ship"><svg viewBox="0 0 640 230" aria-hidden="true">
      <defs><linearGradient id="shH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3f52"/><stop offset=".55" stop-color="#16222f"/><stop offset="1" stop-color="#0a121b"/></linearGradient>
      <linearGradient id="shW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bf2a22"/><stop offset="1" stop-color="#6f1612"/></linearGradient>
      <linearGradient id="shB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f6f8"/><stop offset="1" stop-color="#c9d1d9"/></linearGradient>
      <linearGradient id="shSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f4a5c" stop-opacity=".85"/><stop offset="1" stop-color="#062630" stop-opacity="0"/></linearGradient></defs>
      <path d="M0 196 Q80 188 160 196 T320 196 T480 196 T640 196 V230 H0Z" fill="url(#shSea)"/>
      <path d="M12 118 H624 L600 186 Q596 198 580 198 H64 Q44 198 34 182 Z" fill="url(#shH)"/>
      <path d="M26 168 H610 L600 186 Q596 198 580 198 H64 Q44 198 34 182 Z" fill="url(#shW)"/>
      <path d="M12 118 H624" stroke="#8fa3b5" stroke-width="2"/><path d="M44 134H600" stroke="#ffffff22" stroke-width="1.4"/>
      ${box}
      <rect x="430" y="40" width="64" height="80" rx="3" fill="url(#shB)"/><rect x="424" y="34" width="76" height="12" rx="2" fill="#dfe5ea"/>
      <g fill="#14303f">${[0,1,2,3].map(i=>`<rect x="${436+i*14}" y="52" width="9" height="6"/>`).join('')}${[0,1,2,3].map(i=>`<rect x="${436+i*14}" y="68" width="9" height="6"/>`).join('')}${[0,1,2,3].map(i=>`<rect x="${436+i*14}" y="84" width="9" height="6"/>`).join('')}</g>
      <rect x="500" y="62" width="30" height="58" fill="#1f5f8b"/><rect x="500" y="62" width="30" height="9" fill="#d9412b"/>
      <path d="M462 34V10M462 10H478M462 22H474" stroke="#cfd6dd" stroke-width="2"/><circle cx="462" cy="9" r="2" fill="#ff4a3a"/>
      <path d="M624 118 L640 128 L618 134Z" fill="#0f1a24"/>
      <path d="M0 197 Q60 190 120 197 T240 197" stroke="#ffffffaa" stroke-width="2.4" fill="none" opacity=".55"/><path d="M60 205 Q140 199 220 205 T380 205" stroke="#ffffff55" stroke-width="2" fill="none"/>
    </svg></div>`;
  })();
  const quotes = ['USD/SGD 1.34 ▲','BRENT 82.4 ▼','GDP +4.2%','TARIFF 0%','FTA SIGNED','SOX 5,120 ▲','TEU 39.0M ▲'];
  const ccepTicker = `<div class="ms-quotes"><div>${quotes.concat(quotes).map(q=>`<span>${q}</span>`).join('')}</div></div>`;
  const ccepIntro = `<div class="ms-grid3"></div>${arcSVG}${ship}${ccepTicker}
    <div class="ms-skyline2"></div>
    <div class="ms-ledger"><small>GLOBAL TRADE NETWORK</small><b>DEAL CLOSED</b><span>POLICY · ENTERPRISE · COMMERCE</span></div>`;
  const ccepHero = `<div class="ms-grid3"></div>${arcSVG}${ship}<div class="ms-skyline2"></div>${ccepTicker}`;

  const onPlay = (code, root) => {
    if (code !== 'STARTUP') return;
    const el = root.querySelector('.ms-vnum'); if (!el) return;
    const t0 = performance.now() + 350, dur = 3200, a = 1e4, b = 1e8;
    const fmt = v => v >= 1e6 ? '$' + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : '$' + Math.round(v / 1e3) + 'K';
    el.textContent = fmt(a);
    const timer = setInterval(() => {
      if (!el.isConnected || !root.classList.contains('playing')) { clearInterval(timer); return; }
      const p = Math.min(1, Math.max(0, (performance.now() - t0) / dur));
      el.textContent = p >= 1 ? '$100M' : fmt(a * Math.pow(b / a, p));
      if (p >= 1) clearInterval(timer);
    }, 40);
  };
  window.MUNScenes = {
    onPlay,
    durations: { IPL: 6400, STARTUP: 7600, UNHRC: 7400, CCEP: 5400 },
    intro: { IPL: iplIntro, STARTUP: startupIntro, UNHRC: unhrcIntro, CCEP: ccepIntro },
    hero:  { IPL: iplHero, STARTUP: startupHero, UNHRC: unhrcHero, CCEP: ccepHero }
  };
})();
