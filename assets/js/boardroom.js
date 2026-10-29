(()=>{'use strict';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)], wait=ms=>new Promise(r=>setTimeout(r,ms));
const STANDARD=['Strategy','Diplomacy','Negotiation'];
const committees=[
 {code:'UNHRC',full:'United Nations Human Rights Council',city:'GENEVA / SWITZERLAND',lat:46.2044,lon:6.1432,color:'#73a9ff',agenda:"Human trafficking, child exploitation and the Sudan conflict.",intro:"Examine how war in Sudan exposes children to abduction, recruitment and sexual violence. Distinguish child labour, forced labour, trafficking and exploitation, and work within the Council’s mandate.",expect:"Proposals grounded in the Human Rights Council’s mandate, including Special Rapporteur access and a stronger Fact-Finding Mission.",skills:['Human rights','Policy','Consensus']},
 {code:'MCC',full:'Midnight Crisis Committee',city:'NEW YORK / USA',lat:40.7128,lon:-74.006,color:'#a48cff',agenda:"Eternal Court: Afterlife — who killed Death, and who rules in its place?",intro:"The realms are collapsing. Before dawn, the court must answer: who killed Death, and who rules in his place?",expect:"The realms are collapsing. Before dawn, the court must answer: who killed Death, and who rules in Death’s place?",skills:['Crisis','Directives','Adaptability']},
 {code:'CCEP',full:'Committee on Commerce, Enterprise & Policy',city:'SINGAPORE / REPUBLIC OF SINGAPORE',lat:1.3521,lon:103.8198,color:'#3be1c2',agenda:'The next era of markets, enterprise and public policy.',intro:'Where founders, regulators and economies negotiate the rules of tomorrow’s commerce.',expect:'Commercial thinking, policy trade-offs and decisions measured in real-world impact.',skills:['Enterprise','Policy','Economics']},
 {code:'IPL',full:'Indian Premier League',city:'BENGALURU / INDIA',lat:12.9716,lon:77.5946,color:'#ffca4b',agenda:"Franchise auction: plan, bid and build a winning XI.",intro:"Every bid shapes a franchise. Protect your purse, know the player sets and build a balanced squad.",expect:'Live auction dynamics, budget strategy and the electric pace of a broadcast war room.',skills:['Auction','Sports','Analytics']},
 {code:'AIPPM',full:'All India Political Parties Meet',city:'NEW DELHI / INDIA',lat:28.6139,lon:77.209,color:'#ff8c4b',agenda:"एक राष्ट्र, एक संहिता — समान नागरिक संहिता (UCC)",intro:"Represent your party in the UCC debate and weigh equality, religious freedom and federalism.",expect:"Parliamentary negotiation around the Uniform Civil Code, balancing equality, religious freedom and federalism.",skills:['Politics','Oratory','Negotiation']},
 {code:'DALAL',full:'Dalal Street',city:'MUMBAI / INDIA',lat:19.076,lon:72.8777,color:'#65e778',agenda:"IPO underwriting simulation.",intro:"Research the company, do the diligence, set a defensible offer price and negotiate the listing. This is a market simulation, not a parliamentary debate.",expect:'Trading-floor urgency, an evolving market and decisions that immediately affect your position.',skills:['Markets','Finance','Risk']},
 {code:'STARTUP',full:'Startup Boardroom',city:'SAN FRANCISCO / USA',lat:37.7749,lon:-122.4194,color:'#ff5d78',agenda:"Build a venture solving a real Indian problem; pitch to investors in 48 hours.",intro:"Work with your own mentor, sharpen your idea and pitch it to real VCs.",expect:"Work with your own mentor, sharpen your idea and pitch it to real VCs.",skills:['Entrepreneurship','Pitching','Strategy']},
 {code:'IP',full:'International Press',city:'LONDON / UNITED KINGDOM',lat:51.5074,lon:-.1278,color:'#f0e9db',agenda:"Live reporting, photography and caricature across all committees.",intro:"The conference’s independent newsroom. Every story earns points, and the best coverage tops the board. Be ready for a crisis at any time.",expect:"Cover committee proceedings, verify every claim and file reporting, photography or caricature on deadline.",skills:['Journalism','Photography','Editorial']}
];
const committeePageCopy={
 UNHRC:{heroA:'Human rights',heroB:'cannot wait.',lead:"Separate trafficking from labour and exploitation. Protect children at risk in conflict-affected Sudan.",steps:[["Know the difference","Separate child labour, forced labour, trafficking and sexual exploitation, because each needs a different response."],["Focus on Sudan","Examine how the war has exposed children to abduction, recruitment and sexual violence, and what the Council can do about it."],["Act within the mandate","Propose measures the Human Rights Council can actually take, from Special Rapporteur access to strengthening the Fact-Finding Mission."]]},
 MCC:{heroA:"Eternal Court:",heroB:"Afterlife.",lead:"Every power in existence is summoned to the Eternal Court, and every one of them has something to hide.",steps:[["Guard your secrets","Every realm is hiding something. Decide what to reveal."],["Find the killer","Follow the evidence, and the lies, across every realm."],["Claim the throne","Decide who, or what, governs death now."]]},
 CCEP:{heroA:'Shape the rules',heroB:'of tomorrow.',lead:'Balance innovation, market growth and public interest as you set the rules of commerce.',steps:[['Find the trade-off','Understand how a policy decision affects business and the public.'],['Make the case','Use evidence and commercial reasoning to persuade the room.'],['Design the framework','Build workable rules that support responsible growth.']]},
 IPL:{heroA:'IPL',heroB:'',lead:"Build a winning franchise, one bid at a time.",steps:[["Plan","Know what your squad needs."],["Bid","Spend smart, not fast."],["Build","Turn signings into a winning XI."]]},
 AIPPM:{heroA:'The House is',heroB:'in session.',lead:"Equality, faith and federalism meet at one table. Build consensus without losing conviction.",steps:[["Know your position","Study your party’s position on the Uniform Civil Code (UCC)."],["Debate the agenda","Explore equality, faith, religious freedom and federalism."],["Build consensus","Negotiate a workable position without losing conviction."]]},
 STARTUP:{heroA:'Bring an idea',heroB:'to the table.',lead:"You have 48 hours to build a venture that solves a real Indian problem, then pitch it to VCs and Sharks and let’s see how well you can defend it.",steps:[["Build with a mentor","One mentor per team, guiding you from idea to pitch."],["Defend the model","Show your venture holds up when the numbers are questioned."],["Pitch to real VCs","Make your case to investors who back startups for a living."]]},
 IP:{heroA:'The story is',heroB:'still developing.',lead:"Cover every committee live as it unfolds: report, photograph and caricature the summit in real time. Be ready for a horse trade in other committees.",steps:[["Chase the story","Move between committees and catch the moments that matter."],["Verify the facts","Check every claim before it goes live."],["Go live, score points","File on deadline and climb the newsroom leaderboard."]]}
};
committees.forEach(c=>Object.assign(c,committeePageCopy[c.code]||{}));
const committeeAwards={
 UNHRC:[['Total Prize Pool','₹30,000']],
 MCC:[['Total Prize Pool','₹30,000']],
 CCEP:[['Total Prize Pool','₹30,000']],
 IPL:[['Total Prize Pool','₹20,000']],
 AIPPM:[['Total Prize Pool','₹30,000']],
 DALAL:[['Total Prize Pool','₹20,000']],
 STARTUP:[['Total Prize Pool','₹45,000']],
 IP:[['Total Prize Pool','₹15,000']]
};
committees.forEach(c=>c.awards=committeeAwards[c.code]);
function slugOf(code){return code==='DALAL'?'dalal-street':String(code).toLowerCase()}
// assets/data/committees.json is the single source for names, agendas, prizes and links
fetch('assets/data/committees.json').then(r=>r.json()).then(data=>{data.committees.forEach(d=>{const c=committees.find(q=>slugOf(q.code)===d.slug);if(!c)return;c.full=d.full;c.agenda=d.agenda;c.prizes=d.prizes;c.matrix=d.matrix||'';c.registrationUrl=d.registrationUrl||''})}).catch(()=>{});
const projectPoint=c=>({x:(c.lon+180)/360*100,y:(90-c.lat)/180*100});committees.forEach(c=>Object.assign(c,projectPoint(c)));
let state={name:'',committee:null,sound:true,finish:'glass',photo:null,paymentVerified:false,paymentId:''};
try{state={...state,...JSON.parse(localStorage.getItem('mun26-global')||'{}')}}catch(e){}
// New visitors start with sound requested. A deliberate choice on this version
// remains authoritative across visits, including when an older saved state exists.
try{const choice=localStorage.getItem('mun26-sound-choice');state.sound=choice==='on'||(!window.MUNPerformance?.lite&&choice!=='off')}catch(e){state.sound=!window.MUNPerformance?.lite}
let lastSoundState=state.sound;
const save=()=>{localStorage.setItem('mun26-global',JSON.stringify({...state,photo:null}));if(lastSoundState!==state.sound){lastSoundState=state.sound;window.dispatchEvent(new CustomEvent('mun-sound-change',{detail:{enabled:state.sound}}))}};

