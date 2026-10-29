(function(){
  var $=function(s){return document.querySelector(s);};
  var home=$('#home'),hud=$('#hud'),body=document.body,journey=$('#journey'),stick=$('#journeyStick'),main=stick.querySelector('main'),content=$('.lobby-content'),themeReveal=$('#themeReveal');

  var dusk=$('.dusk');
  var decos=Array.prototype.slice.call(document.querySelectorAll('.hero-ticker,.zero-line,.corner,.scroll-hint'));
  var clamp=function(v,a,b){return Math.min(b,Math.max(a,v));};
  var smooth=function(v,a,b){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};

  /* ---- scroll journey: home -> 3D hammer strike -> eight-committee map ---- */
  var journeyTop=journey.offsetTop,journeyRange=journey.offsetHeight-innerHeight;
  var range=function(){return journeyRange;};
  function measureJourney(){journeyTop=journey.offsetTop;journeyRange=journey.offsetHeight-innerHeight;}
  var target=0,p=0,raf=0,globeOn=!window.MUNPerformance?.lite,lastFrame=0,strikeAssetsWarmed=false,starsReady=false,globeLoading=false;
  function warmStrikeAssets(){
    if(strikeAssetsWarmed)return;
    strikeAssetsWarmed=true;
    // The WebGL scene is only needed after the visitor enters the journey.
    // The theme reveal gives the module and textures time to become ready.
    if(!globeLoading && globeOn){
      globeLoading=true;
      import('./globe-journey.js?v=film-1').catch(function(){window.dispatchEvent(new Event('globe-failed'));});
    }
    // globe-journey.js fetches and decodes its own textures off the main thread; preloading them here downloaded them twice.
    window.MUNJourneyAudio?.preload();
  }
  if(!globeOn) body.classList.add('no-globe');
  window.addEventListener('globe-failed',function(){globeOn=false;body.classList.add('no-globe');apply();});
  // Prepare the strike while the visitor reads the hero (after its opening has played),
  // so texture uploads and shader compiles never land on their first scroll.
  if(!/^\/(?:unhrc|mcc|ccep|ipl|aippm|dalal-street|startup-boardroom|international-press)\/?$/i.test(location.pathname)){
    setTimeout(function(){(window.requestIdleCallback||function(f){return setTimeout(f,1);})(warmStrikeAssets,{timeout:3000});},2200);
  }

  var LAND=.985,landed=false,struck=false,blackoutEntered=false,lastDispatched=-1;
  var lastContent=-1,lastDeco=-1,lastDusk=-1,lastFlash=-1,lastVeil=-1,lastGlobe=-1,lastMap=-1;
  var impactFlash=$('#impactFlash'),impactVeil=$('#impactVeil'),globeCanvas=$('#globeCanvas');
  var phase='browsing',voiceHold=0,handoffStart=0,handoffFrom=0,holdScrollY=0,mapScrollDone=false;
  var reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches||!!window.MUNPerformance?.lite;
  var revealComplete=false,revealTimer=0,revealCleanupTimer=0,revealAnchor=.19;
  var lastUserScroll=-1e5,MAX_SPEED=.34;
  var AUTO_MS=reducedMotion?400:2800,autoStart=0,autoFrom=0;
  ['wheel','touchstart','pointerdown','keydown'].forEach(function(type){window.addEventListener(type,function(){lastUserScroll=performance.now();},{passive:true});});
  function beginThemeReveal(){
    warmStrikeAssets();
    phase='theme';target=p=revealAnchor;
    cancelAnimationFrame(raf);raf=0;
    $('#timeSeconds').textContent='00';
    home.classList.add('time-stopped');
    themeReveal.classList.remove('is-exiting');
    themeReveal.classList.add('is-playing');
    themeReveal.setAttribute('aria-hidden','false');
    window.scrollTo({top:journeyTop+range()*revealAnchor,behavior:'instant'});
    apply();
    clearTimeout(revealTimer);
    clearTimeout(revealCleanupTimer);
    revealTimer=setTimeout(function(){
      phase='browsing';revealComplete=true;
      target=p=.38;
      window.scrollTo({top:journeyTop+range()*p,behavior:'instant'});
      apply();
      themeReveal.classList.add('is-exiting');
      revealCleanupTimer=setTimeout(function(){themeReveal.classList.remove('is-playing','is-exiting');themeReveal.setAttribute('aria-hidden','true');},650);
      onScroll();
    },reducedMotion?650:3300);
  }
  function thud(){
    if(!reducedMotion)$('.thud-ring').animate(
      [{opacity:.65,transform:'scale(.25)'},{opacity:0,transform:'scale(4.2)'}],
      {duration:780,easing:'cubic-bezier(.2,.6,.3,1)'}
    );
    window.MUNJourneyAudio?.blast();
  }
  function apply(){
    // Progress is read by the scene scripts; it is not a CSS input. Writing it
    // on the root element invalidated styles across the entire map each frame.
    window.MUNJourneyProgress=p;
    var c=1-smooth(p,0,.17);
    if(Math.abs(c-lastContent)>.001){
      content.style.opacity=c;
      content.style.transform='scale('+(1+.08*(1-c))+')';
      content.style.visibility=c<=0.01?'hidden':'visible';
      lastContent=c;
    }
    var gb=smooth(p,.46,.52)*(1-smooth(p,.73,.81));
    body.classList.toggle('gb-on',gb>.04);
    body.classList.toggle('gb-strike',p>.32);
    body.classList.toggle('gb-shatter',p>=.64&&p<.92);
    var flash=smooth(p,.622,.64)*(1-smooth(p,.66,.70));
    // Let the debris fill the viewport first, then pull the red scene down to black.
    var blackout=smooth(p,.78,.92)*(1-smooth(p,.985,1));
    if(Math.abs(flash-lastFlash)>.001){impactFlash.style.opacity=(flash*.5).toFixed(3);lastFlash=flash;}
    if(Math.abs(blackout-lastVeil)>.001){impactVeil.style.opacity=blackout.toFixed(3);lastVeil=blackout;}
    var inBlackout=p>=.92&&p<.99;
    if(inBlackout!==blackoutEntered){
      blackoutEntered=inBlackout;
      body.classList.toggle('in-blackout',inBlackout);
      impactVeil.setAttribute('aria-hidden',String(!inBlackout));
      if(inBlackout)window.MUNJourneyAudio?.resetVoice();
    }
    var duskOpacity=smooth(p,.14,.78);
    if(Math.abs(duskOpacity-lastDusk)>.001){dusk.style.opacity=duskOpacity.toFixed(3);lastDusk=duskOpacity;}
    var dk=1-smooth(p,0,.09);   // bottom ticker, line, corners and scroll marker leave before the words arrive
    if(Math.abs(dk-lastDeco)>.001){decos.forEach(function(e){e.style.opacity=dk;e.style.visibility=dk<=.01?'hidden':'visible';});lastDeco=dk;}
    if(!landed&&p>=LAND)landed=true;
    else if(landed&&p<.93)landed=false;
    if(globeOn){
      var globeOpacity=smooth(p,.27,.34)*(1-smooth(p,.82,.93));
      if(Math.abs(globeOpacity-lastGlobe)>.001){globeCanvas.style.opacity=String(globeOpacity);lastGlobe=globeOpacity;}
    }else{
      if(lastGlobe!==0){globeCanvas.style.opacity=0;lastGlobe=0;}
    }
    var mapOpacity=smooth(p,.90,.985);
    if(Math.abs(mapOpacity-lastMap)>.001){main.style.opacity=mapOpacity;lastMap=mapOpacity;}
    // Start the audio on the contact pose and first shock glow, before the
    // globe's fragment animation reaches its full extent.
    var hit=p>=.622;
    if(hit&&!struck)thud();
    struck=hit;
    body.classList.toggle('on-home',p<.25);
    body.classList.toggle('at-map',landed);
    if(Math.abs(p-lastDispatched)>.001){lastDispatched=p;window.dispatchEvent(new CustomEvent('journey',{detail:p}));}
  }
  function step(now){
    raf=0;
    if(phase==='theme')return;
    if(phase==='auto'){
      // The landing film hands over here: wind-up and strike on a fixed curve, no scroll involved.
      var a=Math.min(1,(now-autoStart)/AUTO_MS);
      p=autoFrom+(.61-autoFrom)*(a<.5?2*a*a:1-Math.pow(-2*a+2,2)/2);target=p;apply();
      if(a<1){raf=requestAnimationFrame(step);return;}
      phase='handoff';handoffStart=performance.now();voiceHold=0;handoffFrom=p;holdScrollY=scrollY;mapScrollDone=false;
      raf=requestAnimationFrame(step);return;
    }
    if(phase==='handoff'){
      var elapsed=now-handoffStart-voiceHold;
      // the black 'The World Resets' screen stays until the spoken line has finished
      var voiceGate=reducedMotion?700:3300;
      if(elapsed>=voiceGate&&now-handoffStart<12000&&window.MUNJourneyAudio&&window.MUNJourneyAudio.voicePlaying()){voiceHold=now-handoffStart-voiceGate;elapsed=voiceGate;}
      if(reducedMotion){p=elapsed<1150?.925:1;}
      else if(elapsed<260)p=handoffFrom+(.645-handoffFrom)*smooth(elapsed,0,260);
      // Give the globe debris nearly three seconds to surge toward and across the screen.
      else if(elapsed<2850)p=.645+(.91-.645)*smooth(elapsed,260,2850);
      else if(elapsed<3100)p=.91+(.925-.91)*smooth(elapsed,2850,3100);
      // Hold the reset title for the voice line; a media failure never traps the visitor.
      else if(elapsed<3950)p=.925;
      else p=.925+.075*smooth(elapsed,3950,4800);
      target=p;
      apply();
      if(!mapScrollDone&&elapsed>=(reducedMotion?0:3950)){
        mapScrollDone=true;
        holdScrollY=journeyTop+range();
        // Move the document once while the reset card fully covers the stage.
        window.scrollTo({top:holdScrollY,behavior:'instant'});
      }
      if(elapsed<(reducedMotion?1150:4800)){raf=requestAnimationFrame(step);return;}
      phase='map';p=target=1;apply();return;
    }
    var d=target-p;
    if(Math.abs(d)<.0004){p=target;apply();return;}
    // Time-based damping follows a wheel gesture in about 150 ms, independent of refresh rate.
    var dt=lastFrame?Math.min(50,now-lastFrame):16;lastFrame=now;
    // The journey has a top speed: however fast the wheel or trackpad flings, progress travels at a steady, smooth pace.
    var move=d*(1-Math.exp(-dt/48)),cap=MAX_SPEED*dt/1000;
    p+=Math.max(-cap,Math.min(cap,move));apply();
    if(!revealComplete&&phase==='browsing'&&p>=.16&&target>p+.003&&performance.now()-lastUserScroll<2500){beginThemeReveal();return;}
    if(p>=.60&&target>=.61){
      phase='handoff';handoffStart=performance.now();voiceHold=0;handoffFrom=p;holdScrollY=scrollY;mapScrollDone=false;
    }
    raf=requestAnimationFrame(step);
  }
  function onScroll(){
    if(phase==='auto')return;
    if(phase==='handoff'||phase==='theme'){
      var anchor=phase==='handoff'?holdScrollY:journeyTop+range()*revealAnchor;
      if(Math.abs(scrollY-anchor)>2)window.scrollTo({top:anchor,behavior:'instant'});
      return;
    }
    var r=range(),next=r>0?clamp((scrollY-journeyTop)/r,0,1):0;
    if(phase==='map'&&next<.93)phase='browsing';
    if(next<.04){if(revealComplete)window.MUNJourneyAudio?.resetCycle();revealComplete=false;home.classList.remove('time-stopped');$('#timeSeconds').textContent='59';}
    target=next;
    if(next>.055)warmStrikeAssets();
    if(starsReady)syncStars();
    hud.classList.toggle('scrolled',scrollY>40);
    if(!raf){lastFrame=0;raf=requestAnimationFrame(step);}
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){measureJourney();onScroll();});
  onScroll();apply();

  function goto(where){
    clearTimeout(revealTimer);clearTimeout(revealCleanupTimer);cancelAnimationFrame(raf);raf=0;
    themeReveal.classList.remove('is-playing','is-exiting');themeReveal.setAttribute('aria-hidden','true');
    if(where==='map'){
      revealComplete=true;phase='map';p=target=1;
      window.scrollTo({top:journeyTop+range(),behavior:'instant'});
    }else{
      revealComplete=false;phase='browsing';p=target=0;struck=false;
      window.MUNJourneyAudio?.resetCycle();
      window.scrollTo({top:0,behavior:'instant'});
    }
    apply();
  }
  window.MUNHomeNavigation={goto:goto};
  window.MUNJourney={
    // Start where the globe is already rising (the film covers the jump), skipping the theme card.
    play:function(){
      warmStrikeAssets();
      clearTimeout(revealTimer);clearTimeout(revealCleanupTimer);cancelAnimationFrame(raf);raf=0;
      themeReveal.classList.remove('is-playing','is-exiting');themeReveal.setAttribute('aria-hidden','true');
      revealComplete=true;struck=false;autoFrom=p=target=.29;apply();
      phase='auto';autoStart=performance.now();raf=requestAnimationFrame(step);
    },
    warm:warmStrikeAssets,
    globeReady:function(){return !globeOn||!!window.MUNGlobeReady;},
    phase:function(){return phase;}
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'),function(el){
    el.addEventListener('click',function(e){e.preventDefault();hud.classList.remove('open');if(window.MUNRouter?.navigateSection)window.MUNRouter.navigateSection(el.dataset.goto);else goto(el.dataset.goto);});
  });

  $('#menuBtn').onclick=function(){hud.classList.toggle('open');};

  /* ---- lobby details (unchanged) ---- */
  var glow=$('#cursorGlow');
  /* pointer glow disabled for stability */
  /* magnetic cursor movement disabled */

  var targetDate=new Date('2026-11-28T08:00:00+05:30').getTime();
  function pad(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,targetDate-Date.now());
    $('#cd-days').textContent=pad(Math.floor(d/864e5));$('#cd-hours').textContent=pad(Math.floor(d/36e5)%24);
    $('#cd-mins').textContent=pad(Math.floor(d/6e4)%60);$('#cd-secs').textContent=pad(Math.floor(d/1e3)%60);}
  if(targetDate<Date.now())$('#countdown').style.display='none';else{tick();setInterval(tick,1000);}


  /* ---- endless ticker: always enough copies to overfill the screen, shifted by exactly one set ---- */
  (function(){
    var track=$('#tickerTrack');if(!track)return;
    var items=['ZERO','THE WORLD RESET','DIPLOMACY','DEBATE','08 COMMITTEES','THE FUTURE BEGINS'];
    function set(){var d=document.createElement('div');d.className='set';items.forEach(function(t){var a=document.createElement('span');a.textContent=t;var b=document.createElement('span');b.textContent='\u2726';d.appendChild(a);d.appendChild(b);});return d;}
    function build(){
      track.innerHTML='';var first=set();track.appendChild(first);
      var w=first.getBoundingClientRect().width;if(!w)return;
      var n=Math.max(2,Math.ceil((innerWidth+w)/w)+1);
      for(var i=1;i<n;i++)track.appendChild(set());
      track.style.setProperty('--shift',(-w)+'px');
      track.style.setProperty('--dur',(w/55).toFixed(1)+'s');
    }
    build();
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(build);
    var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(build,150);});
  })();

  var cv=$('#stars'),ctx=cv.getContext('2d'),stars=[],W,H,mx=0,my=0;
  function resize(){if(window.MUNPerformance?.lite){W=cv.width=1;H=cv.height=1;stars=[];return;}W=cv.width=home.clientWidth;H=cv.height=home.clientHeight;stars=[];var n=Math.floor(W*H/12000);for(var i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()*.9+.1,tw:Math.random()*6.28,d:Math.random()<.5?'0':'1'});}
  resize();addEventListener('resize',resize);
  /* star field no longer tracks cursor */
  var visibleHome=true,starTimer=0,starRaf=0,starsCleared=false;
  function draw(){
    if(visibleHome&&p<.25&&!document.hidden){
      ctx.clearRect(0,0,W,H);
      starsCleared=false;
      ctx.font='13px "DM Mono",ui-monospace,monospace';
      for(var i=0;i<stars.length;i++){var s=stars[i];s.tw+=.015;
        var x=(s.x-mx*24*s.z+W)%W,y=((s.y-my*16*s.z)%H+H)%H,a=(.06+.34*Math.abs(Math.sin(s.tw)))*s.z;
        ctx.fillStyle='rgba(255,'+(i%3?140:200)+','+(i%3?125:190)+','+a+')';ctx.fillText(s.d,x,y);}
      starTimer=setTimeout(function(){starTimer=0;starRaf=requestAnimationFrame(draw);},65);
    }else if(!starsCleared){ctx.clearRect(0,0,W,H);starsCleared=true;}
    starRaf=0;
  }
  function syncStars(){
    if(window.MUNPerformance?.lite)return;
    if(!visibleHome||p>=.25||document.hidden){clearTimeout(starTimer);cancelAnimationFrame(starRaf);starTimer=starRaf=0;draw();}
    else if(!starTimer&&!starRaf){starRaf=requestAnimationFrame(draw);}
  }
  new IntersectionObserver(function(entries){visibleHome=entries[0].isIntersecting;syncStars();},{threshold:0}).observe(home);
  document.addEventListener('visibilitychange',syncStars);
  window.addEventListener('journey',syncStars);
  starsReady=true;
  syncStars();
})();
