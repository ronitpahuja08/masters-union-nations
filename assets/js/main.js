(function(){
  var $=function(s,c){return (c||document).querySelector(s);};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
  var wait=function(ms){return new Promise(function(r){setTimeout(r,ms);});};

  var STD=['Best Delegate ₹15k','High Commendation ₹10k','High Commendation (School) ₹5k'];
  // matrix: paste each committee's Matrix link here
  var COMMITTEES=[
    {code:'UNHRC',full:'United Nations Human Rights Council',agenda:'Addressing Human Trafficking in Asia & Africa',matrix:'',prize:STD,color:'#4a7bff'},
    {code:'MCC',full:'Midnight Crisis Committee',agenda:'Debate over night',matrix:'',prize:STD,color:'#7a5cff'},
    {code:'CCEP',full:'CCEP',agenda:'To be announced',matrix:'',prize:STD,color:'#2bbfa3'},
    {code:'IPL',full:'Indian Premier League',agenda:'To be announced',matrix:'',prize:STD,color:'#f2b544'},
    {code:'AIPPM',full:'All India Political Parties Meet',agenda:'One Nation, One Election / Secularism',matrix:'',prize:STD,color:'#e8832d'},
    {code:'DALAL STREET',full:'Dalal Street',agenda:'IPO',matrix:'',prize:STD,color:'#35c47c'},
    {code:'CCC',full:'Classified Crisis Committee',agenda:'Mahabharat',matrix:'',prize:STD,color:'#d4476b'},
    {code:'IP',full:'International Press',agenda:'International Press Coverage',matrix:'',prize:['Best Photographer, Journalist & Caricaturist ₹10k','High Commendation in all three ₹5k'],color:'#9aa4b5'}
  ];
  var body=document.body;
  var state={name:''};
  function save(){try{localStorage.setItem('mun26',JSON.stringify(state));}catch(e){}}
  function load(){try{var s=JSON.parse(localStorage.getItem('mun26'));if(s&&s.name){state=s;return true;}}catch(e){}return false;}

  function renderHud(){
    $('#hudName').textContent=state.name||'Delegate';
    $('#dgName').textContent=state.name||'Delegate';
    $('#welcomeName').textContent=(state.name||'DELEGATE').toUpperCase();
    $('#hvSub').textContent='Choose a committee, '+(state.name||'Delegate')+'.';
  }

  /* ---------- Gate ---------- */
  function openGate(){
    body.classList.remove('locked');renderHud();
    openHall();
    $('#gate').classList.add('open');
    setTimeout(function(){$('#gate').style.display='none';},1100);
  }
  var scanning=false;
  $('#badgeForm').addEventListener('submit',async function(e){
    e.preventDefault();
    if(scanning)return;scanning=true;
    state.name=$('#delegateName').value.trim()||'Delegate';save();
    var st=$('#scanStatus'),badge=$('#badge'),gate=$('#gate');
    $('#swipeBtn').disabled=true;$('#gateHint').style.display='none';
    badge.classList.add('scanning');gate.classList.add('scanning');
    st.className='scan-status pixel show';st.textContent='SCANNING BARCODE...';
    await wait(2300);
    badge.classList.remove('scanning');badge.classList.add('granted');gate.classList.add('granted');
    st.className='scan-status pixel show ok';st.textContent='ACCESS GRANTED';
    await wait(1100);
    openGate();
  });
  if(load()){$('#delegateName').value=state.name;}

  /* ---------- Hall of Doors (separate page) ---------- */
  var hall=$('#hallview'),doorsEl=$('#hvDoors'),dg=$('#delegate'),busy=false,current=null;
  COMMITTEES.forEach(function(c,i){
    var d=document.createElement('button');
    d.className='door';d.dataset.code=c.code;d.style.setProperty('--dc',c.color);
    d.innerHTML='<span class="door-plate"><strong>'+c.code+'</strong></span>'+
      '<span class="door-frame"><span class="door-leaf"><span class="door-window"></span><span class="door-knob"></span></span><span class="door-light"></span></span>'+
      '<span class="door-num pixel">ROOM '+String(i+1).padStart(2,'0')+'</span>';
    d.addEventListener('click',function(){walkIn(d,c,i);});
    doorsEl.appendChild(d);
  });

  function setDg(x,y,s,o){dg.style.setProperty('--x',x+'px');dg.style.setProperty('--y',y+'px');dg.style.setProperty('--s',s);dg.style.opacity=o;}
  function resetHall(){
    dg.classList.remove('walking','entering');setDg(0,0,1,1);
    $$('.door').forEach(function(d){d.classList.remove('opening','leaving');});
    $('#hvBubble').classList.remove('hide');busy=false;
  }
  function openHall(){
    resetHall();hall.classList.add('open');hall.setAttribute('aria-hidden','false');body.classList.add('modal');
    $('#hvBubble').classList.remove('hide');
  }
  function closeHall(){hall.classList.remove('open');hall.setAttribute('aria-hidden','true');body.classList.remove('modal');closeRoom(true);}
  $('#enterHall').onclick=openHall;
  $('#navHall').addEventListener('click',function(e){e.preventDefault();hud.classList.remove('open');openHall();});
  $('#hvBack').onclick=closeHall;

  async function walkIn(d,c,i){
    if(busy)return;busy=true;current={d:d,c:c,i:i};
    $('#hvBubble').classList.add('hide');
    d.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});
    await wait(450);
    var fr=$('.door-frame',d).getBoundingClientRect(),me=dg.getBoundingClientRect();
    var dx=(fr.left+fr.width/2)-(me.left+me.width/2);
    dg.classList.add('walking');setDg(dx,0,1,1);               // walk to the door
    await wait(1100);
    dg.classList.remove('walking');d.classList.add('opening'); // door swings open
    await wait(850);
    var me2=dg.getBoundingClientRect();
    var dy=(fr.top+fr.height*.62)-(me2.top+me2.height*.55);
    dg.classList.add('entering');setDg(dx,dy,.28,0);            // step inside
    await wait(1150);
    // light floods through the door, door drifts toward us, card emerges from the light
    var po=$('#portal'),cx=fr.left+fr.width/2,cy=fr.top+fr.height*.55;
    po.style.setProperty('--px',cx+'px');po.style.setProperty('--py',cy+'px');po.style.setProperty('--pc',c.color);
    $('.room-panel',room).style.transformOrigin='50% 50%';
    d.classList.add('leaving');po.classList.add('go');          // colour floods the screen...
    showRoom(c,i);                                              // ...while the card grows with it
    await wait(1050);
    po.classList.remove('go');
  }

  /* ---------- Room card ---------- */
  var room=$('#room');
  function showRoom(c,i){
    $('#roomGlyph').textContent=c.code.replace(' ','\n');
    $('#roomGlyph').style.setProperty('--dc',c.color);
    $('#roomNum').textContent='ROOM '+String(i+1).padStart(2,'0');
    $('#roomTitle').textContent=c.code;
    $('#roomFull').textContent=c.full;
    $('#roomAgenda').textContent=c.agenda;
    $('#roomMatrix').innerHTML=c.matrix?'<a class="matrix-link" target="_blank" rel="noopener" href="'+c.matrix+'">Open Matrix &rarr;</a>':'<span class="muted">Matrix link will be shared soon.</span>';
    $('#roomPrize').innerHTML=c.prize.map(function(p){return '<span class="prize-line">'+p+'</span>';}).join('');
    room.classList.add('open');room.setAttribute('aria-hidden','false');
  }
  function closeRoom(silent){
    if(!room.classList.contains('open')&&!silent)return;
    room.classList.remove('open');room.setAttribute('aria-hidden','true');
    if(!silent&&hall.classList.contains('open'))resetHall();
  }
  $('#roomClose').onclick=function(){closeRoom();};
  $('#roomBack').onclick=function(){closeRoom();};
  $('#roomBackdrop').onclick=function(){closeRoom();};
  $('#roomCta').addEventListener('click',function(){
    var code=current&&current.c.code;
    closeHall();
    openForm(code);
  });

  /* ---------- Application form ---------- */
  var APPLY_ENDPOINT=''; // set to your backend URL; the form POSTs JSON here
  var ROLES=COMMITTEES.map(function(c){return c.code;}).concat(['Chairperson','Secretariat','Campus Ambassador']);
  var formModal=$('#formModal');
  $('#fRole').innerHTML=ROLES.map(function(r){return '<option>'+r+'</option>';}).join('');
  function openForm(role){
    $('#fName').value=state.name||'';
    $('#fRole').value=role;
    $('#formTitle').textContent=COMMITTEES.some(function(c){return c.code===role;})?'Delegate application':'Application — '+role;
    $('#formNote').textContent='';$('#formSubmit').disabled=false;
    formModal.classList.add('open');formModal.setAttribute('aria-hidden','false');body.classList.add('modal');
  }
  function closeForm(){formModal.classList.remove('open');formModal.setAttribute('aria-hidden','true');if(!hall.classList.contains('open'))body.classList.remove('modal');}
  $('#formClose').onclick=closeForm;$('#formBackdrop').onclick=closeForm;
  $('#applyForm').addEventListener('submit',async function(e){
    e.preventDefault();
    var data={};new FormData(e.target).forEach(function(v,k){data[k]=v;});
    data.submittedAt=new Date().toISOString();
    var note=$('#formNote'),btn=$('#formSubmit');btn.disabled=true;note.textContent='';
    if(APPLY_ENDPOINT){
      try{
        var r=await fetch(APPLY_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        if(!r.ok)throw new Error(r.status);
      }catch(err){note.textContent='Could not submit. Please try again.';btn.disabled=false;return;}
    }
    closeForm();
    showCard(data.name,data.applyingFor);
  });

  /* ---------- Access card (shareable PNG) ---------- */
  var cardModal=$('#cardModal'),cardCv=$('#cardCanvas');
  function openCardModal(){cardModal.classList.add('open');cardModal.setAttribute('aria-hidden','false');body.classList.add('modal');}
  function closeCardModal(){cardModal.classList.remove('open');cardModal.setAttribute('aria-hidden','true');if(!hall.classList.contains('open'))body.classList.remove('modal');}
  $('#cardClose').onclick=closeCardModal;$('#cardBackdrop').onclick=closeCardModal;
  function hash(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function rng(seed){return function(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  async function showCard(name,role){
    var com=COMMITTEES.filter(function(c){return c.code===role;})[0];
    var tag=com?com.code:role;
    var key=(name+'|'+role).toUpperCase();
    var pass='MUN26-'+tag.replace(/[^A-Z]/gi,'').toUpperCase().slice(0,4)+'-'+hash(key).toString(36).toUpperCase().padStart(4,'0').slice(0,4);
    try{await Promise.all([document.fonts.load('700 80px "Space Grotesk"'),document.fonts.load('20px "Press Start 2P"'),document.fonts.load('400 30px "Inter"')]);}catch(e){}
    drawCard(name,com,role,pass);
    openCardModal();
  }
  function drawCard(name,com,role,pass){
    var W=1080,H=1920,x=cardCv.getContext('2d'),col=com?com.color:'#f2b544';
    var D='"Space Grotesk",sans-serif',P='"Press Start 2P",monospace',B='Inter,sans-serif';
    x.clearRect(0,0,W,H);
    x.fillStyle='#07070a';x.fillRect(0,0,W,H);
    var g=x.createRadialGradient(150,200,0,150,200,900);g.addColorStop(0,'rgba(74,123,255,.35)');g.addColorStop(1,'rgba(74,123,255,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    g=x.createRadialGradient(950,1700,0,950,1700,1000);g.addColorStop(0,'rgba(232,131,45,.38)');g.addColorStop(1,'rgba(232,131,45,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    g=x.createRadialGradient(540,860,0,540,860,520);g.addColorStop(0,col+'55');g.addColorStop(1,col+'00');x.fillStyle=g;x.fillRect(0,0,W,H);
    var r=rng(hash(pass));for(var i=0;i<140;i++){x.fillStyle='rgba(255,255,255,'+(0.15+r()*.5)+')';x.beginPath();x.arc(r()*W,r()*H,r()*2.2+.4,0,6.283);x.fill();}
    // card frame
    function rr(px,py,w,h,rad){x.beginPath();x.moveTo(px+rad,py);x.arcTo(px+w,py,px+w,py+h,rad);x.arcTo(px+w,py+h,px,py+h,rad);x.arcTo(px,py+h,px,py,rad);x.arcTo(px,py,px+w,py,rad);x.closePath();}
    rr(90,110,900,1700,56);x.fillStyle='rgba(255,255,255,.04)';x.fill();x.lineWidth=2;x.strokeStyle='rgba(242,181,68,.45)';x.stroke();
    rr(450,150,180,30,15);x.fillStyle='#050507';x.fill();x.strokeStyle='rgba(255,255,255,.15)';x.stroke();
    x.textAlign='center';x.fillStyle='#f4f1ea';x.font='700 66px '+D;x.fillText('Masters Union',540,290);
    var tg=x.createLinearGradient(380,0,700,0);tg.addColorStop(0,'#4a7bff');tg.addColorStop(.4,'#2bbfa3');tg.addColorStop(.75,'#f2b544');tg.addColorStop(1,'#e8832d');
    x.fillStyle=tg;x.font='700 96px '+D;x.fillText('Nations',540,385);
    x.fillStyle='#9a968c';x.font='22px '+P;x.fillText('ACCESS CARD',540,470);
    // avatar with initials
    var cy=700;x.lineWidth=8;var ag=x.createLinearGradient(400,cy-140,680,cy+140);ag.addColorStop(0,'#4a7bff');ag.addColorStop(.5,'#2bbfa3');ag.addColorStop(1,'#f2b544');
    x.strokeStyle=ag;x.beginPath();x.arc(540,cy,140,0,6.283);x.stroke();
    x.fillStyle='rgba(255,255,255,.06)';x.beginPath();x.arc(540,cy,132,0,6.283);x.fill();
    var ini=name.trim().split(/\s+/).slice(0,2).map(function(w){return w[0];}).join('').toUpperCase()||'D';
    x.fillStyle='#f4f1ea';x.font='700 110px '+D;x.fillText(ini,540,cy+38);
    // name (auto-fit, wrap to 2 lines if needed)
    var size=112;x.font='700 '+size+'px '+D;
    while(x.measureText(name).width>820&&size>64){size-=4;x.font='700 '+size+'px '+D;}
    var lines=[name];
    if(x.measureText(name).width>820){var parts=name.split(' '),half=Math.ceil(parts.length/2);lines=[parts.slice(0,half).join(' '),parts.slice(half).join(' ')];size=64;x.font='700 '+size+'px '+D;}
    x.fillStyle='#f4f1ea';var ny=980;
    lines.forEach(function(l,k){x.fillText(l,540,ny+k*(size+8));});
    ny+=(lines.length-1)*(size+8);
    // committee pill
    var label=com?com.code:role.toUpperCase();
    x.font='700 56px '+D;var pw=Math.max(300,x.measureText(label).width+110);
    rr(540-pw/2,ny+50,pw,100,50);x.fillStyle=col+'22';x.fill();x.lineWidth=3;x.strokeStyle=col;x.stroke();
    x.fillStyle='#fff';x.fillText(label,540,ny+120);
    x.fillStyle='#bdb9ad';x.font='30px '+B;x.fillText(com?com.full:'Organising team',540,ny+205);
    x.fillStyle=col;x.font='20px '+P;x.fillText(com?'DELEGATE':'APPLICANT',540,ny+265);
    // divider
    x.strokeStyle='rgba(255,255,255,.14)';x.setLineDash([10,10]);x.lineWidth=2;x.beginPath();x.moveTo(150,1380);x.lineTo(930,1380);x.stroke();x.setLineDash([]);
    // event info
    x.fillStyle='#f2b544';x.font='20px '+P;x.fillText('28 & 29 NOVEMBER 2026',540,1450);
    x.fillStyle='#d8d4c9';x.font='34px '+B;x.fillText("Masters' Union School of Business",540,1510);
    x.fillStyle='#9a968c';x.font='28px '+B;x.fillText('Gurugram, Haryana',540,1556);
    // barcode
    var br=rng(hash(pass+'bar')),bx=240;x.fillStyle='rgba(244,241,234,.85)';
    while(bx<840){var w=2+Math.floor(br()*6);if(br()>.35)x.fillRect(bx,1610,w,110);bx+=w+3+Math.floor(br()*4);}
    x.fillStyle='#9a968c';x.font='20px '+P;x.fillText(pass,540,1772);
    // brand strip
    var sg=x.createLinearGradient(90,0,990,0);sg.addColorStop(0,'#4a7bff');sg.addColorStop(.35,'#2bbfa3');sg.addColorStop(.7,'#f2b544');sg.addColorStop(1,'#e8832d');
    x.save();rr(90,110,900,1700,56);x.clip();x.fillStyle=sg;x.fillRect(90,1796,900,14);x.restore();
    cardCv.dataset.file='MUN-access-card-'+name.trim().replace(/\s+/g,'-')+'.png';
  }
  function cardBlob(){return new Promise(function(res){cardCv.toBlob(res,'image/png');});}
  $('#cardDownload').onclick=async function(){
    var b=await cardBlob(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=cardCv.dataset.file;a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},2000);
  };
  $('#cardShare').onclick=async function(){
    var b=await cardBlob(),f=new File([b],cardCv.dataset.file,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:'Masters Union Nations',text:'I am in! See you at Masters Union Nations, 28 & 29 Nov 2026.'});return;}catch(e){if(e.name==='AbortError')return;}}
    $('#cardDownload').click();
  };
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-apply]');if(b)openForm(b.dataset.apply);
  });
  window.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(cardModal.classList.contains('open'))closeCardModal();
    else if(formModal.classList.contains('open'))closeForm();
    else if(room.classList.contains('open'))closeRoom();else if(hall.classList.contains('open'))closeHall();
  });

  /* ---------- Reveal + scene XP ---------- */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
  $$('[data-reveal],.scene-head,.sub-title').forEach(function(el){el.classList.add('rv');io.observe(el);});
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target,end=+el.dataset.count,t0=performance.now();(function f(t){var p=Math.min(1,(t-t0)/1600);el.textContent=Math.round(end*(1-Math.pow(1-p,3))).toLocaleString('en-IN');if(p<1)requestAnimationFrame(f);})(t0);cio.unobserve(el);}});},{threshold:.5});
  $$('[data-count]').forEach(function(el){cio.observe(el);});

  /* ---------- Nav ---------- */
  var hud=$('#hud');
  $('#menuBtn').onclick=function(){hud.classList.toggle('open');};
  $$('#topnav a.nav-link,.brand.nav-link').forEach(function(a){a.addEventListener('click',function(){hud.classList.remove('open');if(hall.classList.contains('open'))closeHall();});});
  window.addEventListener('scroll',function(){hud.classList.toggle('scrolled',scrollY>40);},{passive:true});

  /* ---------- Cursor glow, magnetic ---------- */
  var glow=$('#cursorGlow');
  window.addEventListener('mousemove',function(e){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';});
  $$('.magnetic').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)';});
    b.addEventListener('mouseleave',function(){b.style.transform='';});
  });

  /* ---------- Countdown to 28 Nov 2026 ---------- */
  var target=new Date('2026-11-28T08:00:00+05:30').getTime();
  function pad(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,target-Date.now());
    $('#cd-days').textContent=pad(Math.floor(d/864e5));$('#cd-hours').textContent=pad(Math.floor(d/36e5)%24);
    $('#cd-mins').textContent=pad(Math.floor(d/6e4)%60);$('#cd-secs').textContent=pad(Math.floor(d/1e3)%60);}
  if(target<Date.now())$('#countdown').style.display='none';else{tick();setInterval(tick,1000);}

  /* ---------- Starfield ---------- */
  var cv=$('#stars'),ctx=cv.getContext('2d'),stars=[],W,H,mx=0,my=0;
  function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;stars=[];var n=Math.floor(W*H/7000);for(var i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()*.9+.1,tw:Math.random()*6.28});}
  resize();addEventListener('resize',resize);
  addEventListener('mousemove',function(e){mx=(e.clientX/W-.5);my=(e.clientY/H-.5);});
  var cols=['255,255,255','242,181,68','43,191,163','140,170,255'];
  (function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<stars.length;i++){var s=stars[i];s.tw+=.02;
      var x=(s.x-mx*30*s.z+W)%W,y=((s.y-scrollY*.15*s.z-my*20*s.z)%H+H)%H,a=.3+.5*Math.abs(Math.sin(s.tw))*s.z;
      ctx.fillStyle='rgba('+cols[i%4]+','+a+')';ctx.beginPath();ctx.arc(x,y,s.z*1.4,0,6.283);ctx.fill();}
    requestAnimationFrame(draw);
  })();

  renderHud();
})();