// Committee music plays only after a visitor enables sound.
let audio=null, themeTimer=null, licensedTrack=null;
const LICENSED_AUDIO={UNHRC:'assets/audio/unhrc-theme.mp3',MCC:'assets/audio/mcc-theme.mp3',DALAL:'assets/audio/scam-1992-theme-licensed.mp3',IPL:'assets/audio/ipl-theme-licensed.mp3',STARTUP:'assets/audio/startup-theme.mp3',CCEP:'assets/audio/ccep-theme.mp3',AIPPM:'assets/audio/aippm-theme.mp3',IP:'assets/audio/ip-press-theme.mp3'};
function tone(freq=440,d=.08,type='sine',vol=.035){if(!state.sound)return;audio ||= new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+d)}
function sonic(c){if(!state.sound)return;const base={UNHRC:392,MCC:110,CCEP:523,IPL:659,AIPPM:294,DALAL:440,STARTUP:147,IP:587}[c.code]||330;tone(base,.16,c.code==='MCC'?'sawtooth':'sine',.025);setTimeout(()=>tone(base*1.5,.25,'triangle',.018),100)}
function updateCommitteeSound(){const b=$('#dossierSound');if(!b)return;const hasTrack=current&&LICENSED_AUDIO[current.code];b.classList.toggle('hidden',!hasTrack);b.innerHTML=licensedTrack&&!licensedTrack.paused?'<span>■</span> Stop committee music':'<span>▶</span> Play committee music'}
function stopTheme(){clearTimeout(themeTimer);if(licensedTrack){licensedTrack.pause();licensedTrack.currentTime=0;licensedTrack=null}updateCommitteeSound()}
function playCommitteeTheme(c){if(!state.sound)return;stopTheme();const src=LICENSED_AUDIO[c.code];if(src){licensedTrack=new Audio(src);licensedTrack.loop=true;licensedTrack.preload='auto';licensedTrack.volume=c.code==='UNHRC'?.38:c.code==='MCC'?.32:c.code==='STARTUP'?.4:c.code==='CCEP'?.35:c.code==='AIPPM'?.3:c.code==='IP'?.32:.28;licensedTrack.addEventListener('error',()=>{licensedTrack=null;playOriginalTheme(c)},{once:true});licensedTrack.play().then(updateCommitteeSound).catch(()=>updateCommitteeSound());return}if(window.MUNSound){MUNSound.committee(slugOf(c.code));return}playOriginalTheme(c)}
function playOriginalTheme(c){if(!state.sound||!['IPL','DALAL'].includes(c.code))return;audio ||= new (window.AudioContext||window.webkitAudioContext)();const start=audio.currentTime,master=audio.createGain();master.gain.setValueAtTime(.0001,start);master.gain.exponentialRampToValueAtTime(.12,start+.08);master.gain.setValueAtTime(.12,start+3.5);master.gain.exponentialRampToValueAtTime(.0001,start+3.95);master.connect(audio.destination);
  const note=(freq,at,d=.16,type='sine',vol=.12)=>{const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,start+at);g.gain.setValueAtTime(.0001,start+at);g.gain.exponentialRampToValueAtTime(vol,start+at+.015);g.gain.exponentialRampToValueAtTime(.0001,start+at+d);o.connect(g).connect(master);o.start(start+at);o.stop(start+at+d+.03)};
  if(c.code==='IPL'){[0,.5,1,1.5,2,2.5,3,3.5].forEach((t,i)=>{note(78,t,.12,'sine',.5);note(156,t+.02,.08,'square',.07);if(i%2===1)note(330,t,.22,'sawtooth',.05)});[392,494,587,784,587,659,784,988].forEach((f,i)=>note(f,i*.5,.34,'triangle',.13));}
  else{[0,.5,1,1.5,2,2.5,3,3.5].forEach(t=>note(55,t,.2,'sawtooth',.25));[110,110,147,165,110,196,165,147,110,110,147,220,196,165,147,110].forEach((f,i)=>note(f,i*.25,.19,i%4===0?'square':'sawtooth',.12));[330,294,247,220].forEach((f,i)=>note(f,2.8+i*.28,.35,'triangle',.06));}
  themeTimer=setTimeout(stopTheme,4000)}
$('#soundToggle').onclick=async()=>{state.sound=!state.sound;try{localStorage.setItem('mun26-sound-choice',state.sound?'on':'off')}catch(e){}save();window.MUNSound&&MUNSound.set(state.sound);$('#soundToggle').setAttribute('aria-pressed',state.sound);$('#soundToggle span').textContent=state.sound?'Sound on':'Sound off';if(state.sound){audio ||= new (window.AudioContext||window.webkitAudioContext)();await audio.resume();tone(330,.1);setTimeout(()=>tone(495,.18),80)}else stopTheme()};

const initials=n=>n.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'ID';
$('#delegateName').addEventListener('input',e=>$('#initials').textContent=initials(e.target.value));
$('#credentialForm').onsubmit=async e=>{e.preventDefault();const card=e.currentTarget,status=$('#scanStatus');state.name=$('#delegateName').value.trim();save();card.classList.add('scanning');$('#verifyButton').disabled=true;status.textContent='ANALYSING IDENTITY · 01/03';tone(180,.14,'sawtooth');await wait(600);status.textContent='CROSS-CHECKING SUMMIT NETWORK · 02/03';tone(260,.14);await wait(650);status.textContent='CLEARANCE CONFIRMED · 03/03';status.classList.add('ok');$('#gateLed').classList.add('ok');tone(392,.12);setTimeout(()=>tone(588,.3),100);await wait(700);document.body.classList.remove('locked');document.body.classList.add('map-mode');$('#access').classList.add('cleared');toast('Choose a destination, '+state.name.split(' ')[0]+'.')};
if(state.name){$('#delegateName').value=state.name;$('#initials').textContent=initials(state.name)}

