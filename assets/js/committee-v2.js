/* Masters' Union Nations — precision upgrade for MCC, IP, AIPPM, Dalal Street.
   Additive DOM enhancement; existing registration/payment handlers remain untouched
   except the old Dalal inline submit, which is intentionally captured and routed
   to /api/register. No unapproved payment is initiated. */
(() => {
  'use strict';
  const TARGETS = new Set(['MCC', 'IP', 'AIPPM', 'IPL', 'STARTUP', 'UNHRC', 'CCEP']);
  const $ = (selector, parent=document) => parent.querySelector(selector);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = $('#committeePage');
  const dalal = $('#dalalCommitteePage');
  if (!page || !dalal) return;
  const hero = $('.cp-hero',page);
  const actions = $('.cp-register-actions',page);
  let marketTimer = null;
  const mapPan=$('.map-pan');
  let mapWasMobile=false;
  function alignMobileMap(){
    const mobile=matchMedia('(max-width:560px)').matches;
    if(mobile&&!mapWasMobile&&mapPan)mapPan.scrollLeft=Math.max(0,(mapPan.scrollWidth-mapPan.clientWidth)*.44);
    mapWasMobile=mobile;
  }
  requestAnimationFrame(alignMobileMap);
  addEventListener('resize',alignMobileMap,{passive:true});

  function formMarkup(code) {
    const about={CCEP:'Navigating corporate options, funding battles, crisis management and policy negotiations where every decision shapes business and political outcomes.',STARTUP:'Transforming bold ideas into viable startups through business strategy, model development and high-stakes pitches to bring entrepreneurial visions to life.'}[code]||'';
    const label={MCC:'Midnight Crisis Committee',IP:'International Press',AIPPM:'All India Political Parties Meet',IPL:'Indian Premier League',STARTUP:'Startup Boardroom',UNHRC:'UN Human Rights Council',CCEP:'Corporate Engagement and Policy Making',DALAL:'Dalal Street'}[code]||code;
    return `<form class="mu-inline-form" data-committee="${code}" novalidate>
      <h3>Reserve your place.</h3><p>Registration request for <strong>${label}</strong>. Payment will be arranged separately by the organising team.</p>${about?`<p class="mu-about">${about}</p>`:''}
      <div class="mu-fields">
        <label>Full name <input name="name" required minlength="2" maxlength="100" autocomplete="name" placeholder="Your full name"><small class="mu-err" role="alert"></small></label>
        <label>Email address <input name="email" type="email" required maxlength="180" autocomplete="email" autocapitalize="none" spellcheck="false" inputmode="email" placeholder="you@example.com"><small class="mu-err" role="alert"></small></label>
        <label>School / university <input name="institution" required minlength="2" maxlength="180" autocomplete="organization" placeholder="Your institution"><small class="mu-err" role="alert"></small></label>
        <label>Delegate category <select name="category" required><option value="">Select category</option><option value="school">School</option><option value="college">College</option></select><small class="mu-err" role="alert"></small></label>
        <label>Mobile number <input name="phone" type="tel" required inputmode="tel" maxlength="20" autocomplete="tel" placeholder="+91 98765 43210"><small class="mu-err" role="alert"></small></label>
        ${code==='DALAL'?'<label>Your market instinct <textarea name="motivation" rows="3" required maxlength="1000" placeholder="What would you bring to the trading floor?"></textarea><small class="mu-err" role="alert"></small></label>':''}
      </div>
      <input name="website" class="mu-trap" tabindex="-1" autocomplete="off" aria-hidden="true" type="text">
      <label class="mu-consent"><input type="checkbox" name="consent" required> I agree that the Masters' Union Nations team may contact me about this registration.</label><small class="mu-err mu-err-consent" role="alert"></small>
      <input type="hidden" name="applyingFor" value="${code}">
      <div class="mu-form-status" role="status" aria-live="polite"></div>
      <button class="mu-submit" type="submit">Submit registration request <span aria-hidden="true">↗</span></button>
      <small>Only a successful server confirmation counts as a submitted request. No payment is collected here.</small>
    </form>`;
  }

  /* ---- field validation (the server repeats every rule) ---- */
  const NAME_RE=/^[\p{L}][\p{L}\p{M} .'’-]{1,99}$/u;
  const EMAIL_RE=/^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
  const TYPOS={'gmial.com':'gmail.com','gmai.com':'gmail.com','gamil.com':'gmail.com','gmail.co':'gmail.com','gmail.con':'gmail.com','gnail.com':'gmail.com','hotmial.com':'hotmail.com','hotmal.com':'hotmail.com','yahooo.com':'yahoo.com','yaho.com':'yahoo.com','outlok.com':'outlook.com','outloook.com':'outlook.com'};
  const squash=v=>String(v||'').replace(/\s+/g,' ').trim();
  function normalizePhone(raw){
    const v=String(raw||'').replace(/[\s().-]/g,'');
    if(/^\+91[6-9]\d{9}$/.test(v))return v;
    if(/^(?:91|0)?[6-9]\d{9}$/.test(v))return '+91'+v.slice(-10);
    if(/^\+(?!91)[1-9]\d{7,14}$/.test(v))return v;
    return '';
  }
  const RULES={
    name:v=>NAME_RE.test(squash(v))?'':'Enter your full name using letters only.',
    email:v=>{const e=squash(v).toLowerCase();if(!EMAIL_RE.test(e)||e.includes('..'))return 'Enter a valid email address, like you@example.com.';const fix=TYPOS[e.split('@')[1]];return fix?'Did you mean @'+fix+'?':''},
    institution:v=>{const i=squash(v);return i.length>=2&&/\p{L}/u.test(i)?'':'Enter your school or university.'},
    category:v=>v==='school'||v==='college'?'':'Choose School or College.',
    phone:v=>normalizePhone(squash(v))?'':'Enter a valid mobile number (10 digits, or with a country code like +91).',
    motivation:v=>squash(v).length>=3?'':'Tell us a little about your market instinct.',
    consent:v=>v?'':'Please tick the consent box.'
  };
  function fieldOf(form,name){return form.elements[name]}
  function errBox(form,name){if(name==='consent')return $('.mu-err-consent',form);const f=fieldOf(form,name);return f&&f.closest('label')&&$('.mu-err',f.closest('label'))}
  function setError(form,name,msg){
    const f=fieldOf(form,name),box=errBox(form,name);if(!f)return;
    if(box)box.textContent=msg||'';
    f.classList.toggle('mu-invalid',Boolean(msg));f.setAttribute('aria-invalid',msg?'true':'false');
  }
  function checkField(form,name){
    const f=fieldOf(form,name);if(!f||!RULES[name])return '';
    const msg=RULES[name](name==='consent'?f.checked:f.value);setError(form,name,msg);return msg;
  }
  function validateForm(form){
    let first=null;
    Object.keys(RULES).forEach(n=>{const m=checkField(form,n);if(m&&!first)first=fieldOf(form,n)});
    return first;
  }
  document.addEventListener('focusout',e=>{const f=e.target;const form=f.closest&&f.closest('.mu-inline-form');if(form&&RULES[f.name])checkField(form,f.name)});
  document.addEventListener('input',e=>{const f=e.target;const form=f.closest&&f.closest('.mu-inline-form');if(form&&RULES[f.name]&&f.classList.contains('mu-invalid'))checkField(form,f.name)});
  document.addEventListener('change',e=>{const f=e.target;const form=f.closest&&f.closest('.mu-inline-form');if(form&&RULES[f.name]&&f.classList.contains('mu-invalid'))checkField(form,f.name)});

  function makeForm(code) {
    let form = $('.mu-inline-form',actions);
    if (form && form.dataset.committee===code) return;
    form?.remove();
    if (!TARGETS.has(code)) return;
    actions.insertAdjacentHTML('beforeend',formMarkup(code));
  }

  // Replace the legacy Dalal-only form with the same validated form used above.
  const legacyDalalForm=$('#dalalInlineForm');
  if(legacyDalalForm){
    const template=document.createElement('template');template.innerHTML=formMarkup('DALAL').trim();
    const sharedForm=template.content.firstElementChild;sharedForm.id='dalalInlineForm';sharedForm.classList.add('dp-form');
    legacyDalalForm.replaceWith(sharedForm);
  }

  function gotoRegister() {
    const scroller=$('#committeePageScroll'),target=$('#cpRegister');
    if (!scroller || !target) return;
    const offset=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop;
    scroller.scrollTo({top:Math.max(0,offset-20),behavior:reduced()?'instant':'smooth'});
    setTimeout(()=>$('.mu-inline-form input[name="name"]',target)?.focus({preventScroll:true}),reduced()?0:450);
  }
  let jump = $('.mu-start-registration',hero);
  if (!jump) {jump=document.createElement('button');jump.type='button';jump.className='mu-start-registration';jump.textContent='Start registration ↓';jump.addEventListener('click',gotoRegister);const copy=$('.cp-hero-copy',hero),primary=copy&&$('.cp-primary',copy);if(primary){const row=document.createElement('div');row.className='cp-cta-row';primary.before(row);row.append(primary,jump)}else copy?.append(jump);}
  const dalalHero=$('.dp-hero-copy',dalal);
  if(dalalHero)$('.mu-dalal-register',dalalHero)?.addEventListener('click',gotoDalalRegister);
  function gotoDalalRegister(){
    const scroller=$('#dalalPageScroll'),target=$('#dalalRegister');if(!scroller||!target)return;
    const offset=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop;
    scroller.scrollTo({top:Math.max(0,offset-18),behavior:reduced()?'instant':'smooth'});
    setTimeout(()=>$('#dalalInlineForm input[name="name"]',target)?.focus({preventScroll:true}),reduced()?0:450);
  }
  dalal.addEventListener('click',e=>{const control=e.target.closest('.dp-nav-cta');if(!control)return;e.preventDefault();gotoDalalRegister();},true);
  // Keep the existing registration CTA for other committees. Intercept only MCC.
  page.addEventListener('click',e=>{
    if(!TARGETS.has(page.dataset.committee)) return;
    const btn=e.target.closest('#committeePageApply,.cp-nav-register');
    if (!btn) return;
    e.preventDefault();e.stopImmediatePropagation();gotoRegister();
  },true);

  async function postRegistration(form,code){
    const status=$('.mu-form-status',form)||$('#dalalFormNote');
    const button=$('[type="submit"]',form);
    if(form.dataset.busy==='1'||form.classList.contains('mu-submitted'))return;
    const bad=validateForm(form);
    if(bad){if(status)status.textContent='Please correct the highlighted fields.';bad.focus({preventScroll:false});return;}
    const payload={
      name:squash(form.elements.name.value),email:squash(form.elements.email.value).toLowerCase(),institution:squash(form.elements.institution.value),
      category:form.elements.category.value,phone:normalizePhone(squash(form.elements.phone.value)),motivation:form.elements.motivation?squash(form.elements.motivation.value):'',
      website:form.elements.website.value,applyingFor:code,consent:form.elements.consent.checked
    };
    form.dataset.busy='1';button.disabled=true;if(status)status.textContent='Submitting securely…';
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
    try {
      const response=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.ok!==true){
        if(result.fields)Object.keys(result.fields).forEach(n=>setError(form,n,result.fields[n]));
        const msg=response.status===503?'Registration submissions are not open yet. Please check back soon.':response.status===409?(result.error||'This email is already registered.'):(result.error||'The server did not confirm this registration. Please retry.');
        const err=new Error(msg);err.handled=true;throw err;
      }
      form.classList.add('mu-submitted');
      if(status)status.textContent='Your registration request was received. The team will contact you with the next steps. No payment has been collected.';
      button.textContent='Request received ✓';
      form.dispatchEvent(new CustomEvent('mun:registered',{bubbles:true,detail:{name:payload.name,email:payload.email,institution:payload.institution,category:payload.category,committee:code,delegate:result.delegate||null}}));
    }catch(e){
      if(status)status.textContent=e.name==='AbortError'?'The connection timed out. Please retry; do not assume your request was saved.':(e.handled?e.message:'We could not reach the server. Check your connection and retry.');
      button.disabled=false;
    }
    finally{clearTimeout(timeout);form.dataset.busy='0';}
  }
  document.addEventListener('submit',e=>{const form=e.target.closest('.mu-inline-form');if(!form)return;e.preventDefault();postRegistration(form,form.dataset.committee);});
  const cpRegistration=$('#cpRegister');
  if(cpRegistration){const label=$('small',cpRegistration);if(label)label.textContent='DELEGATE REGISTRATION';const copy=$('p',cpRegistration);if(copy)copy.innerHTML='Share your details to reserve a place. The organising team will contact you with the next steps. <strong class="mu-no-payment-warning">NO PAYMENT IS COLLECTED HERE.</strong>';}
  const dalalRegistrationCopy=$('.dp-register-copy',dalal);
  if(dalalRegistrationCopy){const label=$('small',dalalRegistrationCopy);if(label)label.textContent='DELEGATE REGISTRATION';const heading=$('h2',dalalRegistrationCopy);if(heading)heading.hidden=true;const copy=$('p',dalalRegistrationCopy);if(copy)copy.innerHTML='Share your details to reserve a place. The organising team will contact you with the next steps. <strong class="mu-no-payment-warning">NO PAYMENT IS COLLECTED HERE.</strong>';}

  const dalalRegister=$('#dalalRegister');
  if(dalalRegister){
    new IntersectionObserver(entries=>{
      dalal.classList.toggle('at-register',entries.some(entry=>entry.isIntersecting));
    },{root:$('#dalalPageScroll'),threshold:.05}).observe(dalalRegister);
  }

  function addIPNewspapers() {
    const depth=$('.ip-cinema-depth');if (!depth || $('[data-mu-paper]',depth))return;
    const stories=[
      ['THE UNION CHRONICLE','EIGHT COMMITTEES. ONE WORLD.','MASTERS\' UNION NATIONS / 2026'],
      ['THE DIPLOMAT','DEBATE BEYOND BORDERS','THE GLOBAL BOARDROOM'],
      ['THE GAZETTE','GENEVA TO NEW DELHI','WORLD AFFAIRS / SPECIAL EDITION'],
      ['THE CAMPUS POST','YOUNG VOICES. REAL DECISIONS.','28–29 NOVEMBER 2026'],
      ['THE EDITORIAL','WHERE IDEAS MAKE HEADLINES','DELEGATE EDITION / GURUGRAM'],
    ];
    const camera=$('.ip-camera-rig',depth);
    stories.forEach(([name,headline,sub],i)=>{
      const el=document.createElement('article');el.className=`ip-paper mu-extra-paper mu-extra-${i+1}`;el.dataset.muPaper='true';
      const header=document.createElement('header');const title=document.createElement('b');title.textContent=name;const small=document.createElement('small');small.textContent=sub;
      header.append(title,small);const h=document.createElement('h2');h.textContent=headline;
      const columns=document.createElement('div');columns.className='ip-paper-columns';for(let j=0;j<3;j++)columns.append(document.createElement('i'));
      el.append(header,h,columns);camera?.before(el);
    });
  }

  function newsroom(scene){
    if (!scene || $('.mu-newsroom-stage',scene))return;
    scene.insertAdjacentHTML('beforeend','<div class="mu-newsroom-stage" aria-hidden="true"></div>');
  }

  let aippmObserver=null;
  let aippmInView=false;
  let aippmFrame=0;
  let aippmTimer=null;
  const spritePositions=['0%','33.3333%','66.6667%','100%'];
  function paintAippmSprites(){
    $$('.mu-sprite-frame',page).forEach((sprite,index)=>{
      sprite.style.backgroundPositionX=spritePositions[(aippmFrame+index)%4];
    });
  }
  function syncAippmMotion(){
    const play=page.classList.contains('open')&&page.dataset.committee==='AIPPM'&&aippmInView&&!document.hidden&&!reduced();
    if(play&&!aippmTimer){
      aippmTimer=setInterval(()=>{aippmFrame=(aippmFrame+1)%4;paintAippmSprites();},230);
    }else if(!play&&aippmTimer){
      clearInterval(aippmTimer);aippmTimer=null;
    }
    if(reduced()){aippmFrame=0;paintAippmSprites();}
  }
  function $$(selector,parent=document){return [...parent.querySelectorAll(selector)];}
  document.addEventListener('visibilitychange',syncAippmMotion);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',syncAippmMotion);
  function parliament(scene){
    if (!scene || $('.mu-parliament-stage',scene))return;
    scene.insertAdjacentHTML('beforeend',`<div class="mu-parliament-stage" aria-hidden="true">
      <div class="mu-parliament-haze"></div><div class="mu-parliament-aisle"></div>
    </div>`);
    // Four-frame transparent sheets supplied for this AIPPM foreground.
    // One timer updates only visible sprites; no video or canvas loop is needed.
    const placements=[
      ['shah','amit_shah_dozing_bench_sprite_sheet.webp','11%'],
      ['modi','modi_teacup_sprite_sheet.webp','29%'],
      ['meloni','giorgia_meloni_teacup_sprite_sheet.webp','40%'],
      ['ravi','ravi_kishan_dance_sprite_sheet.webp','55%'],
      ['rahul','rahul_gandhi_walk_cycle.webp','78%'],
      ['sonia','sonia_gandhi_walk_cycle.webp','89%']
    ];
    const hero=scene.closest('.cp-hero');
    let stage=$(':scope > .mu-character-stage',hero);
    if(!stage){stage=document.createElement('div');stage.className='mu-character-stage';stage.setAttribute('aria-hidden','true');hero.append(stage);}
    stage.replaceChildren();
    placements.forEach(([key,file,x])=>{
      const figure=document.createElement('figure');figure.className=`mu-sprite-character mu-sprite-${key}`;
      figure.style.setProperty('--stage-x',x);
      const shadow=document.createElement('span');shadow.className='mu-sprite-shadow';
      const artwork=document.createElement('span');artwork.className='mu-sprite-frame';
      artwork.style.backgroundImage=`url("assets/images/aippm-sprites/${file}")`;
      figure.append(shadow,artwork);stage.append(figure);
    });
    aippmFrame=0;paintAippmSprites();
    aippmObserver?.disconnect();aippmInView=false;
    aippmObserver=new IntersectionObserver(entries=>{aippmInView=entries.some(entry=>entry.isIntersecting);syncAippmMotion();},{root:$('#committeePageScroll'),threshold:.05});
    aippmObserver.observe(scene);
    if(stage.children.length){
      const disclosure=document.createElement('p');disclosure.className='mu-illustration-label';
      disclosure.textContent='STYLIZED SATIRE · FICTIONAL SCENE';
      scene.append(disclosure);
    }
  }

  // Representative company names are from the local kit; every quote below is simulated.
  const fallbackSymbols=['RELIANCE','TCS','HDFCBANK','ICICIBANK','INFY','SBIN','TATAMOTORS','TATASTEEL','ITC','BHARTIARTL','LT'];
  const indexSymbols=['MU100','IPO-MU','MUFIN'];
  const makeQuote=(symbol,i)=>({symbol,price:Math.round((185+i*173.71)*100)/100,change:0,trend:i%3===1?-1:1});
  let marketData=fallbackSymbols.map(makeQuote);
  let indexData=indexSymbols.map((symbol,i)=>({...makeQuote(symbol,i+16),price:Math.round((1800+i*6420.5)*100)/100}));
  let marketOffset=0,marketTicks=0,marketInView=false;
  fetch('assets/data/fictional_market_symbols.json').then(response=>{if(!response.ok)throw Error('Market symbol data unavailable');return response.json()}).then(feed=>{
    const companies=(feed.companies||[]).map(item=>item.symbol).filter(symbol=>typeof symbol==='string'&&/^[A-Z0-9-]{2,16}$/.test(symbol));
    const indices=(feed.indices||[]).map(item=>item.symbol).filter(symbol=>typeof symbol==='string'&&/^[A-Z0-9-]{2,16}$/.test(symbol));
    if(companies.length>=5)marketData=companies.map(makeQuote);
    if(indices.length)indexData=indices.map((symbol,i)=>({...makeQuote(symbol,i+16),price:Math.round((1800+i*6420.5)*100)/100}));
    paintMarket();
  }).catch(()=>{});
  function board(){
    const hero=$('.dp-hero',dalal);if(!hero||$('.mu-market-board',hero))return;
    hero.insertAdjacentHTML('beforeend',`<div class="mu-market-board" aria-label="Fictional simulated market display">
      <div class="mu-market-top"><b>MU EXCHANGE</b><span>SIMULATED MARKET — NOT LIVE PRICES</span><time>SESSION 2026</time></div>
      <div class="mu-market-indices" aria-label="Simulated market indices"></div>
      <div class="mu-market-head"><span>SYMBOL</span><span>LAST PRICE</span><span>CHANGE</span><span>STATUS</span></div>
      <div class="mu-market-rows"></div>
      <div class="mu-market-bottom"><span>IPO DESK · GLOBAL BOARDROOM</span><span>THIS IS A FICTIONAL MARKET SIMULATION</span></div>
    </div>`);
    const container=$('.mu-market-rows',hero);
    for(let i=0;i<5;i++){
      const r=document.createElement('div');r.className='mu-market-row';r.dataset.row=i;
      r.innerHTML='<span data-symbol></span><strong data-price></strong><span data-change></span><span data-status></span>';
      container.appendChild(r);
    }
    paintMarket();
    const target=$('.mu-market-board',hero);
    const observer=new IntersectionObserver(entries=>{marketInView=entries.some(entry=>entry.isIntersecting);if(marketInView)startMarket();else stopMarket();},{root:$('#dalalPageScroll'),threshold:.08});observer.observe(target);
  }
  function paintMarket(){
    const rows=dalal.querySelectorAll('.mu-market-row');
    rows.forEach((row,i)=>{
      const quote=marketData[(marketOffset+i)%marketData.length];if(!quote)return;
      $('[data-symbol]',row).textContent=quote.symbol;
      $('[data-price]',row).textContent=quote.price.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
      const change=$('[data-change]',row);change.textContent=`${quote.trend>0?'▲':'▼'} ${Math.abs(quote.change).toFixed(2)}%`;change.className=quote.trend>0?'up':'down';
      $('[data-status]',row).textContent=quote.trend>0?'ACTIVE':'WATCH';
      row.classList.remove('market-tick');void row.offsetWidth;row.classList.add('market-tick');
    });
    const indexBar=$('.mu-market-indices',dalal);
    if(indexBar)indexBar.replaceChildren(...indexData.map(item=>{const chip=document.createElement('span');chip.textContent=`${item.symbol} ${item.price.toLocaleString('en-IN',{maximumFractionDigits:0})} ${item.trend>0?'▲':'▼'}`;chip.className=item.trend>0?'up':'down';return chip;}));
  }
  function updateMarket(){
    if (document.hidden||!dalal.classList.contains('open')||!marketInView){stopMarket();return;}
    const drift=quote=>{const change=(Math.random()-.5)*1.35;return {...quote,price:Math.max(1,quote.price*(1+change/100)),change,trend:change>=0?1:-1}};
    marketData=marketData.map(drift);indexData=indexData.map(drift);
    marketTicks++;if(marketTicks%4===0)marketOffset=(marketOffset+5)%marketData.length;
    paintMarket();
  }
  function startMarket(){if (marketTimer||reduced()||document.hidden||!marketInView||!dalal.classList.contains('open'))return;marketTimer=setInterval(updateMarket,1100);}
  function stopMarket(){if (marketTimer){clearInterval(marketTimer);marketTimer=null;}}
  document.addEventListener('visibilitychange',()=>document.hidden?stopMarket():startMarket());
  new MutationObserver(()=>dalal.classList.contains('open')?startMarket():stopMarket()).observe(dalal,{attributes:true,attributeFilter:['class']});

  function refresh(){
    if(!page.classList.contains('open')){syncAippmMotion();return;}
    const code=page.dataset.committee||'';
    makeForm(code);
    jump.hidden=!TARGETS.has(code);
    const mccTag=$('.mu-mcc-tagline',hero);if(mccTag)mccTag.hidden=code!=='MCC';
    // committee-cinematics.js reconstructs scene innerHTML whenever a page opens.
    const scene=$('.cinema-hero-scene',hero);
    if(code==='IP')newsroom(scene);
    if(code==='AIPPM')parliament(scene);
    syncAippmMotion();
  }
  addIPNewspapers();board();
  const observer=new MutationObserver(refresh);observer.observe(page,{attributes:true,attributeFilter:['class','data-committee']});
  refresh();
})();

