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
    const label={MCC:'Midnight Crisis Committee',IP:'International Press',AIPPM:'All India Political Parties Meet'}[code]||code;
    return `<form class="mu-inline-form" data-committee="${code}" novalidate>
      <h3>Reserve your place.</h3><p>Registration request for <strong>${label}</strong>. Payment will be arranged separately by the organising team.</p>
      <div class="mu-fields">
        <label>Full name <input name="name" required minlength="2" maxlength="100" autocomplete="name" placeholder="Your full name"></label>
        <label>Email address <input name="email" type="email" required maxlength="180" autocomplete="email" placeholder="you@example.com"></label>
        <label>School / university <input name="institution" required maxlength="180" autocomplete="organization" placeholder="Your institution"></label>
        <label>Delegate category <select name="category" required><option value="">Select category</option><option value="school">School</option><option value="college">College</option></select></label>
        <label>Phone (optional) <input name="phone" type="tel" inputmode="tel" maxlength="20" autocomplete="tel" placeholder="Contact number"></label>
        <label>Why this committee? (optional) <textarea name="motivation" maxlength="750" rows="3" placeholder="A sentence about your interest"></textarea></label>
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

  function gotoRegister() {
    const scroller=$('#committeePageScroll'),target=$('#cpRegister');
    if (!scroller || !target) return;
    const offset=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop;
    scroller.scrollTo({top:Math.max(0,offset-20),behavior:reduced()?'instant':'smooth'});
    setTimeout(()=>$('.mu-inline-form input[name="name"]',target)?.focus({preventScroll:true}),reduced()?0:450);
  }
  let jump = $('.mu-start-registration',hero);
  if (!jump) {
    jump=document.createElement('button');jump.type='button';jump.className='mu-start-registration';
    jump.textContent='Start registration ↓';jump.addEventListener('click',gotoRegister);
    $('.cp-hero-copy',hero)?.append(jump);
  }
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
      if(!response.ok)throw new Error(response.status===503?'Registration submissions are not open yet. Please check back after the team configures the database.':result.error||'Submission failed. Please retry.');
      form.classList.add('mu-submitted');
      if(status)status.textContent='Your registration request was received. The team will contact you with the next steps. No payment has been collected.';
      button.textContent='Request received ✓';
    }catch(e){if(status)status.textContent=e.name==='AbortError'?'The connection timed out. Please retry; do not assume your request was saved.':e.message;button.disabled=false;}
    finally{clearTimeout(timeout);}
  }
  actions.addEventListener('submit',e=>{if (!e.target.matches('.mu-inline-form'))return;e.preventDefault();postRegistration(e.target,e.target.dataset.committee);});

  // This is intentionally a capture handler to override the legacy Dalal
  // submit which currently opens a payment studio without a persisted record.
  const dalalForm=$('#dalalInlineForm');
  if (dalalForm) {
    dalalForm.addEventListener('submit',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      const consent=$('[name="consent"]',dalalForm);
      if (!consent?.checked) { $('#dalalFormNote').textContent='Please agree to the registration contact notice.';consent?.focus();return; }
      postRegistration(dalalForm,'DALAL');
    },true);
    if (!$('[name="consent"]',dalalForm)) {
      const control=document.createElement('label');control.className='mu-consent';control.innerHTML='<input type="checkbox" name="consent" required> I agree that the Masters\' Union Nations team may contact me about this registration.';
      const note=$('#dalalFormNote');note.before(control);
      const old=dalalForm.querySelector('small:last-child');if(old)old.textContent='No payment is collected. The team will share payment instructions later.';
      const copy=$('.dp-register-copy>p');if(copy)copy.textContent='Send your registration request here. Payment instructions will be shared once the organising team finalises them.';
    }
  }

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

  function parliament(scene){
    if (!scene || $('.mu-parliament-stage',scene))return;
    scene.insertAdjacentHTML('beforeend',`<div class="mu-parliament-stage" aria-hidden="true">
      <div class="mu-parliament-haze"></div><div class="mu-parliament-aisle"></div>
      <div class="mu-podium mu-podium-left"><span>PARLIAMENTARY DEBATE</span></div>
      <div class="mu-podium mu-podium-right"><span>NEW DELHI</span></div>
      <div class="mu-leader-collage" data-label="Illustrative political montage, not real meeting footage"></div>
      <div class="mu-illustration-label">ILLUSTRATIVE MONTAGE · NOT ACTUAL MEETING FOOTAGE</div>
    </div>`);
    // Leave empty until organisers source LICENSED pictures. No missing-file 404s.
    const licensed=window.MUN_APPROVED_LEADER_PHOTOS||{};
    const portraits=[['modi','NARENDRA MODI'],['rahul','RAHUL GANDHI'],['shah','AMIT SHAH']];
    const gallery=$('.mu-leader-collage',scene);
    portraits.forEach(([key,name])=>{
      const src=licensed[key];
      if(typeof src!=='string'||!/^\/?assets\/images\/[a-z0-9_\/-]+\.webp$/i.test(src))return;
      const fig=document.createElement('figure');fig.className='mu-leader mu-leader-'+key;
      const img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';
      const cap=document.createElement('figcaption');cap.textContent=name;
      fig.append(img,cap);gallery.appendChild(fig);
      img.addEventListener('error',()=>fig.remove(),{once:true});
    });
    if(!gallery.children.length){gallery.hidden=true;$('.mu-illustration-label',scene).hidden=true;}

  }

  const symbols=[['MUN INDEX',18642.45],['ATLAS TECH',1745.85],['NATIONS CAP',263.70],['CYBER VENTURES',3912.10],['UNION ENERGY',812.35]];
  let marketData=symbols.map(([symbol,price],i)=>({symbol,price,trend:i%3===1?-1:1}));
  function board(){
    const scene=$('.dp-scene');if(!scene||$('.mu-market-board',scene))return;
    scene.insertAdjacentHTML('beforeend',`<div class="mu-market-board" aria-label="Fictional simulated market display">
      <div class="mu-market-top"><b>MU EXCHANGE</b><span>SIMULATED MARKET / NOT LIVE PRICES</span><time>SESSION 2026</time></div>
      <div class="mu-market-head"><span>SYMBOL</span><span>LAST PRICE</span><span>CHANGE</span><span>STATUS</span></div>
      <div class="mu-market-rows"></div>
      <div class="mu-market-bottom"><span>IPO DESK · GLOBAL BOARDROOM</span><span>THIS IS A FICTIONAL MARKET SIMULATION</span></div>
    </div>`);
    const container=$('.mu-market-rows',scene);
    marketData.forEach(({symbol,price,trend},i)=>{
      const r=document.createElement('div');r.className='mu-market-row';r.dataset.row=i;
      r.innerHTML=`<span>${symbol}</span><strong data-price>${price.toFixed(2)}</strong><span data-change class="${trend<0?'down':'up'}">${trend<0?'▼':'▲'} ${Math.abs(i*.13+.24).toFixed(2)}%</span><span data-status>${trend<0?'WATCH':'ACTIVE'}</span>`;
      container.appendChild(r);
    });
    const target=$('.mu-market-board',scene);
    const observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)stopMarket();else startMarket();}},{threshold:.08});observer.observe(target);
  }
  function updateMarket(){
    if (document.hidden||!dalal.classList.contains('open')){stopMarket();return;}
    marketData=marketData.map((r,i)=>({...r,price:Math.max(1,r.price*(1+(Math.sin(Date.now()/2400+i*1.7)*.0013))),trend:Math.sin(Date.now()/4000+i)>=0?1:-1}));
    for (let i=0;i<marketData.length;i++){
      const row=dalal.querySelector(`.mu-market-row[data-row="${i}"]`);if(!row)continue;
      const d=marketData[i];$('[data-price]',row).textContent=d.price.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
      const change=$('[data-change]',row);change.textContent=(d.trend>0?'▲ ':'▼ ')+Math.abs(.12+Math.sin(Date.now()/5000+i)*.82).toFixed(2)+'%';change.className=d.trend>0?'up':'down';
      $('[data-status]',row).textContent=d.trend>0?'ACTIVE':'WATCH';
    }
  }
  function startMarket(){if (marketTimer||reduced()||document.hidden||!dalal.classList.contains('open'))return;marketTimer=setInterval(updateMarket,2000);}
  function stopMarket(){if (marketTimer){clearInterval(marketTimer);marketTimer=null;}}
  document.addEventListener('visibilitychange',()=>document.hidden?stopMarket():startMarket());
  new MutationObserver(()=>dalal.classList.contains('open')?startMarket():stopMarket()).observe(dalal,{attributes:true,attributeFilter:['class']});

  function refresh(){
    if(!page.classList.contains('open'))return;
    const code=page.dataset.committee||'';
    makeForm(code);
    jump.hidden=code!=='MCC';
    // committee-cinematics.js reconstructs scene innerHTML whenever a page opens.
    const scene=$('.cinema-hero-scene',hero);
    if(code==='IP')newsroom(scene);
    if(code==='AIPPM')parliament(scene);
  }
  addIPNewspapers();board();
  const observer=new MutationObserver(refresh);observer.observe(page,{attributes:true,attributeFilter:['class','data-committee']});
  refresh();
})();