const nodes=$('#nodes'),rail=$('#committeeRail'),routes=$('#routes'),mapCamera=$('#mapCamera'),mapCable=$('#mapCable'),mapCableText=$('#mapCableText');
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ZONES={UNHRC:'Europe/Zurich',MCC:'America/New_York',CCEP:'Asia/Singapore',IPL:'Asia/Kolkata',AIPPM:'Asia/Kolkata',DALAL:'Asia/Kolkata',STARTUP:'America/Los_Angeles',IP:'Europe/London'};
const clockFormats={};
function localTime(zone,seconds){const key=zone+(seconds?'s':'');try{clockFormats[key] ||= new Intl.DateTimeFormat('en-GB',seconds?{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}:{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'});return clockFormats[key].format(new Date())}catch(e){return '--:--'}}
const purseOf=c=>(c.awards||[]).reduce((sum,[,amount])=>sum+(parseInt(String(amount).replace(/\D/g,''),10)||0),0);
const inr=n=>'₹'+n.toLocaleString('en-IN');
const cityOf=c=>c.city.split(' / ')[0];
// A room is "in session" during its own city's working day; the Midnight Crisis Committee keeps night hours.
function statusOf(c){const h=parseInt(localTime(ZONES[c.code]),10);const on=c.code==='MCC'?(h>=20||h<6):(h>=9&&h<18);return on?'In session':'Boarding'}
const coordOf=c=>Math.abs(c.lat).toFixed(2).padStart(5,'0')+'°'+(c.lat>=0?'N':'S')+' '+Math.abs(c.lon).toFixed(2).padStart(6,'0')+'°'+(c.lon>=0?'E':'W');

let washEl=null,camAnim=null,typeFrame=0,departing=false,zoomTimer=0,resetTimer=0,prepanTimer=0,zoomFrame=0,resetObserver=null;
function previewCommittee(c,i,on=true){
  if(departing)return;
  $$('.node',nodes).forEach((n,k)=>n.classList.toggle('active',on&&k===i));
  mapCable.classList.toggle('show',on);
  if(!on){cancelAnimationFrame(typeFrame);return}
  mapCable.style.setProperty('--pc',c.color);
  placeCable(c);
  typeCable(c);
}
function cableLines(c){return[`CABLE MUN/GGN ▸ ${cityOf(c).toUpperCase()}`,`${coordOf(c)}  LOCAL `,`${c.code} · ${c.full.toUpperCase()}`,`AGENDA  ${String(c.agenda||'').toUpperCase()}`,`PURSE   ${inr(purseOf(c))}`,`STATUS  ${statusOf(c).toUpperCase()} · ENTER ↵`]}
function typeCable(c){cancelAnimationFrame(typeFrame);const lines=cableLines(c),full=lines.join('\n'),zone=ZONES[c.code];const finish=()=>{mapCableText.textContent='';lines.forEach((line,k)=>{const row=document.createElement('span');row.className='cable-line'+(k===0?' cable-head':'');row.textContent=line;if(k===1){const t=document.createElement('b');t.className='cable-time';t.dataset.zone=zone;t.textContent=localTime(zone,true);row.append(t)}mapCableText.append(row)})};if(reducedMotion()){finish();return}const start=performance.now(),rate=.42;const step=now=>{const n=Math.floor((now-start)*rate);if(n>=full.length){finish();return}mapCableText.textContent=full.slice(0,n)+'▌';typeFrame=requestAnimationFrame(step)};typeFrame=requestAnimationFrame(step)}
function placeCable(c){const stage=$('#mapStage'),w=stage.clientWidth,h=stage.clientHeight;mapCable.style.setProperty('--cx',c.x+'%');mapCable.style.setProperty('--cy',c.y+'%');mapCable.dataset.side=(c.x/100*w>w*.56)?'left':'right';mapCable.dataset.vert=(c.y/100*h<h*.4)?'below':'above'}
committees.forEach((c,i)=>{const n=document.createElement('button');n.className='node node-'+c.code.toLowerCase();n.style.setProperty('--c',c.color);n.setAttribute('aria-label',`${c.full} — ${c.city.replace(' / ',' ')}`);n.innerHTML=`<span class="node-dot"></span><span class="node-label">${c.code}<small>${c.city.split(' / ')[0]}</small></span>`;n.onclick=e=>selectCommittee(c,i,e);n.onmouseenter=()=>{sonic(c);previewCommittee(c,i)};n.onmouseleave=()=>previewCommittee(c,i,false);n.onfocus=()=>previewCommittee(c,i);n.onblur=()=>previewCommittee(c,i,false);nodes.append(n);const b=document.createElement('button');b.style.setProperty('--c',c.color);b.innerHTML=`<span class="rail-num">${String(i+1).padStart(2,'0')} / </span><span class="rail-code">${c.code}</span> <span class="rail-city">${cityOf(c)}</span>`;b.type='button';b.dataset.committee=c.code;b.onclick=e=>{e.preventDefault();e.stopPropagation();selectCommittee(c,i,e)};b.onmouseenter=()=>previewCommittee(c,i);b.onmouseleave=()=>previewCommittee(c,i,false);b.onfocus=()=>previewCommittee(c,i);b.onblur=()=>previewCommittee(c,i,false);rail.append(b)});
const mapArt=new Image();mapArt.src='assets/images/world-atlas-india-focus-hq.webp';
// Pixel coordinates calibrated to the visible cities on this illustrated atlas.
// Geographic equirectangular maths lands east of the actual painted coastlines.
const atlasCities={MCC:[490,285],IP:[751,240],UNHRC:[802,270],AIPPM:[1132,355],STARTUP:[321,305],DALAL:[1095,397],IPL:[1111,443],CCEP:[1244,479]};
function backgroundOffset(container,image,position){if(position?.endsWith('%'))return(container-image)*parseFloat(position)/100;if(position==='right'||position==='bottom')return container-image;if(position==='center')return(container-image)/2;if(position==='left'||position==='top')return 0;return parseFloat(position)||0}
// Phones and tablets (map-mobile.css sets --map-band:1 on the stage): fit the San Francisco → Singapore band
// of the atlas into the stage, then project the dots exactly as on desktop from the resulting background box.
const BAND_LABEL_SIDE={MCC:'up',IP:'up',UNHRC:'up',AIPPM:'up',STARTUP:'down',IPL:'down',CCEP:'down',DALAL:'left'};
const BAND_VARS=['--lx','--ly','--ll','--la','--hit'];
let bandFitted=false;
const cssPx=(style,name)=>parseFloat(style.getPropertyValue(name))||0;
function fitBand(stage,width,height,style){
  const pts=Object.values(atlasCities),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const padX=cssPx(style,'--band-pad-x'),padT=cssPx(style,'--band-pad-top'),padB=cssPx(style,'--band-pad-bottom');
  const scale=Math.min((width-2*padX)/(x1-x0),(height-padT-padB)/(y1-y0));
  if(!(scale>0))return false;
  const imageWidth=mapArt.naturalWidth*scale,imageHeight=mapArt.naturalHeight*scale;
  let offsetX=padX+(width-2*padX-(x1-x0)*scale)/2-x0*scale,offsetY=padT+(height-padT-padB-(y1-y0)*scale)/2-y0*scale;
  // Keep the artwork covering the stage whenever it is big enough to.
  if(imageWidth>=width)offsetX=Math.min(0,Math.max(width-imageWidth,offsetX));
  if(imageHeight>=height)offsetY=Math.min(0,Math.max(height-imageHeight,offsetY));
  stage.style.backgroundSize=`${imageWidth.toFixed(2)}px ${imageHeight.toFixed(2)}px`;
  stage.style.backgroundPosition=`${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px`;
  bandFitted=true;return true;
}
function clearBand(stage){
  if(!bandFitted)return;bandFitted=false;
  stage.style.backgroundSize='';stage.style.backgroundPosition='';
  $$('.node',nodes).forEach(n=>BAND_VARS.forEach(v=>n.style.removeProperty(v)));
}
// Labels sit in a row above or below the cities (or beside Mumbai), spread so they never overlap, with a leader line
// back to the dot. Dot hit areas shrink to the gap to their nearest neighbour so close cities never steal taps.
function layoutBandLabels(width,height,style){
  const gap=8,edge=12,lift=cssPx(style,'--band-label-lift')||44,list=$$('.node',nodes);
  const items=committees.map((c,i)=>{const n=list[i],label=n?.querySelector('.node-label');return{n,side:BAND_LABEL_SIDE[c.code]||'up',x:c.x/100*width,y:c.y/100*height,w:label?.offsetWidth||64,h:label?.offsetHeight||32}});
  items.forEach(a=>{let d=Infinity;items.forEach(b=>{if(a!==b)d=Math.min(d,Math.hypot(a.x-b.x,a.y-b.y))});a.hit=Math.max(14,Math.min(44,d))});
  const row=(group,y)=>{
    group.sort((a,b)=>a.x-b.x);
    group.forEach((it,k)=>{const prev=group[k-1];it.lx=Math.max(it.x,edge+it.w/2,prev?prev.lx+(prev.w+it.w)/2+gap:-Infinity);it.ly=y});
    for(let k=group.length-1;k>=0;k--){const it=group[k],next=group[k+1];it.lx=Math.min(it.lx,width-edge-it.w/2,next?next.lx-(next.w+it.w)/2-gap:Infinity)}
  };
  const up=items.filter(it=>it.side==='up'),down=items.filter(it=>it.side==='down');
  if(up.length){const h=Math.max(...up.map(it=>it.h));row(up,Math.max(h/2+6,Math.min(...up.map(it=>it.y))-lift))}
  if(down.length){const h=Math.max(...down.map(it=>it.h));row(down,Math.min(height-h/2-6,Math.max(...down.map(it=>it.y))+lift))}
  items.filter(it=>it.side==='left').forEach(it=>{it.lx=Math.max(edge+it.w/2,it.x-16-it.w/2);it.ly=it.y});
  items.forEach(it=>{if(!it.n)return;const dx=it.lx-it.x,dy=it.ly-it.y,s=it.n.style;
    s.setProperty('--lx',dx.toFixed(1)+'px');s.setProperty('--ly',dy.toFixed(1)+'px');
    s.setProperty('--ll',Math.hypot(dx,dy).toFixed(1)+'px');s.setProperty('--la',Math.atan2(dy,dx).toFixed(4)+'rad');
    s.setProperty('--hit',it.hit.toFixed(1)+'px')});
}
let mapSynced=false;
function syncCommitteeMap(){
 const stage=$('#mapStage');if(!stage||!mapArt.naturalWidth||!mapArt.naturalHeight)return;
 const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;
 const style=getComputedStyle(stage),band=style.getPropertyValue('--map-band').trim()==='1';
 if(band){if(!fitBand(stage,width,height,style))return}else clearBand(stage);
 const size=style.backgroundSize.trim().split(/\s+/),position=style.backgroundPosition.trim().split(/\s+/);let imageWidth,imageHeight;const ratio=mapArt.naturalWidth/mapArt.naturalHeight;
 if(size[0]==='cover'||size[0]==='contain'){const scale=size[0]==='cover'?Math.max(width/mapArt.naturalWidth,height/mapArt.naturalHeight):Math.min(width/mapArt.naturalWidth,height/mapArt.naturalHeight);imageWidth=mapArt.naturalWidth*scale;imageHeight=mapArt.naturalHeight*scale}
 else{const dimension=(value,container,natural)=>value==='auto'?null:value?.endsWith('%')?container*parseFloat(value)/100:value?.endsWith('px')?parseFloat(value):null;imageWidth=dimension(size[0],width,mapArt.naturalWidth);imageHeight=dimension(size[1],height,mapArt.naturalHeight);if(imageWidth===null&&imageHeight===null){imageWidth=width;imageHeight=height}else if(imageWidth===null)imageWidth=imageHeight*ratio;else if(imageHeight===null)imageHeight=imageWidth/ratio}
 const offsetX=backgroundOffset(width,imageWidth,position[0]||'50%'),offsetY=backgroundOffset(height,imageHeight,position[1]||'50%');
 // map-life.js (ambient lights) sizes its canvas from this; it is a no-op while that script is not loaded.
 window.dispatchEvent(new CustomEvent('mun-map-geom',{detail:{width,height,imageWidth,imageHeight,offsetX,offsetY}}));
 committees.forEach((c,i)=>{const point=atlasCities[c.code],u=point[0]/mapArt.naturalWidth,v=point[1]/mapArt.naturalHeight;c.x=((u*imageWidth+offsetX)/width)*100;c.y=((v*imageHeight+offsetY)/height)*100;const node=$$('.node')[i];node?.style.setProperty('--x',c.x+'%');node?.style.setProperty('--y',c.y+'%')});routes.innerHTML='';committees.forEach((c,i)=>{if(i)routes.insertAdjacentHTML('beforeend',`<path d="M${committees[0].x*10} ${committees[0].y*5.2} Q500 210 ${c.x*10} ${c.y*5.2}"/>`)});if(band)layoutBandLabels(width,height,style)}
mapArt.addEventListener('load',syncCommitteeMap,{once:true});if(mapArt.complete)syncCommitteeMap();window.addEventListener('resize',syncCommitteeMap,{passive:true});window.addEventListener('journey',e=>{if(e.detail>=.9&&!mapSynced){mapSynced=true;syncCommitteeMap()}else if(e.detail<.5)mapSynced=false},{passive:true});
// The stage can change size without a window resize (journey layout, URL bar, rotation), and label widths settle once fonts load.
let stageSyncFrame=0;const queueStageSync=()=>{if(!stageSyncFrame)stageSyncFrame=requestAnimationFrame(()=>{stageSyncFrame=0;syncCommitteeMap()})};
if('ResizeObserver' in window&&$('#mapStage'))new ResizeObserver(queueStageSync).observe($('#mapStage'));document.fonts?.ready.then(queueStageSync);

/* Camera movement applies only to map artwork; map heading and committee rail stay fixed. */
/* The colour screen opens like an iris from the centre (where the dot was) to reveal the intro. Falls back to a fade. */
let irisReady=null;
function irisOpen(w){
  if(!w)return;
  const done=()=>{w.remove();if(washEl===w)washEl=null};
  if(irisReady===null){try{CSS.registerProperty({name:'--r',syntax:'<length>',inherits:false,initialValue:'0px'});irisReady=true}catch(e){irisReady=/already|InvalidModification/i.test(String(e))}}
  if(!irisReady||!window.CSS||!CSS.supports('mask-image','radial-gradient(circle,transparent,#000)')){w.animate([{opacity:1},{opacity:0}],{duration:650,easing:'ease-out',fill:'forwards'}).onfinish=done;return}
  const far=Math.hypot(innerWidth/2,innerHeight/2)+90;
  const mask='radial-gradient(circle at 50% 50%,transparent var(--r),#000 calc(var(--r) + 70px))';
  w.style.webkitMaskImage=mask;w.style.maskImage=mask;
  w.animate([{'--r':'-70px'},{'--r':far+'px'}],{duration:900,easing:'cubic-bezier(.45,0,.2,1)',fill:'forwards'}).onfinish=done;
}
function resetMapCamera(){
  clearTimeout(zoomTimer);clearTimeout(resetTimer);clearTimeout(prepanTimer);cancelAnimationFrame(zoomFrame);
  resetObserver?.disconnect();resetObserver=null;
  camAnim?.cancel();camAnim=null;
  if(washEl){const w=washEl;washEl=null;w.animate([{opacity:getComputedStyle(w).opacity},{opacity:0}],{duration:250,fill:'forwards'}).onfinish=()=>w.remove()}
  mapCamera.style.transition='none';
  mapCamera.style.transform='';
  mapCamera.style.opacity='';
  mapCamera.style.transformOrigin='';
  mapCamera.style.willChange='';
  departing=false;
  mapCable.classList.remove('show');
  $$('.node',nodes).forEach(n=>n.classList.remove('active'));
}
function armCameraReset(){
  resetObserver?.disconnect();
  let sawOverlay=document.body.classList.contains('overlay');
  const finish=()=>resetMapCamera();
  resetObserver=new MutationObserver(()=>{
    const overlay=document.body.classList.contains('overlay');
    if(overlay)sawOverlay=true;
    else if(sawOverlay)finish();
  });
  resetObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  resetTimer=setTimeout(finish,1350);
}
function selectCommittee(c,i,event){
  if(departing)return;
  window.MUNRouter?.onCommitteeOpening(c.code);
  const node=$$('.node',nodes)[i];
  const dot=node?.querySelector('.node-dot');
  const handoff={currentTarget:event?.currentTarget||node};
  if(!dot||!mapCamera||reducedMotion()){
    openCommittee(c,i,handoff);
    return;
  }
  departing=true;
  mapCable.classList.remove('show');
  const pan=$('.map-pan',mapCamera);
  let panShift=0;
  if(pan && pan.scrollWidth>pan.clientWidth+2){
    const pane=pan.getBoundingClientRect(),spot=dot.getBoundingClientRect();
    const dx=spot.left+spot.width/2-(pane.left+pane.width/2);
    const target=Math.max(0,Math.min(pan.scrollWidth-pan.clientWidth,pan.scrollLeft+dx));
    if(Math.abs(target-pan.scrollLeft)>12){
      panShift=target-pan.scrollLeft;     // where the dot will be once the pan settles
      pan.scrollTo({left:target,behavior:'smooth'});
    }
  }
  const launch=()=>{
    const cam=mapCamera.getBoundingClientRect(),point=dot.getBoundingClientRect();
    if(!cam.width||!cam.height||!point.width){openCommittee(c,i,handoff);armCameraReset();return}
    const sx=point.left+point.width/2-cam.left-panShift;
    const sy=point.top+point.height/2-cam.top;
    // Real zoom into the dot, in log space so it feels like one even push. The dot's own colour then takes the whole
    // screen, and the intro opens underneath that solid colour: there is never a moment with just a dot on screen.
    const S=cam.width<=600?42:58,DUR=1500,STEPS=40,tx=cam.width/2-sx,ty=cam.height/2-sy;
    const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const frames=[];
    for(let k=0;k<=STEPS;k++){const t=k/STEPS,pe=ease(Math.min(1,t*1.45)),se=ease(t);
      frames.push({transform:`translate3d(${(tx*pe).toFixed(1)}px,${(ty*pe).toFixed(1)}px,0) scale(${Math.exp(Math.log(S)*se).toFixed(3)})`})}
    mapCamera.style.willChange='transform';
    mapCamera.style.transformOrigin=`${sx}px ${sy}px`;
    camAnim?.cancel();camAnim=mapCamera.animate(frames,{duration:DUR,easing:'linear',fill:'forwards'});
    washEl?.remove();washEl=document.createElement('div');washEl.className='map-wash';washEl.style.background=c.color;document.body.append(washEl);
    washEl.animate([{opacity:0,offset:0},{opacity:0,offset:.45},{opacity:1,offset:.72},{opacity:1,offset:1}],{duration:DUR,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});
    zoomTimer=setTimeout(()=>{openCommittee(c,i,handoff);armCameraReset();
      setTimeout(()=>irisOpen(washEl),40)},Math.round(DUR*.74));
  };
  launch();
}
let current=null,currentCommitteeIndex=0,committeeJourneyTimers=[],lastCommitteeControl=null,committeeJourneyActive=false;
let dalalMascotFrame=0;
function updateDalalMascot(){const scroller=$('#dalalPageScroll'),page=$('#dalalCommitteePage');if(!scroller||!page)return;const range=scroller.scrollHeight-scroller.clientHeight,progress=range>0?Math.min(1,scroller.scrollTop/range):0,footer=$('.dp-footer',page),travel=Math.min(scroller.clientHeight*.29,260);page.classList.toggle('has-scrolled',scroller.scrollTop>scroller.clientHeight*.55);page.classList.toggle('near-footer',!!footer&&footer.getBoundingClientRect().top<scroller.getBoundingClientRect().bottom-36);page.style.setProperty('--mascot-shift',Math.round(progress*travel+Math.sin(progress*Math.PI*3)*8)+'px');page.style.setProperty('--mascot-tilt',(Math.sin(progress*Math.PI*4)*3)+'deg')}
function scheduleDalalMascot(){if(dalalMascotFrame)return;dalalMascotFrame=requestAnimationFrame(()=>{dalalMascotFrame=0;updateDalalMascot()})}
function openDalalCommitteePage(){const page=$('#dalalCommitteePage'),scroller=$('#dalalPageScroll'),title=$('#dpTitle');page.classList.add('open');scroller.scrollTo({top:0,behavior:'instant'});page.setAttribute('aria-hidden','false');document.body.classList.add('overlay');title.tabIndex=-1;title.focus({preventScroll:true});updateDalalMascot()}
function closeDalalCommitteePage(fromRoute=false){const page=$('#dalalCommitteePage');page.classList.remove('open');page.setAttribute('aria-hidden','true');document.body.classList.remove('overlay');stopTheme();if(lastCommitteeControl?.isConnected)lastCommitteeControl.focus({preventScroll:true});if(!fromRoute)window.MUNRouter?.onCommitteeClosed()}
function revealCommittee(c,i){const layer=$('#committeeFlight');layer.classList.remove('active','launching','broker-walk');layer.setAttribute('aria-hidden','true');document.body.classList.remove('overlay');try{window.dispatchEvent(new CustomEvent('mun:committee-visited',{detail:{code:c.code}}))}catch(e){}if(c.code==='DALAL'){openDalalCommitteePage();return}openCommitteePage(c,i);if(c.code==='MCC'){mccSections.forEach(section=>section.classList.remove('mcc-visible'));updateMccMotion()}}
function finishCommitteeJourney(){if(!committeeJourneyActive)return;window.MUNSeq?.release();committeeJourneyActive=false;committeeJourneyTimers.forEach(clearTimeout);committeeJourneyTimers=[];const c=current,i=currentCommitteeIndex;document.body.classList.add('xfade');revealCommittee(c,i);setTimeout(()=>{if(committeeJourneyActive)return;window.MUNMarketCrash?.stop();window.MUNStartupLaunch?.stop();window.MUNMCCNightFlight?.stop();window.MUNCommitteeCinematics?.stop();const mcc=$('#mccNightFlight');mcc.classList.remove('active','nightfall','title-reveal','reduced-motion');mcc.setAttribute('aria-hidden','true');mcc.style.removeProperty('--night-progress');const startup=$('#startupLaunch');startup.classList.remove('active','city-awake','idea-phase','valuation-phase','boardroom-phase','title-push','title-reveal','boardroom-flash','reduced-motion');startup.setAttribute('aria-hidden','true');const press=$('#ipCinematic');press.classList.remove('active','handoff');press.setAttribute('aria-hidden','true');const crash=$('#dalalCrash');crash.classList.remove('active','market-awake','reduced-motion','bull-rising','market-falling','title-assembling','title-expanding');crash.setAttribute('aria-hidden','true');const layer=$('#committeeFlight');layer.classList.remove('active','launching','broker-walk');layer.setAttribute('aria-hidden','true')},420);setTimeout(()=>document.body.classList.remove('xfade'),1700)}
function seqDone(){if(!committeeJourneyActive)return;if(window.MUNSeq&&!matchMedia('(prefers-reduced-motion: reduce)').matches)window.MUNSeq.done(current,finishCommitteeJourney);else finishCommitteeJourney()}
function startPressJourney(c,i){const press=$('#ipCinematic'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;press.classList.remove('active','handoff');press.setAttribute('aria-hidden','false');document.body.classList.add('overlay');void press.offsetWidth;press.classList.add('active');if(reduced){finishCommitteeJourney();return}$('#ipCinemaSkip').focus({preventScroll:true});committeeJourneyTimers.push(setTimeout(seqDone,3900))}
function startCommitteeJourney(c,i,event){committeeJourneyTimers.forEach(clearTimeout);committeeJourneyTimers=[];window.MUNMarketCrash?.stop();window.MUNStartupLaunch?.stop();window.MUNMCCNightFlight?.stop();window.MUNCommitteeCinematics?.stop();committeeJourneyActive=true;current=c;currentCommitteeIndex=i;if(['DALAL','STARTUP','IP'].includes(c.code)){committeeJourneyTimers.push(setTimeout(()=>{if(committeeJourneyActive&&current?.code===c.code)finishCommitteeJourney()},9000))}lastCommitteeControl=event?.currentTarget||null;state.committee=c.code;save();sonic(c);playCommitteeTheme(c);window.MUNSeq?.start(c);const flight=$('#committeeFlight'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(c.code==='IP'){flight.classList.remove('active','launching','broker-walk');flight.setAttribute('aria-hidden','true');startPressJourney(c,i);return}if(c.code==='MCC'){const intro=$('#mccNightFlight');flight.classList.remove('active','launching','broker-walk');flight.setAttribute('aria-hidden','true');document.body.classList.add('overlay');intro.classList.remove('active','nightfall','title-reveal','reduced-motion');intro.setAttribute('aria-hidden','false');void intro.offsetWidth;intro.classList.add('active');$('#mccFlightSkip').focus({preventScroll:true});if(window.MUNMCCNightFlight)window.MUNMCCNightFlight.play({onComplete:seqDone});else committeeJourneyTimers.push(setTimeout(seqDone,reduced?220:5000));return}if(c.code==='STARTUP'&&!window.MUNScenes){const intro=$('#startupLaunch');flight.classList.remove('active','launching','broker-walk');flight.setAttribute('aria-hidden','true');document.body.classList.add('overlay');intro.classList.remove('active','city-awake','idea-phase','valuation-phase','boardroom-phase','title-push','title-reveal','boardroom-flash','reduced-motion');intro.setAttribute('aria-hidden','false');void intro.offsetWidth;intro.classList.add('active');$('#startupLaunchSkip').focus({preventScroll:true});if(window.MUNStartupLaunch)window.MUNStartupLaunch.play({onComplete:seqDone,soundEnabled:state.sound});else{intro.classList.add('boardroom-phase','title-reveal');committeeJourneyTimers.push(setTimeout(finishCommitteeJourney,reduced?220:3500))}return}if(c.code==='DALAL'){const crash=$('#dalalCrash');flight.classList.remove('active','launching','broker-walk');flight.setAttribute('aria-hidden','true');document.body.classList.add('overlay');crash.classList.remove('active','market-awake','reduced-motion','bull-rising','market-falling','title-assembling','title-expanding');crash.setAttribute('aria-hidden','false');void crash.offsetWidth;crash.classList.add('active');$('#dalalCrashSkip').focus({preventScroll:true});if(window.MUNMarketCrash)window.MUNMarketCrash.play({onComplete:seqDone,soundEnabled:state.sound});else{crash.classList.add('market-awake');if(reduced){crash.classList.add('reduced-motion','title-assembling');committeeJourneyTimers.push(setTimeout(finishCommitteeJourney,220))}else{committeeJourneyTimers.push(setTimeout(()=>crash.classList.add('market-falling'),1050),setTimeout(()=>crash.classList.add('title-assembling'),2580),setTimeout(finishCommitteeJourney,3500))}}return}if(['UNHRC','CCEP','IPL','AIPPM','STARTUP'].includes(c.code)&&window.MUNCommitteeCinematics){flight.classList.remove('active','launching','broker-walk');flight.setAttribute('aria-hidden','true');document.body.classList.add('overlay');window.MUNCommitteeCinematics.play(c.code,{onComplete:seqDone,soundEnabled:state.sound});return}const rect=lastCommitteeControl?.getBoundingClientRect();if(rect){flight.style.setProperty('--rocket-x',(rect.left+rect.width/2)+'px');flight.style.setProperty('--rocket-y',(rect.top+rect.height/2)+'px')}else{flight.style.setProperty('--rocket-x','50vw');flight.style.setProperty('--rocket-y','54vh')}const destination=c.city.split(' / ')[0];$('#cfCity').textContent=destination;$('#cfCommittee').textContent=c.full.toUpperCase();flight.classList.remove('active','launching','broker-walk');flight.setAttribute('aria-hidden','false');document.body.classList.add('overlay');void flight.offsetWidth;flight.classList.add('active','launching');$('#committeeJourneySkip').focus({preventScroll:true});committeeJourneyTimers.push(setTimeout(finishCommitteeJourney,reduced?220:2050))}
async function openCommittee(c,i,event){startCommitteeJourney(c,i,event)}
$('#committeeJourneySkip').onclick=finishCommitteeJourney;$('#dalalCrashSkip').onclick=finishCommitteeJourney;$('#ipCinemaSkip').onclick=finishCommitteeJourney;$('#startupLaunchSkip').onclick=finishCommitteeJourney;$('#mccFlightSkip').onclick=finishCommitteeJourney;$('#dalalPageClose').onclick=()=>closeDalalCommitteePage();$('#dalalPageScroll').addEventListener('scroll',scheduleDalalMascot,{passive:true});window.addEventListener('resize',scheduleDalalMascot,{passive:true});
function renderAwards(c){
 const panel=$('#cpAwards'),list=$('#cpAwardsList');
 const article=document.createElement('article'),label=document.createElement('small');
 const amount=document.createElement('b'),note=document.createElement('span');
 panel.style.setProperty('--award-count','1');
 label.textContent='TOTAL PRIZE POOL';
 amount.textContent=inr(purseOf(c));
 note.textContent='Combined prize pool for this committee.';
 article.append(label,amount,note);list.replaceChildren(article);
 $('#cpAwardsNote').textContent=c.code==='UNHRC'?'Cumulative prize pool for the United Nations Human Rights Council.':'Total prize pool for '+c.full+'.';
}
function openCommitteePage(c,i){const page=$('#committeePage'),scroller=$('#committeePageScroll'),title=$('#cpTitle');page.dataset.committee=c.code;page.style.setProperty('--committee-accent',c.color);$('#cpNumber').textContent='COMMITTEE '+String(i+1).padStart(2,'0');$('#cpLocation').textContent=c.city;$('#cpFullName').textContent=c.full;$('#cpHeroA').textContent=c.heroA;$('#cpHeroB').textContent=c.heroB;$('#cpAgenda').textContent=c.agenda;$('#cpArtCode').textContent=c.code;$('#cpArtCity').textContent=c.city.split(' / ')[0];$('#cpLead').textContent=c.lead;$('#cpIntro').textContent=c.intro;const tags=$('#cpSkills');tags.replaceChildren(...c.skills.map(s=>{const el=document.createElement('span');el.textContent=s;return el}));const steps=$('#cpSteps');steps.replaceChildren(...c.steps.map(([name,description],index)=>{const li=document.createElement('li'),number=document.createElement('i'),copy=document.createElement('span'),strong=document.createElement('b'),small=document.createElement('small');number.textContent=String(index+1).padStart(2,'0');copy.append(strong,small);strong.textContent=name;small.textContent=description;li.append(number,copy);return li}));renderAwards(c);page.classList.add('open');scroller.scrollTo({top:0,behavior:'instant'});page.style.setProperty('--mcc-scroll','0px');page.setAttribute('aria-hidden','false');document.body.classList.add('overlay');title.tabIndex=-1;title.focus({preventScroll:true});window.MUNCommitteeCinematics?.decoratePage(c.code)}
function closeCommitteePage(fromRoute=false){window.MUNCommitteeCinematics?.closePage();const page=$('#committeePage');page.classList.remove('open');page.setAttribute('aria-hidden','true');document.body.classList.remove('overlay');stopTheme();if(lastCommitteeControl?.isConnected)lastCommitteeControl.focus({preventScroll:true});if(!fromRoute)window.MUNRouter?.onCommitteeClosed()}
const mccScroller=$('#committeePageScroll'),mccSections=$$('.cp-brief,.cp-do,.cp-awards,.cp-register',mccScroller);
function updateMccMotion(){const page=$('#committeePage');if(page.dataset.committee!=='MCC'||!page.classList.contains('open'))return;page.style.setProperty('--mcc-scroll',Math.min(mccScroller.scrollTop,mccScroller.clientHeight)+'px');const bottom=mccScroller.getBoundingClientRect().bottom;mccSections.forEach(section=>{if(section.getBoundingClientRect().top<bottom*.88)section.classList.add('mcc-visible')})}
mccScroller.addEventListener('scroll',updateMccMotion,{passive:true});
$('#committeePageClose').onclick=()=>closeCommitteePage();$('#committeePageApply').onclick=()=>openApplication(current.code);
function renderDossier(c,i){const d=$('#dossier');d.style.setProperty('--c',c.color);$('#dossierCrest').textContent=c.code;$('#dossierCity').textContent=c.city;$('#dossierIndex').textContent='Committee '+String(i+1).padStart(2,'0')+' / secure dossier';$('#dossierCode').textContent=c.code;$('#dossierFull').textContent=c.full;$('#dossierAgenda').textContent=c.agenda;$('#dossierIntro').textContent=c.intro;$('#dossierExpect').textContent=c.expect;$('#skills').innerHTML=c.skills.map(s=>'<span>'+s+'</span>').join('');$('#dossierAwards').textContent='Total Prize Pool: '+inr(purseOf(c));const mx=$('#dossierMatrix');mx.hidden=!c.matrix;if(c.matrix)mx.href=c.matrix;updateCommitteeSound()}
function closeDossier(){stopTheme();$('#dossier').classList.remove('open');$('#dossier').setAttribute('aria-hidden','true');document.body.classList.remove('overlay')}
$('#dossierClose').onclick=closeDossier;$('#dossierApply').onclick=()=>{closeDossier();openApplication(current.code)};$('#dossierSound').onclick=async()=>{if(licensedTrack&&!licensedTrack.paused){stopTheme();return}if(!state.sound){state.sound=true;save();$('#soundToggle').setAttribute('aria-pressed','true');$('#soundToggle span').textContent='Sound on';audio ||= new (window.AudioContext||window.webkitAudioContext)();await audio.resume()}playCommitteeTheme(current)};


const roles=committees.map(c=>c.code).concat(['Chairperson','Secretariat','Campus Ambassador']);$('#fRole').innerHTML=roles.map(r=>'<option>'+r+'</option>').join('');
function fillFormSide(role){const c=committees.find(q=>q.code===role);$('#formCrest').textContent=c?c.code:role;$('#formFull').textContent=c?c.full:'Organising team';$('#formAgenda').textContent=c?c.agenda:'Help run Masters Union Nations.';$('#applyModal').style.setProperty('--c',c?c.color:'#d2a95c')}
function openModal(dialog){if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.classList.add('modal-fallback');dialog.setAttribute('open','');document.body.classList.add('modal-fallback-open')}}
function closeModal(dialog){if(dialog.classList.contains('modal-fallback')){dialog.removeAttribute('open');dialog.classList.remove('modal-fallback');if(!document.querySelector('dialog.modal-fallback[open]'))document.body.classList.remove('modal-fallback-open');return}if(typeof dialog.close==='function'&&dialog.open){dialog.close();return}dialog.removeAttribute('open')}
function openApplication(role){$('#fName').value=state.name;$('#fRole').value=role;$('#formTitle').textContent=(committees.some(c=>c.code===role)?role+' delegate':'Apply as '+role);$('#formNote').textContent='';fillFormSide(role);openModal($('#applyModal'));$('#fName').focus({preventScroll:true});tone(300,.12)}
$$('[data-apply]').forEach(b=>b.onclick=()=>openApplication(b.dataset.apply));$$('[data-close]').forEach(b=>b.onclick=()=>closeModal($('#'+b.dataset.close)));
const APPLY_ENDPOINT='';
async function submitDelegateApplication(data,btn,note,closeSource=false){btn.disabled=true;note.textContent='Securing your application…';if(APPLY_ENDPOINT){try{const r=await fetch(APPLY_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,submittedAt:new Date().toISOString()})});if(!r.ok)throw Error()}catch(err){note.textContent='Submission failed. Please try again.';btn.disabled=false;return}}state.name=data.name;state.committee=data.applyingFor;save();btn.dataset.state='done';note.textContent='Application secured. Opening your delegate ID…';await wait(550);if(closeSource)closeModal($('#applyModal'));openStudio(data.institution);btn.disabled=false;delete btn.dataset.state;note.textContent='';if(data.applyingFor==='DALAL'){$('#paymentStatus').textContent='Registration saved for Dalal Street. Open Razorpay and choose UPI QR to complete payment.';$('#paymentButton').innerHTML='Open payment QR <span>↗</span>'}}
$('#applyForm').onsubmit=e=>{e.preventDefault();submitDelegateApplication(Object.fromEntries(new FormData(e.currentTarget)),$('button[type=submit]',e.currentTarget),$('#formNote'),true)};
$('#dalalInlineForm').onsubmit=e=>{e.preventDefault();submitDelegateApplication(Object.fromEntries(new FormData(e.currentTarget)),$('button[type=submit]',e.currentTarget),$('#dalalFormNote'))};

function updatePaymentUI(){const paid=state.paymentVerified,panel=$('#paymentPanel'),pay=$('#paymentButton');panel.classList.toggle('paid',paid);$('#paymentStatus').textContent=paid?'Payment verified'+(state.paymentId?' · '+state.paymentId:'')+'. Your official ID is unlocked.':'Complete payment to unlock your downloadable delegate ID.';pay.hidden=paid;$('#cardDownload').disabled=!paid;$('#cardShare').disabled=!paid}
function openStudio(school=''){state.paymentVerified=false;state.paymentId='';$('#sName').value=state.name;$('#sSchool').value=school;$('#sPortfolio').value='';drawCard();document.fonts?.load('700 80px "Space Grotesk"').then(drawCard);updatePaymentUI();const dalal=state.committee==='DALAL';$('#paymentButton').innerHTML=dalal?'Open payment QR <span>↗</span>':'Pay securely <span>↗</span>';if(dalal)$('#paymentStatus').textContent='Registration saved for Dalal Street. Open Razorpay and choose UPI QR to complete payment.';openModal($('#studioModal'));tone(523,.13);setTimeout(()=>tone(784,.35),100);toast(dalal?'Registration saved. Continue to the secure UPI QR.':'Create your delegate ID, then complete secure payment.')}
['sName','sSchool','sPortfolio'].forEach(id=>$('#'+id).addEventListener('input',drawCard));
$$('[data-finish]').forEach(b=>b.onclick=()=>{state.finish=b.dataset.finish;$$('[data-finish]').forEach(x=>x.classList.toggle('active',x===b));drawCard()});
$('#sPhoto').onchange=e=>{const f=e.target.files[0];if(!f)return;const img=new Image();img.onload=()=>{state.photo=img;drawCard()};img.src=URL.createObjectURL(f)};
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function drawCard(){const cv=$('#cardCanvas'),x=cv.getContext('2d'),W=cv.width,H=cv.height,c=committees.find(q=>q.code===state.committee)||committees[0],finish=state.finish,name=$('#sName').value||state.name||'Delegate',school=$('#sSchool').value||"Masters' Union",portfolio=$('#sPortfolio').value||'Portfolio to be assigned';x.clearRect(0,0,W,H);const palettes={glass:['#16060c','#4a0c22'],obsidian:['#050203','#1c0b12'],ivory:['#f1e7e2','#c9b3ad'],foil:['#2a0a1c','#5a2a48']},p=palettes[finish]||palettes.glass,g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);x.fillStyle=g;x.fillRect(0,0,W,H);if(finish==='foil'){const f=x.createLinearGradient(0,0,W,0);['#d2a95c','#f4dcd5','#c9566e','#8f1d33'].forEach((q,i)=>f.addColorStop(i/3,q));x.globalAlpha=.18;x.fillStyle=f;x.fillRect(0,0,W,H);x.globalAlpha=1}x.strokeStyle=c.color;x.lineWidth=4;rounded(x,55,55,W-110,H-110,44);x.stroke();x.fillStyle=finish==='ivory'?'#2a0c15':'#f8ece8';x.font='700 42px "Space Grotesk"';x.fillText('MASTERS UNION',90,135);x.fillStyle=c.color;x.font='700 78px "Space Grotesk"';x.fillText('NATIONS',90,215);x.font='500 20px "DM Mono"';x.fillText('GLOBAL BOARDROOM / OFFICIAL DELEGATE',90,265);x.save();rounded(x,90,330,360,420,24);x.clip();if(state.photo){const im=state.photo,sc=Math.max(360/im.width,420/im.height),w=im.width*sc,h=im.height*sc;x.drawImage(im,90+(360-w)/2,330+(420-h)/2,w,h)}else{x.fillStyle='#ffffff12';x.fillRect(90,330,360,420);x.fillStyle=c.color;x.font='700 120px "Space Grotesk"';x.textAlign='center';x.fillText(initials(name),270,575);x.textAlign='left'}x.restore();x.strokeStyle=c.color;x.lineWidth=2;rounded(x,90,330,360,420,24);x.stroke();x.fillStyle=c.color;x.font='700 140px "Space Grotesk"';x.fillText(c.code,500,455);x.fillStyle=finish==='ivory'?'#5a2f3b':'#d0b4b4';x.font='500 21px "DM Mono"';wrap(x,c.full.toUpperCase(),500,510,470,30);x.fillStyle=finish==='ivory'?'#2a0c15':'#ffffff';x.font='700 70px "Space Grotesk"';wrap(x,name,90,875,890,82);x.fillStyle=c.color;x.font='500 22px "DM Mono"';x.fillText(portfolio.toUpperCase(),94,1040);x.fillStyle=finish==='ivory'?'#5a3a44':'#d0b4b4';x.font='500 24px "Space Grotesk"';x.fillText(school,94,1092);x.strokeStyle=finish==='ivory'?'#2a0c1533':'#ffffff22';x.beginPath();x.moveTo(90,1140);x.lineTo(990,1140);x.stroke();x.fillStyle=finish==='ivory'?'#5a3a44':'#c9aaaa';x.font='500 17px "DM Mono"';x.fillText('28—29 NOV 2026  /  GURUGRAM  /  GB-'+hash(name+c.code).slice(0,6),90,1195);barcode(x,90,1240,500,45,name+c.code);x.fillStyle=c.color;x.fillRect(905,1215,85,85);x.fillStyle='#16060c';x.font='700 24px "Space Grotesk"';x.fillText('MU',929,1267);cv.dataset.name='MUN26-'+name.replace(/\s+/g,'-')+'-'+c.code+'.png'}
function wrap(x,text,x0,y,max,line){const words=text.split(' ');let l='';for(const w of words){const t=l+w+' ';if(x.measureText(t).width>max){x.fillText(l,x0,y);l=w+' ';y+=line}else l=t}x.fillText(l,x0,y)}
function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36).toUpperCase()}
function barcode(x,bx,y,w,h,s){let hsh=parseInt(hash(s),36)||1;x.fillStyle='#f1e0dc';for(let i=0;i<w;i+=8){hsh=(hsh*1664525+1013904223)>>>0;if(hsh%3)x.fillRect(bx+i,y,2+(hsh%5),h)}}
function cardBlob(){return new Promise(r=>$('#cardCanvas').toBlob(r,'image/png'))}
let razorpayLoading=null;
function loadRazorpay(){if(window.Razorpay)return Promise.resolve();if(razorpayLoading)return razorpayLoading;razorpayLoading=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=resolve;s.onerror=()=>reject(new Error('Razorpay Checkout could not load'));document.head.appendChild(s)});return razorpayLoading}
async function beginPayment(){const button=$('#paymentButton'),status=$('#paymentStatus');button.disabled=true;status.textContent='Creating your secure Razorpay order…';try{const orderResponse=await fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('#sName').value.trim(),email:$('input[name=email]',$('#applyForm')).value.trim(),committee:state.committee})});const order=await orderResponse.json();if(!orderResponse.ok)throw new Error(order.error||'Unable to create payment order');await loadRazorpay();$('#paymentAmount').textContent=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(order.amount/100)+' registration fee';const checkout=new window.Razorpay({key:order.keyId,amount:order.amount,currency:order.currency,order_id:order.orderId,name:'Masters Union Nations',description:order.description,prefill:{name:$('#sName').value.trim(),email:$('input[name=email]',$('#applyForm')).value.trim()},theme:{color:(committees.find(c=>c.code===state.committee)||committees[0]).color},modal:{ondismiss:()=>{button.disabled=false;status.textContent='Payment cancelled. Your ID preview is saved in this window.'}},handler:async result=>{try{status.textContent='Verifying payment securely…';const verifyResponse=await fetch('/api/verify-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result)});const verification=await verifyResponse.json();if(!verifyResponse.ok||!verification.verified)throw new Error(verification.error||'Payment verification failed');state.paymentVerified=true;state.paymentId=result.razorpay_payment_id;save();updatePaymentUI();tone(784,.18);setTimeout(()=>tone(1047,.35),120);toast('Payment verified. Your delegate ID is unlocked.')}catch(error){button.disabled=false;status.textContent=error.message||'Payment verification failed. Contact the organising team before retrying.';toast('Payment verification needs attention.')}}});checkout.on('payment.failed',response=>{button.disabled=false;status.textContent=response.error?.description||'Payment failed. No ID was unlocked.'});checkout.open()}catch(error){button.disabled=false;status.textContent=error.message||'Payment could not be started.';toast('Payment setup needs attention.')}}
$('#paymentButton').onclick=beginPayment;
$('#cardDownload').onclick=async()=>{const b=await cardBlob(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=$('#cardCanvas').dataset.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);tone(660,.2)};
$('#cardShare').onclick=async()=>{const b=await cardBlob(),f=new File([b],$('#cardCanvas').dataset.name,{type:'image/png'});if(navigator.canShare?.({files:[f]})){try{await navigator.share({files:[f],title:'My Masters Union Nations delegate ID'})}catch(e){}}else $('#cardDownload').click()};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)}


/* History router integration. Only uses the existing page and map controllers. */
function abortCommitteeJourneyForRoute(){
  if(!committeeJourneyActive)return;
  committeeJourneyActive=false;
  committeeJourneyTimers.forEach(clearTimeout);committeeJourneyTimers=[];
  window.MUNSeq?.release();
  window.MUNMarketCrash?.stop();
  window.MUNStartupLaunch?.stop();
  window.MUNMCCNightFlight?.stop();
  window.MUNCommitteeCinematics?.stop();
  for(const id of ['committeeFlight','ipCinematic','startupLaunch','mccNightFlight','dalalCrash']){
    const layer=$('#'+id);
    if(!layer)continue;
    layer.classList.remove('active','launching','broker-walk','city-awake','idea-phase','valuation-phase','boardroom-phase','title-push','title-reveal','boardroom-flash','handoff','market-awake','market-falling','title-assembling','reduced-motion','nightfall');
    layer.setAttribute('aria-hidden','true');
  }
  document.body.classList.remove('overlay','xfade');
  stopTheme();
}
function closeActiveForRoute(){
  abortCommitteeJourneyForRoute();
  // Navigation away from a committee must not leave a registration overlay
  // floating above the map. No changes are made to the form or its handlers.
  for(const id of ['applyModal','studioModal']){
    const dialog=$('#'+id);
    if(dialog&&(dialog.open||dialog.hasAttribute('open')))closeModal(dialog);
  }
  if($('#committeePage').classList.contains('open'))closeCommitteePage(true);
  if($('#dalalCommitteePage').classList.contains('open'))closeDalalCommitteePage(true);
  if($('#dossier').classList.contains('open'))closeDossier();
  resetMapCamera();
}
function openDirectCommitteeRoute(code){
  const i=committees.findIndex(c=>c.code===code);
  if(i<0)return false;
  // Forward, refresh and external links go straight to the destination page.
  // Clicking a map pin still plays the existing cinematic before the page.
  closeActiveForRoute();
  const c=committees[i];
  current=c;currentCommitteeIndex=i;
  lastCommitteeControl=$$('.node',nodes)[i]||null;
  state.committee=code;save();
  if(code==='DALAL')openDalalCommitteePage();
  else openCommitteePage(c,i);
  return true;
}
window.MUNApp={showCommittee:openDirectCommitteeRoute,closeActive:closeActiveForRoute};

$('#navToggle').onclick=()=>$('#nav').classList.toggle('menu-open');$$('.nav nav a').forEach(a=>a.onclick=()=>$('#nav').classList.remove('menu-open'));window.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#committeeFlight').classList.contains('active')||$('#ipCinematic').classList.contains('active')||$('#startupLaunch').classList.contains('active')||$('#mccNightFlight').classList.contains('active'))finishCommitteeJourney();else if($('#applyModal').open||$('#applyModal').hasAttribute('open'))closeModal($('#applyModal'));else if($('#studioModal').open||$('#studioModal').hasAttribute('open'))closeModal($('#studioModal'));else if($('#dalalCommitteePage').classList.contains('open'))closeDalalCommitteePage();else if($('#committeePage').classList.contains('open'))closeCommitteePage();else if($('#dossier').classList.contains('open'))closeDossier()}});
// The map stage itself never transforms; camera push and pointer drift run on #mapCamera / #mapDrift.
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.animate([{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'none'}],{duration:700,fill:'both',easing:'cubic-bezier(.2,.8,.2,1)'})}),{threshold:.12});$$('.prize-grid article,.role-list button,.contact-row a').forEach(el=>observer.observe(el));
$('#soundToggle').setAttribute('aria-pressed',state.sound);$('#soundToggle span').textContent=state.sound?'Sound on':'Sound off';
(function(){if(!window.MUNSound)return;if(!state.sound&&MUNSound.isOn())MUNSound.set(false);addEventListener('pointerdown',function(){if(state.sound&&!MUNSound.isOn())MUNSound.set(true)},{once:true});})();
})();
