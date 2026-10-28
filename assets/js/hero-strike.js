(function(){
  // Gavel strike opening and departures-board details for the home hero.
  var home=document.getElementById('home');if(!home)return;
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- departures board: values roll through characters, then settle ---- */
  var GLYPHS='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function roll(el,delay){
    var finalText=el.firstChild&&el.firstChild.nodeType===3?el.firstChild.nodeValue:'';
    if(!finalText.trim())return;
    var chars=finalText.split('').map(function(c){var s=document.createElement('span');s.className='board-char';s.textContent=c;return s;});
    // One wrapper keeps the characters a single flex item inside the board cell.
    var line=document.createElement('span');line.className='board-text';line.setAttribute('aria-label',finalText.trim());
    chars.forEach(function(s){s.setAttribute('aria-hidden','true');line.appendChild(s);});
    el.replaceChild(line,el.firstChild);
    if(reduced)return;
    chars.forEach(function(s,i){
      var c=s.textContent;if(c===' ')return;
      var end=delay+180+i*28,start=performance.now();
      s.classList.add('is-rolling');
      (function tick(now){
        if(now-start<end){s.textContent=GLYPHS[(Math.random()*GLYPHS.length)|0];requestAnimationFrame(tick);}
        else{s.textContent=c;s.classList.remove('is-rolling');}
      })(start);
    });
  }

  /* ---- split-flap countdown mirrors the existing #cd-* digits ---- */
  var countdown=document.getElementById('countdown');
  function buildFlaps(){
    if(!countdown||countdown.style.display==='none')return;
    var units=[['cd-days','days'],['cd-hours','hrs'],['cd-mins','min'],['cd-secs','sec']];
    var wrap=document.createElement('div');wrap.className='flaps';wrap.setAttribute('aria-hidden','true');
    units.forEach(function(u,ui){
      var src=document.getElementById(u[0]);if(!src)return;
      if(ui)wrap.appendChild(Object.assign(document.createElement('u'),{textContent:':'}));
      var g=document.createElement('div');g.className='flap-group';
      var pair=document.createElement('div');pair.className='flap-pair';
      var flaps=src.textContent.split('').map(function(d){var f=makeFlap(d);pair.appendChild(f.el);return f;});
      g.appendChild(pair);g.appendChild(Object.assign(document.createElement('i'),{textContent:u[1]}));
      wrap.appendChild(g);
      new MutationObserver(function(){
        var v=src.textContent;
        while(flaps.length<v.length){var f=makeFlap('0');pair.insertBefore(f.el,pair.firstChild);flaps.unshift(f);}
        v.split('').forEach(function(d,i){flaps[i].set(d);});
      }).observe(src,{childList:true,characterData:true,subtree:true});
    });
    countdown.appendChild(wrap);countdown.classList.add('has-flaps');
  }
  function makeFlap(d){
    var el=document.createElement('span');el.className='flap';
    el.innerHTML='<span class="t"><em></em></span><span class="b"><em></em></span><span class="ft"><em></em></span><span class="fb"><em></em></span>';
    var t=el.children[0].firstChild,b=el.children[1].firstChild,ft=el.children[2].firstChild,fb=el.children[3].firstChild,cur=d,timer=0;
    t.textContent=b.textContent=ft.textContent=fb.textContent=d;
    return{el:el,set:function(n){
      if(n===cur)return;
      // New value sits behind; the old top half folds down and the new bottom half lands.
      t.textContent=n;fb.textContent=n;ft.textContent=cur;b.textContent=cur;cur=n;
      el.classList.remove('is-flipping');void el.offsetWidth;el.classList.add('is-flipping');
      clearTimeout(timer);timer=setTimeout(function(){b.textContent=n;ft.textContent=n;el.classList.remove('is-flipping');},320);
    }};
  }
  buildFlaps();

  /* ---- the strike ---- */
  var boardValues=Array.prototype.slice.call(home.querySelectorAll('.pass-seg:not(.pass-count) b'));
  function settleBoard(){boardValues.forEach(function(b,i){roll(b,i*90);});}
  // Only play the opening when the visitor lands at the top of the page.
  if(scrollY>40||location.hash&&location.hash!=='#home'){settleBoard();return;}

  var flash=document.createElement('div');flash.className='strike-flash';
  var wave=document.createElement('div');wave.className='strike-wave';
  home.classList.add('is-striking');
  var strikeAt=reduced?150:780;
  setTimeout(function(){
    home.classList.remove('is-striking');home.classList.add('is-struck');
    if(!reduced){
      document.body.appendChild(flash);document.body.appendChild(wave);
      flash.animate([{opacity:0},{opacity:.85,offset:.12},{opacity:0}],{duration:520,easing:'ease-out'});
      wave.animate([{opacity:.9,transform:'scale(.02)'},{opacity:0,transform:'scale(1)'}],{duration:1100,easing:'cubic-bezier(.23,1,.32,1)'}).onfinish=function(){wave.remove();flash.remove();};
    }
    setTimeout(settleBoard,420);
  },strikeAt);
})();
