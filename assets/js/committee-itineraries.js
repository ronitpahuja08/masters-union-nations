/* ZERO: accessible, lightweight 3D itinerary gallery. Data is copied from Itinerary.docx.
 * This script never touches registration, award, cinematic or routing code. */
(() => {
  'use strict';
  const SHARED = document.getElementById('cpItinerary');
  const DALAL = document.getElementById('dpItinerary');
  const SHARED_PAGE = document.getElementById('committeePage');
  const DALAL_PAGE = document.getElementById('dalalCommitteePage');
  if (!SHARED || !DALAL || !SHARED_PAGE || !DALAL_PAGE) return;

  const escapeText = input => String(input ?? '').replace(/[&<>"']/g, s => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[s]);
  const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  let RECORDS = {};
  let modalState = null;
  let currentCode = '';
  const dateFor = index => index === 0 ? '28 NOVEMBER 2026' : '29 NOVEMBER 2026';
  const labelFor = index => index === 0 ? 'DAY ONE' : 'DAY TWO';

  function eventsMarkup(day) {
    if (!Array.isArray(day.events)) {
      return '<div class="mun-itinerary-unknown"><strong>Schedule to be announced</strong><p>The supplied itinerary does not specify events for this day.</p></div>';
    }
    return '<div class="mun-itinerary-timetable" role="table" aria-label="Itinerary events">'+
      '<div class="mun-itinerary-timetable-head" role="row"><span role="columnheader">TIME</span><span role="columnheader">PROGRAMME</span></div>'+
      day.events.map(([time, event]) => {
        const emphasis = /committee session|paperwork/i.test(event) ? ' is-session' :
          /masquerade|closing ceremony/i.test(event) ? ' is-special' : '';
        return '<div class="mun-itinerary-event'+emphasis+'" role="row">'+
          '<span role="cell">'+escapeText(time)+'</span>'+
          '<span role="cell">'+escapeText(event)+'</span></div>';
      }).join('')+'</div>';
  }
  function paperMarkup(code,index,expanded) {
    const record=RECORDS[code],day=record?.days?.[index];
    if (!day) return '';
    const committee=escapeText(record.name);
    return '<div class="mun-itinerary-paper'+(expanded?' is-expanded':'')+'">'+
      '<div class="mun-itinerary-paper-inner">'+
        '<div class="mun-itinerary-paper-top"><span>MASTERS’ UNION NATIONS</span><span>ZERO · MMXXVI</span></div>'+
        '<div class="mun-itinerary-paper-heading">'+
          '<span class="mun-itinerary-numeral">'+(index===0?'I':'II')+'</span>'+
          '<div><span class="mun-itinerary-super">THE OFFICIAL PROGRAMME</span><h3>'+labelFor(index)+'</h3><p>'+dateFor(index)+'</p></div>'+
          '<div class="mun-itinerary-seal" aria-hidden="true">MU</div>'+
        '</div>'+
        '<p class="mun-itinerary-committee-name">'+committee+'</p>'+
        '<p class="mun-itinerary-day-range">'+escapeText(day.range||'Schedule pending confirmation')+'</p>'+
        eventsMarkup(day)+
        '<div class="mun-itinerary-paper-foot"><span>28—29 NOV · GURUGRAM</span><span>THE WORLD RESETS</span></div>'+
      '</div></div>';
  }
  function dismiss(restoreFocus = true) {
    if (!modalState) return;
    const {overlay,button,page,keyHandler,popHandler,observer} = modalState;
    modalState=null;
    document.removeEventListener('keydown',keyHandler,true);
    window.removeEventListener('popstate',popHandler);
    observer.disconnect();
    overlay.remove();
    document.body.classList.remove('mun-itinerary-modal-open');
    if (restoreFocus && button?.isConnected && page?.classList.contains('open'))
      button.focus({preventScroll:true});
  }
  function expand(code,index,button,page) {
    if (!RECORDS[code]?.days?.[index]) return;
    dismiss(false);
    const overlay=document.createElement('div');
    overlay.className='mun-itinerary-overlay';
    overlay.innerHTML =
      '<div class="mun-itinerary-shade" aria-hidden="true"></div>'+
      '<div class="mun-itinerary-modal" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="munItineraryTitle">'+
        '<div class="mun-itinerary-modal-bar">'+
          '<div><small>THE OFFICIAL PROGRAMME</small><strong id="munItineraryTitle">'+
            escapeText(RECORDS[code].name)+' · '+labelFor(index)+'</strong></div>'+
          '<button type="button" class="mun-itinerary-close" aria-label="Close itinerary"><span aria-hidden="true">✕</span> CLOSE</button>'+
        '</div><div class="mun-itinerary-modal-scroll">'+paperMarkup(code,index,true)+'</div>'+
      '</div>';
    const modal=overlay.querySelector('.mun-itinerary-modal');
    const close=overlay.querySelector('.mun-itinerary-close');
    const keyHandler=e=>{
      if (e.key==='Escape') { e.preventDefault(); dismiss(); return; }
      if (e.key!=='Tab') return;
      // The close button is the sole interactive element inside the dialog.
      // Keep keyboard focus inside rather than returning to the background page.
      e.preventDefault();close.focus();
    };
    const popHandler=()=>dismiss(false);
    const observer=new MutationObserver(()=>{
      if (!page.classList.contains('open') ||
          (page===SHARED_PAGE && page.dataset.committee!==code)) dismiss(false);
    });
    observer.observe(page,{attributes:true,attributeFilter:['class','data-committee']});
    modalState={overlay,button,page,keyHandler,popHandler,observer};
    document.body.appendChild(overlay);
    document.body.classList.add('mun-itinerary-modal-open');
    close.addEventListener('click',()=>dismiss());
    overlay.addEventListener('click',ev=>{
      if(ev.target.classList.contains('mun-itinerary-shade')) dismiss();
    });
    document.addEventListener('keydown',keyHandler,true);
    window.addEventListener('popstate',popHandler);
    close.focus({preventScroll:true});

    if(reduce() || typeof modal.animate!=='function') return;
    const from=button.getBoundingClientRect(),to=modal.getBoundingClientRect();
    if(!from.width || !to.width) return;
    const x=from.left+from.width/2-to.left-to.width/2;
    const y=from.top+from.height/2-to.top-to.height/2;
    const s=Math.min(.62,Math.max(.16,from.width/to.width));
    // One compositor-only two-turn card orbit, then a restrained A4 pop-out.
    modal.animate([
      {opacity:.25,transform:'translate3d('+x+'px,'+y+'px,0) scale('+s+') rotateY(-540deg) rotateZ(-14deg)'},
      {opacity:.84,transform:'translate3d('+(x*.3-45)+'px,'+(y*.3-25)+'px,0) scale(.8) rotateY(-215deg) rotateZ(9deg)',offset:.61},
      {opacity:1,transform:'scale(1.04) rotateY(-12deg)',offset:.91},
      {opacity:1,transform:'scale(1) rotateY(0deg)'}
    ],{duration:780,easing:'cubic-bezier(.16,.72,.2,1)'});
  }
  function render(host,code,page) {
    const record=RECORDS[code];
    if(!record) return;
    if(modalState && modalState.page===page) dismiss(false);
    host.dataset.itineraryCode=code;
    const heading=code==='MCC'
      ? 'After dark. <em>Across two days.</em>'
      : 'The programme. <em>Two days.</em>';
    host.innerHTML='<div class="mun-itinerary-inner">'+
      '<div class="mun-itinerary-heading"><span class="mun-itinerary-kicker">THE PROGRAMME · 28—29 NOV 2026</span>'+
        '<h2>'+heading+'</h2><p>Two chapters of the conference. Select either document to reveal the full schedule.</p></div>'+
      '<div class="mun-itinerary-deck" role="group" aria-label="Day one and day two itineraries">'+
        [0,1].map(index=>
          '<button type="button" class="mun-itinerary-card" data-day="'+index+'" '+
            'aria-label="Open '+labelFor(index)+' itinerary for '+escapeText(record.name)+'">'+
             paperMarkup(code,index,false)+
             '<span class="mun-itinerary-action"><span>OPEN ITINERARY</span><span aria-hidden="true">↗</span></span>'+
          '</button>').join('')+
      '</div><p class="mun-itinerary-hint">SELECT A CARD TO REVEAL THE COMPLETE PROGRAMME <span aria-hidden="true">✦</span></p>'+
      '</div>';
    host.querySelectorAll('button[data-day]').forEach(button=>{
      button.addEventListener('click',()=>expand(code,Number(button.dataset.day),button,page));
    });
  }

  async function initialize() {
    try {
      const response=await fetch('assets/data/itineraries.json',{cache:'force-cache'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();
      RECORDS=data.committees;
      render(DALAL,'DALAL',DALAL_PAGE);
      const update=()=>{
        const code=SHARED_PAGE.dataset.committee;
        if(code && (code!==currentCode || !SHARED.children.length)){
          currentCode=code;render(SHARED,code,SHARED_PAGE);
        }
        if(!SHARED_PAGE.classList.contains('open') && modalState?.page===SHARED_PAGE)
          dismiss(false);
      };
      new MutationObserver(update).observe(SHARED_PAGE,{
        attributes:true,attributeFilter:['class','data-committee']
      });
      update();
    } catch(error) {
      console.warn('Committee itinerary could not load:',error);
      for(const host of [SHARED,DALAL]){
        host.textContent='The itinerary is temporarily unavailable.';
      }
    }
  }
  initialize();
})();