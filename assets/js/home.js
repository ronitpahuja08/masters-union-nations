(function(){
  var $=function(s){return document.querySelector(s);};
  var home=$('#home'),hud=$('#hud'),body=document.body;

  // show the lobby banner only while the lobby is on screen; the boardroom nav takes over below it
  new IntersectionObserver(function(es){es.forEach(function(e){body.classList.toggle('on-home',e.isIntersecting);});},{threshold:.35}).observe(home);

  $('#enterBoardroom').addEventListener('click',function(){$('#boardroom').scrollIntoView({behavior:'smooth'});});

  window.addEventListener('scroll',function(){hud.classList.toggle('scrolled',scrollY>40);},{passive:true});
  $('#menuBtn').onclick=function(){hud.classList.toggle('open');};
  Array.prototype.forEach.call(document.querySelectorAll('#topnav a,.hud .brand'),function(a){a.addEventListener('click',function(){hud.classList.remove('open');});});

  var glow=$('#cursorGlow');
  window.addEventListener('mousemove',function(e){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';});
  Array.prototype.forEach.call(document.querySelectorAll('.magnetic'),function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)';});
    b.addEventListener('mouseleave',function(){b.style.transform='';});
  });

  // countdown to 28 Nov 2026
  var target=new Date('2026-11-28T08:00:00+05:30').getTime();
  function pad(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,target-Date.now());
    $('#cd-days').textContent=pad(Math.floor(d/864e5));$('#cd-hours').textContent=pad(Math.floor(d/36e5)%24);
    $('#cd-mins').textContent=pad(Math.floor(d/6e4)%60);$('#cd-secs').textContent=pad(Math.floor(d/1e3)%60);}
  if(target<Date.now())$('#countdown').style.display='none';else{tick();setInterval(tick,1000);}

  // starfield (lobby only)
  var cv=$('#stars'),ctx=cv.getContext('2d'),stars=[],W,H,mx=0,my=0,visible=true;
  function resize(){W=cv.width=home.clientWidth;H=cv.height=home.clientHeight;stars=[];var n=Math.floor(W*H/7000);for(var i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()*.9+.1,tw:Math.random()*6.28});}
  resize();addEventListener('resize',resize);
  addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5);});
  new IntersectionObserver(function(es){visible=es[0].isIntersecting;}).observe(home);
  var cols=['255,255,255','242,181,68','43,191,163','140,170,255'];
  (function draw(){
    if(visible){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<stars.length;i++){var s=stars[i];s.tw+=.02;
        var x=(s.x-mx*30*s.z+W)%W,y=((s.y-my*20*s.z)%H+H)%H,a=.3+.5*Math.abs(Math.sin(s.tw))*s.z;
        ctx.fillStyle='rgba('+cols[i%4]+','+a+')';ctx.beginPath();ctx.arc(x,y,s.z*1.4,0,6.283);ctx.fill();}
    }
    requestAnimationFrame(draw);
  })();
})();
