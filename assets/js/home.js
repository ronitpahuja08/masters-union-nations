(function(){
  var $=function(s){return document.querySelector(s);};
  var home=$('#home'),hud=$('#hud'),body=document.body,journey=$('#journey'),stick=$('#journeyStick'),main=stick.querySelector('main'),content=$('.lobby-content');

  var clamp=function(v,a,b){return Math.min(b,Math.max(a,v));};
  var smooth=function(v,a,b){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};

  /* ---- scroll journey: home -> Earth rotating in -> world map ---- */
  var range=function(){return journey.offsetHeight-innerHeight;};
  var target=0,p=0,raf=0,globeOn=true;
  window.addEventListener('globe-failed',function(){globeOn=false;body.classList.add('no-globe');apply();});

  var LAND=.92,landed=false;   // at LAND the unrolled globe is pixel-identical to the page's map: swap and thud
  function thud(){
    stick.classList.remove('thud');void stick.offsetWidth;stick.classList.add('thud');
  }
  function apply(){
    stick.style.setProperty('--p',p.toFixed(4));
    var c=1-smooth(p,0,.17);
    content.style.opacity=c;
    content.style.transform='scale('+(1+.08*(1-c))+')';
    content.style.filter=c<1?'blur('+((1-c)*6).toFixed(1)+'px)':'';
    content.style.visibility=c<=0.01?'hidden':'visible';
    var cv=$('#globeCanvas');
    var now=globeOn?p>=LAND:p>=.9;
    if(globeOn){
      cv.style.opacity=now?0:smooth(p,0,.2);
      main.style.opacity=now?1:0;
    }else{
      main.style.opacity=smooth(p,.3,.88);
      cv.style.opacity=0;
    }
    if(now!==landed){landed=now;if(landed&&globeOn)thud();}
    body.classList.toggle('on-home',p<.25);
    body.classList.toggle('at-map',landed);
    window.dispatchEvent(new CustomEvent('journey',{detail:p}));
  }
  function step(){
    var d=target-p;
    if(Math.abs(d)<.0004){p=target;apply();raf=0;return;}
    p+=d*.07;apply();raf=requestAnimationFrame(step);
  }
  function onScroll(){
    var r=range();target=r>0?clamp((scrollY-journey.offsetTop)/r,0,1):0;
    hud.classList.toggle('scrolled',scrollY>40);
    if(!raf)raf=requestAnimationFrame(step);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  onScroll();apply();

  function goto(where){
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
    if(visibleHome&&p<LAND){
      ctx.clearRect(0,0,W,H);
      ctx.font='13px "DM Mono",ui-monospace,monospace';
      for(var i=0;i<stars.length;i++){var s=stars[i];s.tw+=.015;
        var x=(s.x-mx*24*s.z+W)%W,y=((s.y-my*16*s.z)%H+H)%H,a=(.06+.34*Math.abs(Math.sin(s.tw)))*s.z;
        ctx.fillStyle='rgba(255,'+(i%3?140:200)+','+(i%3?125:190)+','+a+')';ctx.fillText(s.d,x,y);}
    }
    requestAnimationFrame(draw);
  })();
})();