/* ZERO revamp — committee pages (see docs/revamp-spec.md).
   Diplomatic labels, committee-specific headlines, prize cheques, the
   "take your seat" placard and scroll reveals. Purely additive: every
   existing id, form and handler is reused, never replaced. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = $('#committeePage'), dalal = $('#dalalCommitteePage');
  if (!page || !dalal) return;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COORD = { UNHRC:'46.20°N  6.14°E', MCC:'40.71°N  74.01°W', CCEP:'1.35°N  103.82°E', IPL:'12.97°N  77.59°E', AIPPM:'28.61°N  77.21°E', STARTUP:'37.77°N  122.42°W', IP:'51.51°N  0.13°W', DALAL:'19.08°N  72.88°E' };
  /* hero: [wide word, serif half]; then per-section [line, serif line] */
  const COPY = {
    UNHRC: { hero:['UNHRC','Human rights cannot wait.'], dossier:["The case file","on trafficking."], mandate:["How the room","moves forward."], mandateP:"Every response must distinguish exploitation from trafficking and respect the Council’s mandate.", citation:'for the strongest case.', seat:['Geneva is','holding your seat.'] },
    MCC:   { hero:['MIDNIGHT CRISIS','When the clock stops, judgment begins.'], dossier:["DEATH","is dead."], mandate:["ANSWER BEFORE","the dawn does."], mandateP:"The realms are collapsing. Before dawn, the court must answer: who killed Death, and who rules in Death’s place?", citation:'for the steadiest hand.', seat:['Take the chair','before midnight.'] },
    CCEP:  { hero:['CCEP','The future is negotiable.'], dossier:['Markets meet','the rulebook.'], mandate:['Price every','trade-off.'], mandateP:'Founders, regulators and economies argue over who pays and who grows. Bring numbers, not slogans.', citation:'on the ledger.', seat:['Singapore is','at the table.'] },
    IPL:   { hero:['IPL','Every bid builds a champion.'], dossier:["THE PURSE","is open."], mandate:["BID, BUILD,","win the season."], mandateP:"", citation:'for the auction room.', seat:['Paddle up.','It is your bid.'] },
    AIPPM: { hero:['AIPPM','The House is in session.'], dossier:["एक राष्ट्र,","एक संहिता."], mandate:["Hold your line.","बहुमत बनाइए."], mandateP:"Equality, faith and federalism meet at one table. Build consensus without losing conviction.", citation:'for the House.', seat:['The Speaker','calls your name.'] },
    STARTUP:{ hero:['STARTUP','Build the next big thing.'], dossier:["LET’S MAKE","India better."], mandate:["HOW THE ROOM","moves forward."], mandateP:"Every team gets a mentor, every idea faces scrutiny, and the best pitches go in front of real investors.", citation:'for the boldest venture.', seat:['Pull up a chair','in the boardroom.'] },
    IP:    { hero:['THE PRESS','Every story changes the narrative.'], dossier:["THE SUMMIT,","on the record."], mandate:["OBSERVE. VERIFY.","Publish."], mandateP:"", citation:'for the byline.', seat:['Your press pass','is waiting.'] }
  };
  const NUM = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  const under100 = n => n < 20 ? NUM[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + NUM[n % 10] : '');
  function rupeesInWords(text) {
    const n = Number(String(text).replace(/[^\d]/g, ''));
    if (!n || n >= 1e7) return '';
    const parts = [], lakh = Math.floor(n / 1e5), th = Math.floor(n % 1e5 / 1e3), hu = Math.floor(n % 1e3 / 100), rest = n % 100;
    if (lakh) parts.push(under100(lakh) + ' lakh'); if (th) parts.push(under100(th) + ' thousand'); if (hu) parts.push(NUM[hu] + ' hundred'); if (rest) parts.push(under100(rest));
    return 'Rupees ' + parts.join(' ') + ' only';
  }
  const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

  function lines(h2, a, b) {
    if (!h2) return;
    const l1 = document.createElement('span'), i1 = document.createElement('span'), l2 = document.createElement('span'), i2 = document.createElement('em');
    l1.className = l2.className = 'rv-line'; i1.className = i2.className = 'rv-li';
    i1.textContent = a; i2.textContent = b; l1.append(i1); l2.append(i2);
    h2.replaceChildren(l1, l2); h2.dataset.rv = '';
  }
  /* static h2s: "Line<br><em>line</em>" -> reveal lines, keeps the words */
  function splitStatic(h2) {
    if (!h2 || h2.dataset.rvSplit) return;
    const em = $('em', h2), first = [...h2.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (!em || !first) return;
    lines(h2, first, em.textContent.trim()); h2.dataset.rvSplit = '1';
  }
  function label(el, text) { if (el) { el.textContent = text; el.classList.add('rv-label'); el.dataset.rv = ''; } }

  /* ---- prizes as engraved cheques ---- */
  function cheque(article, i, code) {
    if (article.dataset.rvPrize) return;
    const amount = ($('b', article)?.textContent || '').trim();
    const words = rupeesInWords(amount);
    if (!amount || !words) return;
    article.dataset.rvPrize = '1'; article.dataset.rv = '';
    article.classList.add('rv-prize', 'rv-prize-total');
    article.style.setProperty('--i', '0');
    article.setAttribute('aria-label', 'Total prize pool for ' + code + ': ' + amount);
    article.innerHTML = `<div class="rv-cheque rv-cheque-total" aria-hidden="true">
      <span class="rv-cq-watermark">ZERO</span>
      <p class="rv-cq-top"><span>MASTERS' UNION NATIONS</span><span>28—29 NOV 2026</span></p>
      <div class="rv-cq-security"><span>CEREMONIAL · NOT NEGOTIABLE</span><span class="cq-seal">MU</span></div>
      <p class="rv-cq-pay"><small>PAY TO THE ORDER OF</small><em>${code} — Total Committee Prize Pool</em></p>
      <p class="rv-cq-sum"><span class="rv-cq-words">Rupees ${words} only</span><b>${amount}</b></p>
      <p class="rv-cq-foot"><span>REF: MUN/ZERO/${code}/2026</span><span>ZERO · THE WORLD RESET</span></p>
    </div>`;
  }

  /* ---- take your seat: delegate placard, press-and-hold or click ---- */
  const HOLD = 900;
  function placard(host, code, action, nameInput) {
    let seat = $('.rv-seat', host);
    if (!seat) {
      seat = document.createElement('div'); seat.className = 'rv-seat'; seat.dataset.rv = '';
      seat.innerHTML = `<button class="rv-placard" type="button"><span class="rv-placard-face"><small>DELEGATE · <span class="rv-pc-code"></span></small><b class="rv-pc-name">Your name</b><i class="rv-pc-rule"></i><span class="rv-pc-cta">Take your seat</span></span><span class="rv-placard-fill" aria-hidden="true"><b>Seated</b></span></button><p class="rv-seat-hint" aria-hidden="true">Hold to raise your placard</p>`;
      host.prepend(seat);
      const btn = $('.rv-placard', seat); let t = 0, raisedAt = 0;
      const raise = () => {
        clearTimeout(t); btn.classList.remove('holding'); btn.classList.add('raised'); raisedAt = Date.now();
        navigator.vibrate?.(12);
        setTimeout(() => btn.classList.remove('raised'), 2200);
        seat._action?.();
      };
      btn.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        btn.classList.remove('raised'); btn.classList.add('holding');
        t = setTimeout(raise, reduced() ? 0 : HOLD);
      });
      const cancel = () => { clearTimeout(t); btn.classList.remove('holding'); };
      btn.addEventListener('pointerup', cancel); btn.addEventListener('pointerleave', cancel); btn.addEventListener('pointercancel', cancel);
      /* a normal click / Enter / Space still registers */
      btn.addEventListener('click', () => { if (Date.now() - raisedAt < 600) return; raise(); });
      btn.addEventListener('contextmenu', e => { if (btn.classList.contains('holding')) e.preventDefault(); });
    }
    seat._action = action;
    $('.rv-pc-code', seat).textContent = code;
    const btn = $('.rv-placard', seat);
    btn.setAttribute('aria-label', `Take your seat in ${code}: start registration`);
    const sync = () => { const v = (nameInput()?.value || '').trim(); $('.rv-pc-name', seat).textContent = v ? v.slice(0, 32) : 'Your name'; };
    sync(); seat._sync = sync;
    return seat;
  }
  document.addEventListener('input', e => { if (e.target.name !== 'name') return; const host = e.target.closest('#cpRegister,#dalalRegister'); $('.rv-seat', host || document.body)?._sync?.(); });

  /* ---- reveals + parallax, per scroller ---- */
  function revealer(scroller, root) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); } }), { root: scroller, rootMargin: '0px 0px -12% 0px', threshold: .12 });
    let raf = 0;
    const paint = () => { raf = 0; const p = Math.min(1.4, scroller.scrollTop / Math.max(1, scroller.clientHeight)); root.style.setProperty('--rv-p', p.toFixed(3)); };
    scroller.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    return () => {
      $$('[data-rv]', root).forEach(el => { el.classList.remove('rv-in'); io.observe(el); });
      $$('.cp-steps>li,.dp-playbook li,.cp-brief-copy>*,.dp-brief-copy>*', root).forEach((el, i) => { el.dataset.rv = ''; el.style.setProperty('--i', i % 4); el.classList.remove('rv-in'); io.observe(el); });
      root.style.setProperty('--rv-p', 0); root.classList.remove('rv-open'); void root.offsetWidth;
      root.classList.add('rv-open');
    };
  }
  const replayShared = revealer($('#committeePageScroll'), page);
  const replayDalal = revealer($('#dalalPageScroll'), dalal);

  /* ---- shared page ---- */
  function decorateShared() {
    const code = page.dataset.committee || '';
    const c = COPY[code];
    if (!c) return;
    // Plain DOM headings: no animated wrappers that could remain invisible.
    const setEditorialHeading=(selector,parts)=>{
      const h=$(selector,page);
      if(!h||!parts||parts.length!==2)return;
      const br=document.createElement('br'),em=document.createElement('em');
      em.textContent=parts[1];
      h.replaceChildren(document.createTextNode(parts[0]),br,em);
      h.removeAttribute('data-rv');
      h.removeAttribute('data-rv-split');
    };
    // Restore original CCEP copy when revisiting it after another committee.
    const dossier=code==='CCEP'?['Understand','what is at stake.']:c.dossier;
    const mandate=code==='CCEP'?['How the room','moves forward.']:c.mandate;
    const mandateText=code==='CCEP'
      ?'Every committee rewards preparation, clear thinking and the ability to work with the room.'
      :(c.mandateP||'');
    setEditorialHeading('.cp-section-label h2',dossier);
    setEditorialHeading('.cp-do-head h2',mandate);
    const intro=$('.cp-do-head>p',page);
    if(intro){intro.textContent=mandateText;intro.hidden=!mandateText;intro.style.display=mandateText?'':'none';}
    // Recognition names only. The cumulative cheque and amounts are unchanged.
    const awardNames={
      MCC:['Keeper of Eternity','Voice of the Court · College','Voice of the Court · School'],
      AIPPM:['Best Parliamentarian','Distinguished Legislator · College','Distinguished Legislator · School']
    };
    const awardsHead=$('.cp-awards-head',page);
    if(awardsHead){
      let names=$('.mun-award-names',awardsHead);
      if(!names){names=document.createElement('p');names.className='mun-award-names';awardsHead.appendChild(names);}
      const arr=awardNames[code]||[];
      names.replaceChildren(...arr.map((title,i)=>{
        const span=document.createElement('span'),rank=document.createElement('b');
        rank.textContent=['I','II','III'][i]||'';
        span.append(rank,document.createTextNode(' — '+title));
        return span;
      }));
      names.hidden=arr.length===0;names.style.display=arr.length?'':'none';
    }
    const awards = $$('#cpAwardsList article', page);
    page.dataset.awards = '1';
    awards.forEach((art, i) => cheque(art, i, code));
    const reg = $('#cpRegister>div:first-child', page);
    if (reg) { label($('small', reg), 'CREDENTIALS'); const h = $('h2', reg); lines(h, ...c.seat); h.classList.add('rv-seat-h'); }
    placard($('.cp-register-actions', page), code, () => $('#committeePageApply')?.click(), () => $('.mu-inline-form input[name="name"]', page));
    replayShared();
  }
  let sharedKey = '';
  new MutationObserver(() => {
    const key = page.classList.contains('open') ? page.dataset.committee || '' : '';
    if (key && key !== sharedKey) decorateShared();
    sharedKey = key;
  }).observe(page, { attributes: true, attributeFilter: ['class', 'data-committee'] });

  /* ---- Dalal Street ---- */
  (function decorateDalal() {
    $$('.dp-awards>article', dalal).forEach((article, i) => cheque(article, i, 'DALAL'));
    const dalalAwardsHead=$('.dp-awards-head',dalal);
    if(dalalAwardsHead&&!$('.mun-award-names',dalalAwardsHead)){
      const caption=document.createElement('p');caption.className='mun-award-names';
      const label=document.createElement('span');label.textContent='I — BULL OF THE FLOOR';
      caption.appendChild(label);dalalAwardsHead.appendChild(caption);
    }

    const copy = $('.dp-register-copy', dalal);
    if (copy) {
      label($('small', copy), 'CREDENTIALS');
      const h = $('h2', copy); if (h) { h.hidden = false; splitStatic(h); h.classList.add('rv-seat-h'); }
      const seat = placard(copy, 'DALAL', () => $('.mu-dalal-register', dalal)?.click(), () => $('#dalalInlineForm input[name="name"]'));
      copy.append(seat);
    }
  })();
  let dalalOpen = false;
  new MutationObserver(() => { const open = dalal.classList.contains('open'); if (open && !dalalOpen) replayDalal(); dalalOpen = open; }).observe(dalal, { attributes: true, attributeFilter: ['class'] });
})();
