/* Masters Union Nations — Motion System v2
   Progressive enhancement only: no conference/application logic lives here. */
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
  var lobby=$('#lobby'),lobbyContent=$('.lobby-content');
  var lobbyTitle=$('.lobby-title');
  if(lobbyTitle&&!lobbyTitle.dataset.motionSplit){
    var nation=$('.grad-text',lobbyTitle);
    var first=d.createElement('span');
    first.className='motion-hero-line';
    first.textContent='Masters Union';
    if(nation){
      nation.classList.add('motion-hero-line');
      lobbyTitle.textContent='';
      lobbyTitle.appendChild(first);
      lobbyTitle.appendChild(d.createElement('br'));
      lobbyTitle.appendChild(nation);
    }
    lobbyTitle.dataset.motionSplit='1';
  }

  if(lobby){
    ['a','b','c'].forEach(function(k){
      var o=d.createElement('span');o.className='motion-orbit '+k;o.setAttribute('aria-hidden','true');lobby.appendChild(o);
    });
  }

  /* ---------- word choreography ---------- */
  function splitWords(el){
    if(!el||el.dataset.motionWords)return;
    var text=el.textContent.trim();if(!text)return;
    el.textContent='';
    text.split(/\s+/).forEach(function(word,i,arr){
      var s=d.createElement('span');s.className='motion-word';s.textContent=word;s.style.setProperty('--wd',(i*55)+'ms');el.appendChild(s);
      if(i<arr.length-1)el.appendChild(d.createTextNode(' '));
    });
    el.dataset.motionWords='1';
  }
  $$('.section-title,.sub-title').forEach(splitWords);

  /* ---------- reveal choreography ---------- */
  var revealTargets=$$('.scene-head,.app-card,.prize-total,.prize-box,.venue-card,.contact-list li,.footer-inner');
  revealTargets.forEach(function(el,i){
    el.classList.add('motion-reveal');
    el.style.setProperty('--rd',Math.min(i%4,3)*70+'ms');
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
        var title=$('.section-title,.sub-title',entry.target);
        if(title)title.classList.add('motion-title-live');
        revealIO.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    revealTargets.forEach(function(el){revealIO.observe(el);});

    var titleIO=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('motion-title-live');titleIO.unobserve(entry.target);}});
    },{threshold:.35});
    $$('.section-title,.sub-title').forEach(function(el){titleIO.observe(el);});
  }

  /* ---------- lobby only animates when Hall is not covering it ---------- */
  var hall=$('#hallview');
  function playLobby(){
    if(!lobby)return;
    lobby.classList.remove('motion-live');
    void lobby.offsetWidth;
    requestAnimationFrame(function(){lobby.classList.add('motion-live');});
  }
  if(hall){
    var hallObserver=new MutationObserver(function(){
      if(hall.classList.contains('open')){
        hall.classList.remove('motion-hall-live');
        void hall.offsetWidth;
        requestAnimationFrame(function(){hall.classList.add('motion-hall-live');});
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
  if(hall){
    var doorObserver=new MutationObserver(prepDoors);
    doorObserver.observe($('#hvDoors')||hall,{childList:true,subtree:true});
  }

  /* ---------- active navigation ---------- */
  var navMap={lobby:'#top',applications:'#applications',awards:'#awards',contact:'#contact'};
  var sectionIO=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      $$('.topnav a').forEach(function(a){a.classList.remove('motion-active');});
      var href=navMap[entry.target.id];
      if(href){var link=$('.topnav a[href="'+href+'"]');if(link)link.classList.add('motion-active');}
    });
  },{threshold:.42});
  ['#lobby','#applications','#awards','#contact'].forEach(function(sel){var el=$(sel);if(el)sectionIO.observe(el);});

  /* ---------- 3D cards ---------- */
  var depthTargets=$$('.app-card,.prize-box,.venue-card,.count-box,.prize-total');
  depthTargets.forEach(function(card){card.classList.add('motion-depth');});
  if(fine&&!reduced){
    depthTargets.forEach(function(card){
      card.addEventListener('pointermove',function(e){
        var r=card.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
        var ry=(px-.5)*10,rx=(.5-py)*8;
        card.style.setProperty('--rx',rx.toFixed(2)+'deg');
        card.style.setProperty('--ry',ry.toFixed(2)+'deg');
        card.style.setProperty('--gx',(px*100).toFixed(1)+'%');
        card.style.setProperty('--gy',(py*100).toFixed(1)+'%');
      });
      card.addEventListener('pointerleave',function(){
        card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');card.style.setProperty('--gx','50%');card.style.setProperty('--gy','50%');
      });
    });

    $$('.door').forEach(function(door){
      door.addEventListener('pointermove',function(e){
        if(door.classList.contains('opening'))return;
        var r=door.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
        door.style.setProperty('--door-ry',((px-.5)*14).toFixed(2)+'deg');
        door.style.setProperty('--door-rx',((.5-py)*10).toFixed(2)+'deg');
      });
      door.addEventListener('pointerleave',function(){door.style.setProperty('--door-rx','0deg');door.style.setProperty('--door-ry','0deg');});
    });
  }

  /* ---------- pointer physics ---------- */
  var mx=innerWidth*.5,my=innerHeight*.5,rx=mx,ry=my,dx=mx,dy=my;
  var glow=$('#cursorGlow');
  if(fine&&!reduced){
    addEventListener('pointermove',function(e){
      mx=e.clientX;my=e.clientY;dx=e.clientX;dy=e.clientY;
      root.style.setProperty('--mx',e.clientX+'px');root.style.setProperty('--my',e.clientY+'px');
    },{passive:true});
    addEventListener('pointerleave',function(){body.classList.remove('motion-pointer');});
    addEventListener('pointerenter',function(){body.classList.add('motion-pointer');});
  }

  /* gate form tilts as a whole; badge keeps its existing sway animation */
  var badgeForm=$('.badge-form'),gate=$('#gate');
  if(badgeForm&&gate&&fine&&!reduced){
    gate.addEventListener('pointermove',function(e){
      var r=gate.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      badgeForm.style.transform='rotateX('+(-y*4).toFixed(2)+'deg) rotateY('+(x*5).toFixed(2)+'deg)';
    },{passive:true});
    gate.addEventListener('pointerleave',function(){badgeForm.style.transform='';});
  }

  /* ---------- scroll velocity + parallax ---------- */
  var lastY=scrollY,lastT=performance.now(),velocity=0,smoothedV=0,scrollTick=true;
  function onScroll(){scrollTick=true;}
  addEventListener('scroll',onScroll,{passive:true});

  function motionFrame(now){
    var y=scrollY,max=Math.max(1,d.documentElement.scrollHeight-innerHeight);
    var dt=Math.max(16,now-lastT),raw=(y-lastY)/dt*16.67;
    velocity=velocity*.65+raw*.35;smoothedV+= (velocity-smoothedV)*.12;
    lastY=y;lastT=now;

    root.style.setProperty('--mfx-progress',Math.min(1,Math.max(0,y/max)).toFixed(4));
    root.style.setProperty('--mfx-speed',Math.min(1,Math.abs(smoothedV)/45).toFixed(3));
    root.style.setProperty('--mfx-skew',Math.max(-1.5,Math.min(1.5,smoothedV*.035)).toFixed(2)+'deg');

    if(!reduced){
      $$('.section').forEach(function(sec){
        var r=sec.getBoundingClientRect();var rel=(r.top+r.height*.5-innerHeight*.5)/innerHeight;
        sec.style.setProperty('--motion-section-y',(Math.max(-1.2,Math.min(1.2,rel))*42).toFixed(1)+'px');
      });
      if(lobbyContent&&!hall.classList.contains('open')){
        var py=Math.max(-1,Math.min(1,y/Math.max(1,innerHeight)));
        var px=(mx/innerWidth-.5);
        lobbyContent.style.transform='translate3d('+(px*10).toFixed(2)+'px,'+(-py*18).toFixed(2)+'px,0) rotateY('+(px*1.4).toFixed(2)+'deg)';
      }
      if(fine){
        rx+=(dx-rx)*.14;ry+=(dy-ry)*.14;
        cursorDot.style.left=dx+'px';cursorDot.style.top=dy+'px';
        cursorRing.style.left=rx+'px';cursorRing.style.top=ry+'px';
        if(glow){glow.style.left=rx+'px';glow.style.top=ry+'px';}
      }
    }
    scrollTick=false;
    requestAnimationFrame(motionFrame);
  }
  requestAnimationFrame(motionFrame);

  /* ---------- tactile button response ---------- */
  $$('.btn,.door,.menu-btn,.hv-back,.room-close').forEach(function(el){
    el.addEventListener('pointerdown',function(){el.classList.add('motion-pressed');});
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){el.addEventListener(ev,function(){el.classList.remove('motion-pressed');});});
  });

  /* ---------- keep effects correct after resize ---------- */
  var resizeTimer;
  addEventListener('resize',function(){
    clearTimeout(resizeTimer);resizeTimer=setTimeout(function(){mx=innerWidth*.5;my=innerHeight*.5;},120);
  },{passive:true});
})();
