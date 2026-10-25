(function(){
'use strict';
var ctx=null,master=null,enabled=false,themeTimers=[];
function init(){if(ctx)return;var A=window.AudioContext||window.webkitAudioContext;if(!A)return;ctx=new A();master=ctx.createGain();master.gain.value=.17;master.connect(ctx.destination);}
function wake(){init();if(ctx&&ctx.state==='suspended')ctx.resume();}
function tone(freq,dur,type,vol,delay,detune){if(!enabled)return;wake();if(!ctx)return;var o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+(delay||0);o.type=type||'sine';o.frequency.setValueAtTime(freq,t);if(detune)o.detune.setValueAtTime(detune,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol||.035),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);}
function noise(dur,vol,delay,cutoff){if(!enabled)return;wake();if(!ctx)return;var len=Math.max(1,Math.floor(ctx.sampleRate*dur)),buf=ctx.createBuffer(1,len,ctx.sampleRate),ch=buf.getChannelData(0);for(var i=0;i<len;i++)ch[i]=(Math.random()*2-1)*(1-i/len);var src=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter(),t=ctx.currentTime+(delay||0);src.buffer=buf;f.type='lowpass';f.frequency.value=cutoff||1200;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol||.015,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(g);g.connect(master);src.start(t);src.stop(t+dur+.03);}
function kick(delay,vol){if(!enabled)return;tone(86,.16,'sine',vol||.05,delay);tone(48,.22,'sine',(vol||.05)*.6,(delay||0)+.02);}
function click(delay,vol){noise(.055,vol||.015,delay,4200);}
function clearTheme(){themeTimers.forEach(function(t){clearTimeout(t);});themeTimers=[];}
function cue(name){if(name==='hover'){tone(540,.07,'sine',.02);}else if(name==='select'){tone(285,.12,'triangle',.035);tone(640,.18,'sine',.032,.035);}else if(name==='scan'){noise(.12,.02,0,5000);tone(165,.1,'square',.018);tone(335,.12,'square',.02,.11);tone(760,.22,'sine',.035,.24);}else if(name==='travel'){kick(0,.045);tone(118,.35,'sawtooth',.018);tone(470,.4,'sine',.028,.16);noise(.26,.016,.12,2400);}else if(name==='success'){tone(392,.16,'sine',.035);tone(523,.2,'sine',.038,.11);tone(659,.28,'sine',.042,.21);}else tone(420,.08,'sine',.02);}
function committee(slug){if(!enabled)return;clearTheme();wake();var s=slug||'unhrc';
  if(s==='aippm'){
    // Neutral parliamentary energy: desk taps + crowd-like filtered noise, no partisan chant.
    kick(0,.055);click(.03,.024);click(.13,.018);noise(.48,.022,.08,1500);tone(220,.14,'square',.018,.03);tone(330,.16,'triangle',.02,.20);tone(440,.22,'sine',.026,.36);
  }else if(s==='ipl'){
    // Original stadium/cricket pulse.
    kick(0,.06);kick(.28,.052);noise(.18,.018,.08,5000);tone(392,.12,'square',.022,.04);tone(494,.12,'square',.022,.18);tone(587,.28,'triangle',.035,.34);noise(.34,.02,.38,3800);
  }else if(s==='dalal-street'){
    // Retro finance synth motif.
    [110,165,220,330].forEach(function(f,i){tone(f,.18,i%2?'square':'sawtooth',.023,i*.11);});tone(660,.24,'triangle',.03,.46);click(.18,.02);click(.36,.02);
  }else if(s==='mcc'){
    tone(92,.55,'sawtooth',.018);noise(.5,.018,.02,1800);tone(740,.09,'square',.024,.12);tone(740,.09,'square',.024,.30);tone(520,.25,'triangle',.03,.48);
  }else if(s==='ccc'){
    kick(0,.05);tone(146.8,.35,'triangle',.026,.02);tone(220,.32,'sine',.028,.18);noise(.42,.014,.10,1000);tone(293.7,.3,'triangle',.03,.42);
  }else if(s==='ip'){
    click(0,.026);click(.12,.022);noise(.12,.012,.18,6500);tone(523,.12,'sine',.024,.18);tone(659,.2,'sine',.026,.32);
  }else if(s==='ccep'){
    tone(196,.18,'triangle',.022);tone(261.6,.2,'triangle',.025,.12);tone(392,.24,'sine',.03,.28);noise(.22,.012,.2,2200);
  }else{
    tone(196,.15,'sine',.024);tone(293.7,.18,'triangle',.026,.11);tone(440,.26,'sine',.032,.26);noise(.24,.012,.16,1800);
  }
}
function set(on){enabled=!!on;try{localStorage.setItem('munSound',enabled?'1':'0');}catch(e){}if(enabled){wake();cue('select');}else{clearTheme();}document.documentElement.classList.toggle('sound-on',enabled);return enabled;}
function toggle(){return set(!enabled);}try{enabled=localStorage.getItem('munSound')==='1';}catch(e){}
window.MUNSound={toggle:toggle,set:set,cue:cue,committee:committee,isOn:function(){return enabled;},wake:function(){if(enabled)wake();}};
})();
