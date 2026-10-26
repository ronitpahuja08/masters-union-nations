/* Masters' Union Nations — precision upgrade for MCC, IP, AIPPM, Dalal Street.
   Additive DOM enhancement; existing registration/payment handlers remain untouched
   except the old Dalal inline submit, which is intentionally captured and routed
   to /api/register. No unapproved payment is initiated. */
(() => {
  'use strict';
  const TARGETS = new Set(['MCC', 'IP', 'AIPPM']);
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
    const label={MCC:'Midnight Crisis Committee',IP:'International Press',AIPPM:'All India Political Parties Meet',DALAL:'Dalal Street'}[code]||code;
    return `<form class="mu-inline-form" data-committee="${code}" novalidate>
      <h3>Reserve your place.</h3><p>Registration request for <strong>${label}</strong>. Payment will be arranged separately by the organising team.</p>
      <div class="mu-fields">
        <label>Full name <input name="name" required minlength="2" maxlength="100" autocomplete="name" placeholder="Your full name"></label>
        <label>Email address <input name="email" type="email" required maxlength="180" autocomplete="email" placeholder="you@example.com"></label>
        <label>School / university <input name="institution" required maxlength="180" autocomplete="organization" placeholder="Your institution"></label>
        <label>Delegate category <select name="category" required><option value="">Select category</option><option value="school">School</option><option value="college">College</option></select></label>
        <label>Phone number <input name="phone" type="tel" inputmode="tel" required maxlength="16" pattern="[+]?[0-9]{7,15}" autocomplete="tel" title="Enter 7–15 digits, optionally starting with +; omit spaces." placeholder="+919876543210"></label>
      </div>
      <input name="website" class="mu-trap" tabindex="-1" autocomplete="off" aria-hidden="true" type="text">
      <label class="mu-consent"><input type="checkbox" name="consent" required> I agree that the Masters' Union Nations team may contact me about this registration.</label>
      <input type="hidden" name="applyingFor" value="${code}">
      <div class="mu-form-status" role="status" aria-live="polite"></div>
      <button class="mu-submit" type="submit">Submit registration request <span aria-hidden="true">↗</span></button>
      <small>Only a successful server confirmation counts as a submitted request. No payment is collected here.</small>
    </form>`;
  }

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
  if (!jump) {jump=document.createElement('button');jump.type='button';jump.className='mu-start-registration';jump.textContent='Start registration ↓';jump.addEventListener('click',gotoRegister);$('.cp-hero-copy',hero)?.append(jump);}
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
    if (!form.reportValidity()) {if(status)status.textContent='Please complete the required fields.';return;}
    const payload=Object.fromEntries(new FormData(form).entries());
    payload.applyingFor=code;
    payload.consent=$('[name="consent"]',form)?.checked||false;
    button.disabled=true; if(status)status.textContent='Submitting securely…';
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    try {
      const response=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.ok!==true)throw new Error(response.status===503?'Registration submissions are not open yet. Please check back after the team configures the database.':result.error||'The server did not confirm this registration. Please retry.');
      form.classList.add('mu-submitted');
      if(status)status.textContent='Your registration request was received. The team will contact you with the next steps. No payment has been collected.';
      button.textContent='Request received ✓';
    }catch(e){if(status)status.textContent=e.name==='AbortError'?'The connection timed out. Please retry; do not assume your request was saved.':e.message;button.disabled=false;}
    finally{clearTimeout(timeout);}
  }
  document.addEventListener('submit',e=>{const form=e.target.closest('.mu-inline-form');if(!form)return;e.preventDefault();postRegistration(form,form.dataset.committee);});
  const cpRegistration=$('#cpRegister');
  if(cpRegistration){const label=$('small',cpRegistration);if(label)label.textContent='DELEGATE REGISTRATION';const copy=$('p',cpRegistration);if(copy)copy.textContent='Share your details to reserve a place. The organising team will contact you with the next steps; no payment is collected here.';}
  const dalalRegistrationCopy=$('.dp-register-copy',dalal);
  if(dalalRegistrationCopy){const label=$('small',dalalRegistrationCopy);if(label)label.textContent='DELEGATE REGISTRATION';const heading=$('h2',dalalRegistrationCopy);if(heading)heading.hidden=true;const copy=$('p',dalalRegistrationCopy);if(copy)copy.textContent='Share your details to reserve a place. The organising team will contact you with the next steps; no payment is collected here.';}

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
  function syncAippmMotion(){
    const play=page.classList.contains('open')&&page.dataset.committee==='AIPPM'&&aippmInView&&!document.hidden&&!reduced();
    $$('.mu-character video',page).forEach(video=>play?video.play().catch(()=>{}):video.pause());
  }
  function $$(selector,parent=document){return [...parent.querySelectorAll(selector)];}
  document.addEventListener('visibilitychange',syncAippmMotion);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',syncAippmMotion);
  function parliament(scene){
    if (!scene || $('.mu-parliament-stage',scene))return;
    scene.insertAdjacentHTML('beforeend',`<div class="mu-parliament-stage" aria-hidden="true">
      <div class="mu-parliament-haze"></div><div class="mu-parliament-aisle"></div>
      <div class="mu-character-stage"></div>
    </div>`);
    // The kit's photos and dance frames are references, not public artwork.
    // Only cleared transparent motion loops with articulated limbs can fill these slots.
    const approved=window.MUN_APPROVED_CHARACTER_MOTION||{};
    const placements=[
      ['shah','Amit Shah',12,23,'bench'],
      ['modi','Narendra Modi',28,25,'tea'],
      ['meloni','Giorgia Meloni',37,25,'tea-tilted'],
      ['ravi','Ravi Kishan',53,27,'dance'],
      ['jaishankar','S. Jaishankar',67,25,'folder'],
      ['rahul','Rahul Gandhi',82,26,'walk'],
      ['sonia','Sonia Gandhi',91,24,'walk']
    ];
    const stage=$('.mu-character-stage',scene);
    placements.forEach(([key,name,x,height,action])=>{
      const src=approved[key];
      if(typeof src!=='string'||!/^assets\/video\/aippm-characters\/[a-z0-9_-]+\.webm$/i.test(src))return;
      const figure=document.createElement('figure');figure.className=`mu-character mu-character-${key} mu-action-${action}`;
      figure.style.setProperty('--stage-x',`${x}%`);figure.style.setProperty('--figure-height',`${height}vh`);
      const artwork=document.createElement('video');artwork.src=src;artwork.muted=true;artwork.loop=true;artwork.playsInline=true;artwork.preload='metadata';artwork.setAttribute('aria-hidden','true');
      const shadow=document.createElement('span');shadow.className='mu-character-shadow';
      const prop=document.createElement('span');prop.className='mu-character-prop';
      figure.append(shadow,artwork,prop);stage.append(figure);
      artwork.addEventListener('error',()=>figure.remove(),{once:true});
    });
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
