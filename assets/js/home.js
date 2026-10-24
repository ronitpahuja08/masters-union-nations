(function(){
  var $=function(s){return document.querySelector(s);};
  var home=$('#home'),hud=$('#hud'),body=document.body,journey=$('#journey'),stick=$('#journeyStick'),main=stick.querySelector('main'),content=$('.lobby-content'),themeReveal=$('#themeReveal');

  var dusk=$('.dusk');
  var decos=Array.prototype.slice.call(document.querySelectorAll('.hero-ticker,.zero-line,.corner,.scroll-hint'));
  var clamp=function(v,a,b){return Math.min(b,Math.max(a,v));};
  var smooth=function(v,a,b){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};

  /* ---- scroll journey: home -> 3D hammer strike -> eight-committee map ---- */
  var range=function(){return journey.offsetHeight-innerHeight;};
  var target=0,p=0,raf=0,globeOn=true;
  window.addEventListener('globe-failed',function(){globeOn=false;body.classList.add('no-globe');apply();});

  var LAND=.975,landed=false,struck=false;
  var autoPlayed=false,autoActive=false,autoStart=0,autoFrom=0;
  var reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealActive=false,revealComplete=false,revealTimer=0,revealAnchor=.19;
  var lastUserScroll=-1e5;
  ['wheel','touchstart','pointerdown','keydown'].forEach(function(type){window.addEventListener(type,function(){lastUserScroll=performance.now();},{passive:true});});
  function beginThemeReveal(){
    revealActive=true;target=p=revealAnchor;
    themeReveal.classList.remove('is-exiting');
    themeReveal.classList.add('is-playing');
    themeReveal.setAttribute('aria-hidden','false');
    window.scrollTo(0,journey.offsetTop+range()*revealAnchor);
    apply();
    window.MUNJourneyAudio?.reveal();
    clearTimeout(revealTimer);
    revealTimer=setTimeout(function(){
      revealActive=false;revealComplete=true;
      // The reveal is the title beat; hand off beneath its fade to the
      // already established globe scene instead of showing the old title beat.
      target=p=.38;
      window.scrollTo(0,journey.offsetTop+range()*p);
      apply();
      themeReveal.classList.add('is-exiting');
      setTimeout(function(){themeReveal.classList.remove('is-playing','is-exiting');themeReveal.setAttribute('aria-hidden','true');},650);
      onScroll();
    },reducedMotion?750:4200);
  }
  function thud(){
    stick.classList.remove('thud');void stick.offsetWidth;stick.classList.add('thud');
    window.MUNJourneyAudio?.blast();
  }
  function apply(){
    stick.style.setProperty('--p',p.toFixed(4));
    var c=1-smooth(p,0,.17);
    content.style.opacity=c;
    content.style.transform='scale('+(1+.08*(1-c))+')';
    content.style.filter=c<1?'blur('+((1-c)*6).toFixed(1)+'px)':'';
    content.style.visibility=c<=0.01?'hidden':'visible';
    var gb=smooth(p,.48,.53)*(1-smooth(p,.76,.83));
    stick.style.setProperty('--gb',gb.toFixed(3));   // GLOBAL / BOARDROOM words
    body.classList.toggle('gb-on',gb>.04);
    body.classList.toggle('gb-strike',p>.32);
    var flash=smooth(p,.632,.648)*(1-smooth(p,.666,.706));
    var blackout=smooth(p,.81,.85)*(1-smooth(p,.89,.935));
    $('#impactFlash').style.opacity=(flash*.82).toFixed(3);
    $('#impactVeil').style.opacity=blackout.toFixed(3);
    body.classList.toggle('in-blackout',p>.835&&p<.93);
    dusk.style.opacity=smooth(p,.14,.78).toFixed(3);   // wine backdrop turns to navy before the map lands
    var dk=1-smooth(p,0,.09);   // bottom ticker, line, corners and scroll marker leave before the words arrive
    decos.forEach(function(e){e.style.opacity=dk;e.style.visibility=dk<=.01?'hidden':'visible';});
    var cv=$('#globeCanvas');
    var now=p>=LAND;
    if(globeOn){
      cv.style.opacity=String(smooth(p,.27,.34)*(1-smooth(p,.87,.96)));
      main.style.opacity=smooth(p,.89,.965);
    }else{
      main.style.opacity=smooth(p,.89,.965);
      cv.style.opacity=0;
    }
    // Start the audio on the contact pose and first shock glow, before the
    // globe's fragment animation reaches its full extent.
    var hit=p>=.62;
    if(hit&&!struck)thud();
    struck=hit;
    if(now!==landed){landed=now;}
    body.classList.toggle('on-home',p<.25);
    body.classList.toggle('at-map',landed);
    window.dispatchEvent(new CustomEvent('journey',{detail:p}));
  }
  function step(){
    if(revealActive){raf=0;return;}
    if(autoActive){
      var elapsed=Math.min(1,(performance.now()-autoStart)/2750);
      p=autoFrom+(1-autoFrom)*elapsed;
      target=p;
      window.scrollTo(0,journey.offsetTop+range()*p);
      apply();
      if(elapsed<1){raf=requestAnimationFrame(step);return;}
      autoActive=false;target=p=1;raf=0;return;
    }
    var d=target-p;
    if(Math.abs(d)<.0004){p=target;apply();raf=0;return;}
    p+=d*.07;apply();raf=requestAnimationFrame(step);
    if(!autoPlayed&&p>=.60&&target>=.61){
      autoPlayed=true;
      if(reducedMotion){autoActive=false;target=p=1;window.scrollTo(0,journey.offsetTop+range());apply();}
      else{autoActive=true;autoStart=performance.now();autoFrom=p;}
    }
  }
  function onScroll(){
    var r=range(),next=r>0?clamp((scrollY-journey.offsetTop)/r,0,1):0;
    if(revealActive){if(Math.abs(next-revealAnchor)>.005)window.scrollTo(0,journey.offsetTop+r*revealAnchor);return;}
    if(next<.04)revealComplete=false;
    if(!revealComplete&&next>=.16&&next<.96&&next>p+.003&&performance.now()-lastUserScroll<2000){beginThemeReveal();return;}
    if(autoActive)return;
    target=next;
    if(target<.2)autoPlayed=false;
    hud.classList.toggle('scrolled',scrollY>40);
    if(!raf)raf=requestAnimationFrame(step);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  onScroll();apply();

  function goto(where){
    if(where==='map'){
      clearTimeout(revealTimer);revealActive=false;revealComplete=true;
      themeReveal.classList.remove('is-playing','is-exiting');themeReveal.setAttribute('aria-hidden','true');
    }
    var top=where==='map'?journey.offsetTop+range():0;
    window.scrollTo({top:top,behavior:'smooth'});
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'),function(el){
    el.addEventListener('click',function(e){e.preventDefault();hud.classList.remove('open');goto(el.dataset.goto);});
  });

  $('#menuBtn').onclick=function(){hud.classList.toggle('open');};

  /* ---- lobby details (unchanged) ---- */
  var glow=$('#cursorGlow');
  window.addEventListener('mousemove',function(e){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';});
  Array.prototype.forEach.call(document.querySelectorAll('.magnetic'),function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)';});
    b.addEventListener('mouseleave',function(){b.style.transform='';});
  });

  var targetDate=new Date('2026-11-28T08:00:00+05:30').getTime();
  function pad(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,targetDate-Date.now());
    $('#cd-days').textContent=pad(Math.floor(d/864e5));$('#cd-hours').textContent=pad(Math.floor(d/36e5)%24);
    $('#cd-mins').textContent=pad(Math.floor(d/6e4)%60);$('#cd-secs').textContent=pad(Math.floor(d/1e3)%60);}
  if(targetDate<Date.now())$('#countdown').style.display='none';else{tick();setInterval(tick,1000);}


  /* ---- endless ticker: always enough copies to overfill the screen, shifted by exactly one set ---- */
  (function(){
    var track=$('#tickerTrack');if(!track)return;
    var items=['DIPLOMACY','DEBATE','DECISIONS','08 COMMITTEES','02 DAYS','ONE BOARDROOM'];
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
  function resize(){W=cv.width=home.clientWidth;H=cv.height=home.clientHeight;stars=[];var n=Math.floor(W*H/5200);for(var i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()*.9+.1,tw:Math.random()*6.28,d:Math.random()<.5?'0':'1'});}
  resize();addEventListener('resize',resize);
  addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5);});
  var visibleHome=true;
  (function draw(){
    if(visibleHome&&p<.25){
      ctx.clearRect(0,0,W,H);
      ctx.font='13px "DM Mono",ui-monospace,monospace';
      for(var i=0;i<stars.length;i++){var s=stars[i];s.tw+=.015;
        var x=(s.x-mx*24*s.z+W)%W,y=((s.y-my*16*s.z)%H+H)%H,a=(.06+.34*Math.abs(Math.sin(s.tw)))*s.z;
        ctx.fillStyle='rgba(255,'+(i%3?140:200)+','+(i%3?125:190)+','+a+')';ctx.fillText(s.d,x,y);}
    }else{ctx.clearRect(0,0,W,H);}
    requestAnimationFrame(draw);
  })();
})();
