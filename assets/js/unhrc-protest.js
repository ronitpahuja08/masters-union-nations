/* UNHRC documentary-style cinematic treatment.
   Visual-only extension: page structure, timing, routing and forms are untouched.
   Photographs illustrate protest themes; they are not actual UNHRC footage. */
(() => {
  'use strict';
  const scenes=window.MUNScenes;
  if (!scenes?.intro || !scenes?.hero) return;
  scenes.intro.UNHRC = `
    <div class="ur-intro" aria-hidden="true">
      <div class="ur-shot ur-shot-placards">
        <div class="ur-image ur-placard-photo"></div>
        <div class="ur-depth ur-depth-one"><div class="ur-poster ur-poster-a"><small>ARTICLE 01 / DIGNITY</small><b>HUMAN RIGHTS<br>ARE NOT OPTIONAL.</b><span>OUR VOICES WILL BE HEARD.</span></div></div>
        <div class="ur-depth ur-depth-two"><div class="ur-poster ur-poster-b"><small>THE WORLD IS WATCHING</small><b>WE WANT<br>OUR FUTURE.</b><span>PEOPLE BEFORE POWER.</span></div></div>
        <div class="ur-placards-label">01 / THE VOICES</div>
      </div>
      <div class="ur-shot ur-shot-march">
        <div class="ur-image ur-march-photo"></div>
        <div class="ur-drone-vignette"></div>
        <span class="ur-drone-label">02 / STREETS IN MOTION</span>
        <span class="ur-drone-crosshair" aria-hidden="true"></span>
      </div>
      <div class="ur-shot ur-shot-cordon">
        <div class="ur-photo-half ur-stand-protest"></div>
        <div class="ur-photo-half ur-stand-police"></div>
        <div class="ur-cordon-haze"></div>
        <div class="ur-cordon-label"><span>THE PEOPLE</span><i></i><span>THE CORDON</span></div>
      </div>
      <div class="ur-filmburn"></div>
      <div class="ur-editorial-noise"></div>
      <div class="ur-intro-caption"><span>HUMAN RIGHTS / ACCOUNTABILITY</span><span>ILLUSTRATIVE SCENE / NOT UN FOOTAGE</span></div>
    </div>`;
  scenes.hero.UNHRC = `
    <div class="ur-hero" aria-hidden="true">
      <div class="ur-hero-half ur-hero-protest"><div class="ur-hero-image"></div></div>
      <div class="ur-hero-half ur-hero-security"><div class="ur-hero-image"></div></div>
      <div class="ur-hero-division"></div>
      <div class="ur-hero-mood"></div>
      <div class="ur-hero-grid"></div>
      <div class="ur-hero-fog"></div>
      <div class="ur-hero-edge ur-hero-edge-left"><small>01 / THE VOICES</small><b>THE PEOPLE</b><span>DEMANDING DIGNITY</span></div>
      <div class="ur-hero-edge ur-hero-edge-right"><small>02 / THE CORDON</small><b>THE RESPONSE</b><span>AUTHORITY &amp; ACCOUNTABILITY</span></div>
      <div class="ur-hero-disclaimer">ILLUSTRATIVE VISUALS / PROTEST &amp; SECURITY</div>
    </div>`;
})();