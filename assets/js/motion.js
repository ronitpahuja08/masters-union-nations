/* Masters Union Nations — Motion System v3
   Performance-first progressive enhancement. */
(function(){
  'use strict';

  var d=document,root=d.documentElement,body=d.body;
  var $=function(s,c){return (c||d).querySelector(s);};
  var $$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s));};
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  body.classList.add('motion-ready');

  /* ---------- persistent chrome ---------- */
  var progress=d.createElement('div');
  progress.className='motion-progress';
  progress.setAttribute('aria-hidden','true');
  body.appendChild(progress);

  var cursorDot=d.createElement('div'),cursorRing=d.createElement('div');
  cursorDot.className='motion-cursor-dot';cursorRing.className='motion-cursor-ring';
  cursorDot.setAttribute('aria-hidden','true');cursorRing.setAttribute('aria-hidden','true');
  body.appendChild(cursorDot);body.appendChild(cursorRing);
  if(fine&&!reduced)body.classList.add('motion-pointer');

  /* ---------- hero structure ---------- */
  var lobby=$('#lobby'),lobbyContent=$('.lobby-content'),lobbyTitle=$('.lobby-title');
  if(lobbyTitle&&!lobbyTitle.dataset.motionSplit){
    var nation=$('.grad-text',lobbyTitle);
    if(nation){
      var first=d.createElement('span');
      first.className='motion-hero-line';
      first.textContent='Masters Union';
      nation.classList.add('motion-hero-line');
      lobbyTitle.textContent='';
      lobbyTitle.appendChild(first);
      lobbyTitle.appendChild(d.createElement('br'));
      lobbyTitle.appendChild(nation);
      lobbyTitle.dataset.motionSplit='1';
    }
  }

  if(lobby&&!$('.motion-orbit',lobby)){
    ['a','b','c'].forEach(function(k){
      var o=d.createElement('span');
      o.className='motion-orbit '+k;
      o.setAttribute('aria-hidden','true');
      lobby.appendChild(o);
    });
  }

  /* ---------- word choreography ---------- */
  function splitWords(el){
    if(!el||el.dataset.motionWords)return;
    var text=el.textContent.trim();if(!text)return;
    el.textContent='';
    text.split(/\s+/).forEach(function(word,i,arr){
      var s=d.createElement('span');
      s.className='motion-word';
      s.textContent=word;
      s.style.setProperty('--wd',(i*50)+'ms');
      el.appendChild(s);
      if(i<arr.length-1)el.appendChild(d.createTextNode(' '));
    });
    el.dataset.motionWords='1';
  }
  $$('.section-title,.sub-title').forEach(splitWords);

  /* ---------- reveal choreography ---------- */
  var revealTargets=$$('.scene-head,.app-card,.prize-total,.prize-box,.venue-card,.contact-list li,.footer-inner');
  revealTargets.forEach(function(el,i){
    el.classList.add('motion-reveal');
    el.style.setProperty('--rd',Math.min(i%4,3)*65+'ms');
    el.addEventListener('animationend',function handler(e){
      if(e.animationName!=='motionReveal')return;
      el.classList.remove('motion-reveal','motion-visible');
      el.style.removeProperty('--rd');
      el.removeEventListener('animationend',handler);
    });
  });

  if(reduced){
    revealTargets.forEach(function(el){el.classList.add('motion-visible');});
    $$('.section-title,.sub-title').forEach(function(el){el.classList.add('motion-title-live');});
    if(lobby)lobby.classList.add('motion-live');
  }else{
    var revealIO=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting)return;
        entry.target.classList.add('motion-visible');
        revealIO.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    revealTargets.forEach(function(el){revealIO.observe(el);});

    var titleIO=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting)return;
        entry.target.classList.add('motion-title-live');
        titleIO.unobserve(entry.target);
      });
    },{threshold:.3});
    $$('.section-title,.sub-title').forEach(function(el){titleIO.observe(el);});
  }

  /* ---------- lobby / hall state ---------- */
  var hall=$('#hallview');
  function playLobby(){
    if(!lobby)return;
    lobby.classList.remove('motion-live');
    requestAnimationFrame(function(){lobby.classList.add('motion-live');});
  }

  if(hall){
    var hallWasOpen=hall.classList.contains('open');
    var hallTimer=0;
    var hallObserver=new MutationObserver(function(){
      var nowOpen=hall.classList.contains('open');
      if(nowOpen===hallWasOpen)return;
      hallWasOpen=nowOpen;

      if(nowOpen){
        clearTimeout(hallTimer);
        hall.classList.remove('motion-hall-live');
        requestAnimationFrame(function(){
          hall.classList.add('motion-hall-live');
          hallTimer=setTimeout(function(){
            hall.classList.remove('motion-hall-live');
          },1450);
        });
      }else if(!body.classList.contains('locked')){
        playLobby();
      }
    });
    hallObserver.observe(hall,{attributes:true,attributeFilter:['class']});
  }

  if(!body.classList.contains('locked')&&(!hall||!hall.classList.contains('open')))playLobby();

  /* ---------- hall door staging ---------- */
  function prepDoors(){
    $$('.door').forEach(function(door,i){door.style.setProperty('--door-i',i);});
  }
  prepDoors();
  var doorsHost=$('#hvDoors');
  if(doorsHost){
    new MutationObserver(prepDoors).observe(doorsHost,{childList:true});
  }

  /* ---------- active navigation ---------- */
  var navMap={lobby:'#top',applications:'#applications',awards:'#awards',contact:'#contact'};
  var sectionIO=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      $$('.topnav a').forEach(function(a){a.classList.remove('motion-active');});
      var href=navMap[entry.target.id];
      var link=href?$('.topnav a[href="'+href+'"]'):null;
      if(link)link.classList.add('motion-active');
    });
  },{threshold:.42});
  ['#lobby','#applications','#awards','#contact'].forEach(function(sel){var el=$(sel);if(el)sectionIO.observe(el);});

  /* ---------- 3D cards ---------- */
  var depthTargets=$$('.app-card,.prize-box,.venue-card,.prize-total');
  depthTargets.forEach(function(card){card.classList.add('motion-depth');});

  if(fine&&!reduced){
    depthTargets.forEach(function(card){
      var queued=false,lastEvent=null;
      card.addEventListener('pointermove',function(e){
        lastEvent=e;
        if(queued)return;
        queued=true;
        requestAnimationFrame(function(){
          queued=false;
          if(!lastEvent)return;
          var r=card.getBoundingClientRect();
          var px=(lastEvent.clientX-r.left)/r.width,py=(lastEvent.clientY-r.top)/r.height;
          card.style.setProperty('--rx',((.5-py)*7).toFixed(2)+'deg');
          card.style.setProperty('--ry',((px-.5)*9).toFixed(2)+'deg');
          card.style.setProperty('--gx',(px*100).toFixed(1)+'%');
          card.style.setProperty('--gy',(py*100).toFixed(1)+'%');
        });
      },{passive:true});
      card.addEventListener('pointerleave',function(){
        lastEvent=null;
        card.style.setProperty('--rx','0deg');
        card.style.setProperty('--ry','0deg');
        card.style.setProperty('--gx','50%');
        card.style.setProperty('--gy','50%');
      });
    });

    $$('.door').forEach(function(door){
      var queued=false,lastEvent=null;
      door.addEventListener('pointermove',function(e){
        if(door.classList.contains('opening'))return;
        lastEvent=e;
        if(queued)return;
        queued=true;
        requestAnimationFrame(function(){
          queued=false;
          if(!lastEvent)return;
          var r=door.getBoundingClientRect();
          var px=(lastEvent.clientX-r.left)/r.width,py=(lastEvent.clientY-r.top)/r.height;
          door.style.setProperty('--door-ry',((px-.5)*12).toFixed(2)+'deg');
          door.style.setProperty('--door-rx',((.5-py)*8).toFixed(2)+'deg');
        });
      },{passive:true});
      door.addEventListener('pointerleave',function(){
        lastEvent=null;
        door.style.setProperty('--door-rx','0deg');
        door.style.setProperty('--door-ry','0deg');
      });
    });
  }

  /* ---------- pointer physics, event-driven ---------- */
  var mx=innerWidth*.5,my=innerHeight*.5,ringX=mx,ringY=my,pointerRAF=0;
  function paintPointer(){
    pointerRAF=0;
    ringX+=(mx-ringX)*.28;
    ringY+=(my-ringY)*.28;
    cursorDot.style.left=mx+'px';cursorDot.style.top=my+'px';
    cursorRing.style.left=ringX+'px';cursorRing.style.top=ringY+'px';
    root.style.setProperty('--mx',mx+'px');root.style.setProperty('--my',my+'px');
    if(Math.abs(mx-ringX)>0.35||Math.abs(my-ringY)>0.35)pointerRAF=requestAnimationFrame(paintPointer);
  }
  if(fine&&!reduced){
    addEventListener('pointermove',function(e){
      mx=e.clientX;my=e.clientY;
      if(!pointerRAF)pointerRAF=requestAnimationFrame(paintPointer);
    },{passive:true});
    addEventListener('pointerleave',function(){body.classList.remove('motion-pointer');});
    addEventListener('pointerenter',function(){body.classList.add('motion-pointer');});
  }

  /* ---------- gate tilt ---------- */
  var badgeForm=$('.badge-form'),gate=$('#gate');
  if(badgeForm&&gate&&fine&&!reduced){
    var gateRAF=0,gateEvent=null;
    gate.addEventListener('pointermove',function(e){
      gateEvent=e;
      if(gateRAF)return;
      gateRAF=requestAnimationFrame(function(){
        gateRAF=0;
        if(!gateEvent)return;
        var r=gate.getBoundingClientRect();
        var x=(gateEvent.clientX-r.left)/r.width-.5,y=(gateEvent.clientY-r.top)/r.height-.5;
        badgeForm.style.transform='rotateX('+(-y*3.2).toFixed(2)+'deg) rotateY('+(x*4.2).toFixed(2)+'deg)';
      });
    },{passive:true});
    gate.addEventListener('pointerleave',function(){gateEvent=null;badgeForm.style.transform='';});
  }

  /* ---------- scroll effects, only when scroll changes ---------- */
  var sections=$$('.section'),scrollRAF=0,lastY=scrollY,lastT=performance.now(),velocity=0;
  function paintScroll(now){
    scrollRAF=0;
    var y=scrollY,max=Math.max(1,d.documentElement.scrollHeight-innerHeight);
    var dt=Math.max(16,now-lastT),raw=(y-lastY)/dt*16.67;
    velocity=velocity*.72+raw*.28;
    lastY=y;lastT=now;

    root.style.setProperty('--mfx-progress',Math.min(1,Math.max(0,y/max)).toFixed(4));
    root.style.setProperty('--mfx-speed',Math.min(1,Math.abs(velocity)/45).toFixed(3));
    root.style.setProperty('--mfx-skew',Math.max(-1.25,Math.min(1.25,velocity*.03)).toFixed(2)+'deg');

    if(!reduced){
      sections.forEach(function(sec){
        var r=sec.getBoundingClientRect();
        var rel=(r.top+r.height*.5-innerHeight*.5)/innerHeight;
        sec.style.setProperty('--motion-section-y',(Math.max(-1.2,Math.min(1.2,rel))*34).toFixed(1)+'px');
      });
      if(lobbyContent&&(!hall||!hall.classList.contains('open'))){
        var py=Math.max(-1,Math.min(1,y/Math.max(1,innerHeight)));
        var px=(mx/innerWidth-.5);
        lobbyContent.style.transform='translate3d('+(px*8).toFixed(2)+'px,'+(-py*14).toFixed(2)+'px,0) rotateY('+(px*1.1).toFixed(2)+'deg)';
      }
    }
  }
  function scheduleScroll(){if(!scrollRAF)scrollRAF=requestAnimationFrame(paintScroll);}
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',scheduleScroll,{passive:true});
  scheduleScroll();

  /* ---------- tactile button response ---------- */
  $$('.btn,.door,.menu-btn,.hv-back,.room-close').forEach(function(el){
    el.addEventListener('pointerdown',function(){el.classList.add('motion-pressed');});
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
      el.addEventListener(ev,function(){el.classList.remove('motion-pressed');});
    });
  });
})();
