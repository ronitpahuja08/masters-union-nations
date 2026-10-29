// Landing film: the purse → the venue → the reset. See docs/landing-film-spec.md.
// One press on the hero plays it; home.js then auto-drives the gavel strike into the map.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';
const home = document.getElementById('home');
const content = home && home.querySelector('.lobby-content');

if (home && content) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => innerWidth < 700;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const outCubic = x => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
  const inOut = x => { x = clamp(x, 0, 1); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const PURSE = '2,20,000';

  /* ---------- hero call to action ---------- */
  document.documentElement.classList.add('film-mode');
  const cta = document.createElement('div');
  cta.className = 'film-cta';
  cta.innerHTML = '<button class="film-play" type="button"><i aria-hidden="true"></i>Reset the world</button>'
    + '<button class="film-skip-link" type="button">Skip to the map</button>';
  content.appendChild(cta);

  /* ---------- film markup ---------- */
  const film = document.createElement('section');
  film.className = 'film';
  film.id = 'introFilm';
  film.setAttribute('aria-hidden', 'true');
  film.setAttribute('aria-label', 'Opening film: the prize pool, the venue and the world reset');
  const odoCols = PURSE.split('').map(ch => /\d/.test(ch)
    ? `<span class="odo-col"><span class="odo-strip">${'0123456789'.repeat(3).split('').map(d => `<span>${d}</span>`).join('')}</span></span>`
    : `<span class="sep">${ch}</span>`).join('');
  film.innerHTML = '<div class="film-sky sky-purse"></div><div class="film-sky sky-print"></div><div class="film-sky sky-sunset"></div><div class="film-sky sky-night"></div>'
    + '<canvas class="film-gl" aria-hidden="true"></canvas><div class="film-vignette"></div><i class="film-line" aria-hidden="true"></i>'
    + '<div class="film-slate" aria-hidden="true"><b>Masters’ Union Nations 26</b><span class="chapter c1">I · The purse</span><span class="chapter c2">II · The venue</span></div>'
    + `<div class="film-purse"><small>The prize pool</small><div class="film-odo" role="img" aria-label="Rupees 2,20,000"><span class="cur">₹</span>${odoCols}</div><p>across eight committees. Come and take it.</p></div>`
    + '<div class="film-venue"><span class="ln k">The venue</span><h2 class="ln">CDS Corporate Tower</h2><em class="ln">Udyog Vihar, Gurugram</em>'
    + '<span class="ln meta"><span>28 — 29 Nov 2026</span><span>8 committees</span><span>2 days</span></span></div>'
    + '<span class="film-tag">8 committee rooms</span><span class="film-tag">28 — 29 November</span><span class="film-tag">Udyog Vihar · Gurugram</span>'
    + '<button class="film-skip" type="button">Skip to the map <span aria-hidden="true">↗</span></button>';
  document.body.appendChild(film);
  const $ = s => film.querySelector(s);
  const glCanvas = $('.film-gl');
  const strips = [...film.querySelectorAll('.film-odo .odo-strip')];
  const tags = [...film.querySelectorAll('.film-tag')];

  /* ---------- odometer: each drum spins in on its own beat ---------- */
  function odometer(on) {
    const digits = PURSE.replace(/\D/g, '').split('').map(Number);
    strips.forEach((s, i) => {
      s.style.transition = on ? `transform ${1150 + i * 150}ms cubic-bezier(.12,.75,.16,1)` : 'none';
      s.style.transform = `translateY(${on ? -(20 + digits[i]) : 0}em)`;
    });
  }

  /* ---------- canvas art: original rupee notes, never a replica ---------- */
  function rupeeNote(denom, a, b, ink) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 240;
    const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 512, 240); bg.addColorStop(0, a); bg.addColorStop(1, b);
    g.fillStyle = bg; g.fillRect(0, 0, 512, 240);
    g.strokeStyle = ink; g.lineWidth = 3; g.globalAlpha = .55; g.strokeRect(10, 10, 492, 220);
    g.globalAlpha = .28; g.lineWidth = .8;
    for (let k = 0; k < 26; k++) { // guilloche rosette
      g.beginPath();
      for (let t = 0; t <= Math.PI * 2 + .02; t += .03) {
        const r = 58 + 14 * Math.sin(7 * t + k * .24) + 6 * Math.cos(13 * t);
        const x = 112 + Math.cos(t + k * .12) * r, y = 120 + Math.sin(t + k * .12) * r * .9;
        t ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    for (let k = 0; k < 9; k++) { // wave field
      g.beginPath();
      for (let x = 200; x <= 500; x += 4) { const y = 34 + k * 20 + Math.sin(x * .05 + k) * 5; x === 200 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
    g.globalAlpha = .9; // the ZERO emblem where a portrait would sit
    g.beginPath(); g.arc(330, 120, 62, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.28)'; g.fill();
    g.lineWidth = 2; g.strokeStyle = ink; g.stroke();
    g.beginPath(); g.arc(330, 120, 52, 0, Math.PI * 2); g.lineWidth = .8; g.stroke();
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '800 34px Manrope, system-ui, sans-serif'; g.fillText('ZERO', 330, 112);
    g.font = '500 11px "DM Mono", monospace'; g.fillText('THE WORLD RESET', 330, 142);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.font = '600 13px "DM Mono", monospace'; g.fillText("MASTERS' UNION NATIONS", 28, 38);
    g.font = '800 64px Manrope, system-ui, sans-serif'; g.fillText('₹' + denom, 28, 210);
    g.textAlign = 'right'; g.font = '800 40px Manrope, system-ui, sans-serif'; g.fillText(denom, 492, 52);
    g.fillStyle = '#a3262c'; g.font = '600 15px "DM Mono", monospace'; g.fillText('2ZR 281126', 492, 214);
    g.fillStyle = 'rgba(200,200,210,.9)'; g.fillRect(246, 10, 6, 220); // security thread
    g.globalAlpha = 1;
    return c;
  }
  function stackEdge() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 128;
    const g = c.getContext('2d');
    for (let y = 0; y < 128; y += 2) { g.fillStyle = y % 4 ? '#cfc8ad' : '#a8a286'; g.fillRect(0, y, 64, 2); }
    return c;
  }
  function bandArt() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#a3262c'; g.fillRect(0, 20, 256, 10); g.fillRect(0, 226, 256, 10);
    g.fillStyle = '#2a0a10'; g.textAlign = 'center'; g.font = '800 44px Manrope, sans-serif'; g.fillText('₹', 128, 112);
    g.font = '700 30px Manrope, sans-serif'; g.fillText('2,20,000', 128, 156);
    g.font = '500 15px "DM Mono", monospace'; g.fillText('MUN · 26', 128, 196);
    return c;
  }
  function paneTexture(THREE, cols, lit, emissive) {
    const c = document.createElement('canvas'); c.width = cols * 32; c.height = 64;
    const g = c.getContext('2d');
    for (let i = 0; i < cols; i++) {
      const x = i * 32, on = lit[i];
      if (emissive) { g.fillStyle = '#000'; g.fillRect(x, 0, 32, 64); if (on) { g.fillStyle = 'rgba(255,196,120,.9)'; g.fillRect(x + 2, 12, 28, 50); } continue; }
      const gr = g.createLinearGradient(0, 12, 0, 64);
      gr.addColorStop(0, '#f39a5c'); gr.addColorStop(.5, '#a8402a'); gr.addColorStop(1, '#4a1a1c');
      g.fillStyle = '#211311'; g.fillRect(x, 0, 32, 64);
      g.fillStyle = on ? '#e9b47a' : gr; g.fillRect(x + 1.5, 12, 29, 51);
      g.fillStyle = 'rgba(255,240,220,.16)'; g.fillRect(x + 3, 14, 5, 47);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
    return t;
  }

  /* ---------- the stage: one renderer, two sets ---------- */
  let stage = null, stageLoading = null;
  function loadStage() {
    if (stage || stageLoading) return stageLoading;
    stageLoading = import(THREE_URL).then(THREE => { stage = buildStage(THREE); return stage; }).catch(() => null);
    return stageLoading;
  }
  function buildStage(THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: !phone(), powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone() ? 1.25 : 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.autoClear = false;
    const tex = (canvas, aniso = 4) => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };

    /* --- Set A: the purse --- */
    const purse = new THREE.Scene();
    const purseCam = new THREE.PerspectiveCamera(32, 1, .1, 200);
    purse.add(new THREE.AmbientLight(0x3a1a1a, .6));
    const spot = new THREE.SpotLight(0xfff0d8, 220, 40, .42, .7, 1.4); spot.position.set(0, 13, 3); spot.target.position.set(0, 0, 0); purse.add(spot, spot.target);
    const rim = new THREE.DirectionalLight(0xff6a3a, 1.6); rim.position.set(-6, 3, -6); purse.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: 0x14050a, roughness: .55, metalness: .1 }));
    floor.rotation.x = -Math.PI / 2; purse.add(floor);
    const notes = [
      ['500', '#d2cdb4', '#a8a48a', '#3b3828'],
      ['200', '#f1cf68', '#d6a33d', '#4b3412'],
      ['100', '#c3bce0', '#9b91c6', '#2e2650'],
    ].map(([d, a, b, ink]) => tex(rupeeNote(d, a, b, ink), 8));
    const NW = 4.4, ND = 2.06, NH = 1.25;
    const bundle = new THREE.Group(); purse.add(bundle);
    const edgeMat = new THREE.MeshStandardMaterial({ map: tex(stackEdge()), roughness: .9 });
    const topMat = new THREE.MeshStandardMaterial({ map: notes[0], roughness: .75 });
    const brick = new THREE.Mesh(new THREE.BoxGeometry(NW, NH, ND), [edgeMat, edgeMat, topMat, edgeMat, edgeMat, edgeMat]);
    brick.position.y = NH / 2; bundle.add(brick);
    const bandMat = new THREE.MeshStandardMaterial({ map: tex(bandArt()), roughness: .8 });
    const bandL = new THREE.Mesh(new THREE.BoxGeometry(.55, NH + .06, ND + .06), bandMat), bandR = bandL.clone();
    bundle.add(bandL, bandR);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(3.6, 40), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .55 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .01; shadow.scale.set(1.3, .7, 1); purse.add(shadow);

    // Flying notes: three instanced batches (one per denomination), CPU physics.
    const perBatch = phone() ? 40 : 62;
    const noteGeo = new THREE.PlaneGeometry(1.28, .6);
    const fly = notes.map(map => {
      const mesh = new THREE.InstancedMesh(noteGeo, new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: 0xffffff, emissiveIntensity: .38, side: THREE.DoubleSide, roughness: .7, transparent: true }), perBatch);
      mesh.frustumCulled = false; mesh.visible = false; purse.add(mesh);
      return { mesh, p: [] };
    });
    const dummy = new THREE.Object3D();
    function burstNotes() {
      fly.forEach(b => {
        b.mesh.visible = true; b.mesh.material.opacity = 1; b.p = [];
        for (let i = 0; i < perBatch; i++) b.p.push({
          x: (Math.random() - .5) * NW, y: NH * Math.random() + .2, z: (Math.random() - .5) * ND,
          vx: (Math.random() - .5) * 9, vy: 5 + Math.random() * 9, vz: (Math.random() - .3) * 7,
          rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6,
          wx: (Math.random() - .5) * 9, wy: (Math.random() - .5) * 6, wz: (Math.random() - .5) * 9, s: Math.random() * 10,
        });
      });
      brick.visible = false;
    }
    function stepNotes(dt, t) {
      fly.forEach(b => {
        if (!b.mesh.visible) return;
        b.p.forEach((q, i) => {
          q.vy -= 9.8 * dt;
          if (q.vy < 0) { q.vy *= Math.exp(-2.6 * dt); q.vx += Math.sin(t * 2.4 + q.s) * 3 * dt; q.vz += Math.cos(t * 1.9 + q.s) * 2 * dt; }
          q.vx *= Math.exp(-.8 * dt); q.vz *= Math.exp(-.8 * dt);
          q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
          q.rx += q.wx * dt; q.ry += q.wy * dt; q.rz += q.wz * dt;
          dummy.position.set(q.x, q.y, q.z); dummy.rotation.set(q.rx, q.ry, q.rz); dummy.updateMatrix();
          b.mesh.setMatrixAt(i, dummy.matrix);
        });
        b.mesh.instanceMatrix.needsUpdate = true;
      });
    }
    function resetPurse() {
      brick.visible = bandL.visible = bandR.visible = true;
      fly.forEach(b => { b.mesh.visible = false; });
      bandL.position.set(-.275, NH / 2, 0); bandR.position.set(.275, NH / 2, 0);
      bandL.rotation.set(0, 0, 0); bandR.rotation.set(0, 0, 0); bandL.scale.setScalar(1); bandR.scale.setScalar(1);
    }
    resetPurse();

    /* --- Set B: the venue, drawn as a blueprint and then built in glass --- */
    const venue = new THREE.Scene();
    venue.fog = new THREE.Fog(0x3a0a0a, 70, 160);
    const venueCam = new THREE.PerspectiveCamera(40, 1, .1, 400);
    const hemi = new THREE.HemisphereLight(0xffb48a, 0x1a0508, 0); venue.add(hemi);
    const sun = new THREE.DirectionalLight(0xff8a45, 0); sun.position.set(-40, 14, 26); venue.add(sun);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf3e9dc, transparent: true, opacity: .9 });
    const groundGrid = new THREE.GridHelper(120, 60, 0xf3e9dc, 0xf3e9dc); groundGrid.material.transparent = true; groundGrid.material.opacity = .08; venue.add(groundGrid);
    const F = 11, FH = 1.05, BW = 7.4, BD = 5.2, BX = 1.2;
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x2c1d19, roughness: .6, metalness: .3, transparent: true, opacity: 0 });
    const glassMats = [0, 1, 2].map(() => {
      const lit = Array.from({ length: 16 }, () => Math.random() < .16);
      return new THREE.MeshStandardMaterial({ map: paneTexture(THREE, 16, lit, false), emissiveMap: paneTexture(THREE, 16, lit, true), emissive: 0xffffff, emissiveIntensity: .1, metalness: .15, roughness: .35, transparent: true, opacity: 0 });
    });
    const drumMats = glassMats.map(m => { const c = m.clone(); c.map = m.map.clone(); c.map.repeat.set(3.4, 1); c.emissiveMap = m.emissiveMap.clone(); c.emissiveMap.repeat.set(3.4, 1); c.map.needsUpdate = c.emissiveMap.needsUpdate = true; return c; });
    const solids = [slabMat, ...glassMats, ...drumMats];
    const bandGeo = new THREE.BoxGeometry(BW, FH - .16, BD), slabGeo = new THREE.BoxGeometry(BW + .3, .16, BD + .3);
    const drumGeo = new THREE.CylinderGeometry(2.6, 2.6, FH - .16, 48, 1, true), drumSlabGeo = new THREE.CylinderGeometry(2.8, 2.8, .16, 48);
    const edgesOf = geo => new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), lineMat);
    const floors = [];
    for (let i = 0; i < F; i++) {
      const fl = new THREE.Group();
      const band = new THREE.Mesh(bandGeo, glassMats[i % 3]); band.position.set(BX, (FH - .16) / 2 + .16, 0);
      const slab = new THREE.Mesh(slabGeo, slabMat); slab.position.set(BX, .08, 0);
      const bl = edgesOf(bandGeo); bl.position.copy(band.position);
      const sl = edgesOf(slabGeo); sl.position.copy(slab.position);
      fl.add(band, slab, bl, sl);
      if (i < F - 1) {
        const drum = new THREE.Mesh(drumGeo, drumMats[(i + 1) % 3]); drum.position.set(BX - BW / 2, (FH - .16) / 2 + .16, BD / 2 - .6);
        const ds = new THREE.Mesh(drumSlabGeo, slabMat); ds.position.set(BX - BW / 2, .08, BD / 2 - .6);
        const dl = edgesOf(drumSlabGeo); dl.position.copy(ds.position);
        fl.add(drum, ds, dl);
      }
      fl.position.y = .6 + i * FH; fl.visible = false; venue.add(fl); floors.push(fl);
    }
    const podiumGeo = new THREE.BoxGeometry(15, .6, 11);
    const podium = new THREE.Mesh(podiumGeo, slabMat); podium.position.y = .3; venue.add(podium);
    const podiumLines = edgesOf(podiumGeo); podiumLines.position.y = .3; venue.add(podiumLines);
    const roofGeo = new THREE.BoxGeometry(BW + 1.6, .32, BD + 1.6);
    const roof = new THREE.Group(); roof.add(new THREE.Mesh(roofGeo, slabMat), edgesOf(roofGeo));
    roof.position.set(BX, .6 + F * FH + .16, 0); roof.visible = false; venue.add(roof);
    // Skyline behind and beside the tower, never between it and the camera.
    const cityGeo = new THREE.BoxGeometry(1, 1, 1); cityGeo.translate(0, .5, 0);
    const cityMat = new THREE.MeshStandardMaterial({ color: 0x1d0a0d, roughness: .8, emissive: 0x2a0606, emissiveIntensity: .4, transparent: true, opacity: 0 });
    const city = new THREE.InstancedMesh(cityGeo, cityMat, 110);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 110; i++) {
      const x = (Math.random() - .5) * 150, z = -12 - Math.random() * 70, h = 2 + Math.random() * (z > -30 ? 6 : 15);
      m4.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(2 + Math.random() * 4, h, 2 + Math.random() * 4));
      city.setMatrixAt(i, m4);
    }
    venue.add(city);
    const starGeo = new THREE.BufferGeometry(), sp = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) { const a = Math.random() * 6.28, e = .25 + Math.random() * 1.2, r = 180; sp[i * 3] = Math.cos(a) * Math.cos(e) * r; sp[i * 3 + 1] = Math.sin(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffe9d6, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
    venue.add(stars);
    const tagPoints = [new THREE.Vector3(BX + BW / 2, 5.5, BD / 2), new THREE.Vector3(BX + BW / 2, .6 + F * FH, -BD / 2), new THREE.Vector3(7.5, .6, 5.5)];

    function resize() {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false);
      purseCam.aspect = venueCam.aspect = w / h;
      purseCam.fov = w < h ? 46 : 32; venueCam.fov = w < h ? 50 : 40;
      purseCam.updateProjectionMatrix(); venueCam.updateProjectionMatrix();
    }
    resize();
    const look = new THREE.Vector3(), v = new THREE.Vector3();

    // t: seconds into the film; dt: frame step. Every pose is a function of t.
    function frame(t, dt) {
      renderer.clear();
      const portrait = purseCam.aspect < 1;
      // Act II: blueprint linework, then glass at sunset, then night.
      if (t > 3.9) {
        const build = t - 4.0;
        floors.forEach((fl, i) => { fl.visible = build > i * .07; });
        roof.visible = build > F * .07;
        const solid = clamp((t - 6.3) / 1.1, 0, 1), night = clamp((t - 8.5) / 1.1, 0, 1);
        solids.forEach(m => { m.opacity = solid; m.transparent = solid < 1; m.depthWrite = solid > .5; });
        cityMat.opacity = solid;
        lineMat.opacity = .9 - solid * .78; groundGrid.material.opacity = .08 * (1 - solid);
        hemi.intensity = 1.1 * solid; sun.intensity = 3.1 * solid * (1 - night * .85);
        const glow = .1 + solid * .2 + night * 1.25;
        glassMats.forEach(m => { m.emissiveIntensity = glow; }); drumMats.forEach(m => { m.emissiveIntensity = glow; });
        stars.material.opacity = night;
        // From a raised three-quarter (an architect's view) down to a street-level hero shot.
        const orbit = inOut((t - 3.9) / 2.6), down = inOut((t - 6.1) / 2.4);
        const ang = lerp(.62, .2, orbit) + lerp(0, -1.05, down);
        const rad = lerp(portrait ? 52 : 38, portrait ? 44 : 32, down);
        venueCam.position.set(Math.sin(ang) * rad, lerp(lerp(24, 19, orbit), 2.6, down) + night * 3, Math.cos(ang) * rad);
        look.set(1, lerp(5.5, portrait ? 16.5 : 12.6, down) + inOut(night) * 46, 0);
        venueCam.lookAt(look);
        renderer.render(venue, venueCam);
        // Callouts follow their anchor points while the plan is still lines.
        tags.forEach((el, i) => {
          v.copy(tagPoints[i]).project(venueCam);
          el.style.transform = `translate(${((v.x * .5 + .5) * innerWidth + 8).toFixed(1)}px,${((-v.y * .5 + .5) * innerHeight - 6).toFixed(1)}px)`;
          el.classList.toggle('on', build > .5 + i * .35 && solid < .3);
        });
        renderer.clearDepth();
      }
      // Act I: dolly in under the spotlight; the band snaps at 2.75 s and the notes hang in slow motion.
      if (t < 5.2) {
        const d = outCubic((t - .3) / 2.4), lift = t > 2.75 ? inOut((t - 2.75) / 1.6) : 0;
        const r = lerp(13, 8.6, d) * (portrait ? 1.35 : 1);
        purseCam.position.set(Math.sin(.5 - d * .5) * r, lerp(5.2, 3.4, d) + lift * 3.2, Math.cos(.5 - d * .5) * r);
        look.set(0, .8 + lift * 4.6, 0);
        purseCam.lookAt(look);
        bundle.rotation.y = -.55 + t * .22;
        if (t > 2.75) {
          const k = outCubic((t - 2.75) / .8);
          bandL.position.set(-.275 - k * 2.6, NH / 2 + Math.sin(k * Math.PI) * 1.2 - k * .5, -k * .8); bandL.rotation.set(k * 1.2, 0, k * 2.2);
          bandR.position.set(.275 + k * 2.8, NH / 2 + Math.sin(k * Math.PI) * 1.0 - k * .5, -k * .6); bandR.rotation.set(-k * 1.1, 0, -k * 2.4);
          bandL.scale.setScalar(1 - k * .75); bandR.scale.setScalar(1 - k * .75);
          if (k >= .95) bandL.visible = bandR.visible = false;
          stepNotes(dt * (t < 3.05 ? 1 : .38), t);
        }
        const fade = 1 - clamp((t - 3.9) / .5, 0, 1); // the stage goes dark as the blueprint draws
        spot.intensity = 220 * clamp(t / .6, 0, 1) * fade;
        floor.visible = shadow.visible = fade > .01;
        fly.forEach(b => { b.mesh.material.opacity = 1 - clamp((t - 4.4) / .8, 0, 1); });
        renderer.render(purse, purseCam);
      }
    }
    function reset() { resetPurse(); floors.forEach(f => { f.visible = false; }); roof.visible = false; }
    // Compile every material up front. three.js skips hidden objects, so show them for the pass.
    const hidden = [...floors, roof, ...fly.map(b => b.mesh)];
    hidden.forEach(o => { o.visible = true; });
    // If the film is already running, only re-hide notes that have not burst yet.
    const restore = () => { if (!playing) reset(); else fly.forEach(b => { if (!b.p.length) b.mesh.visible = false; }); };
    try {
      Promise.all([renderer.compileAsync?.(purse, purseCam), renderer.compileAsync?.(venue, venueCam)]).then(restore, restore);
    } catch (e) { restore(); }
    return { frame, resize, reset, burst: burstNotes };
  }

  /* ---------- the timeline ---------- */
  let playing = false, t0 = 0, last = 0, raf = 0, beat = 0, handedOff = false, holdStart = 0;
  const cls = (c, on = true) => film.classList.toggle(c, on);
  const BEATS = ['beat-purse', 'beat-print', 'beat-sunset', 'beat-night'];
  const setBeat = b => BEATS.forEach(x => cls(x, x === b));
  function resetFilm() {
    ['is-on', 'is-leaving', 'purse-in', 'purse-landed', 'purse-out', 'venue-in', ...BEATS].forEach(c => cls(c, false));
    odometer(false); beat = 0; handedOff = false; holdStart = 0; stage?.reset();
    tags.forEach(el => el.classList.remove('on'));
  }
  function handOff() {
    if (handedOff) return;
    handedOff = true;
    window.MUNJourney?.play();
    cls('is-leaving');
    setTimeout(stop, 950);
  }
  function frame(now) {
    raf = 0;
    if (!playing) return;
    const t = (now - t0) / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
    if (beat < 1 && t > .25) { beat = 1; setBeat('beat-purse'); }
    if (beat < 2 && t > .6) { beat = 2; cls('purse-in'); odometer(true); }
    if (beat < 3 && t > 2.75) { beat = 3; cls('purse-landed'); stage?.burst(); }
    if (beat < 4 && t > 3.7) { beat = 4; cls('purse-out'); }
    if (beat < 5 && t > 3.9) { beat = 5; setBeat('beat-print'); }
    if (beat < 6 && t > 6.3) { beat = 6; setBeat('beat-sunset'); }
    if (beat < 7 && t > 6.8) { beat = 7; cls('venue-in'); }
    if (beat < 8 && t > 8.5) { beat = 8; setBeat('beat-night'); }
    stage?.frame(t, dt);
    if (t > 9.1 && !handedOff) {
      holdStart = holdStart || now;
      if (window.MUNJourney?.globeReady() || now - holdStart > 3000) handOff();
    }
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    playing = false; cancelAnimationFrame(raf); raf = 0;
    resetFilm(); film.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('film-playing');
  }
  function playStill() { // reduced motion: each act as a still card, then the reset
    cls('is-on'); setBeat('beat-purse'); cls('purse-in'); cls('purse-landed'); odometer(true);
    loadStage().then(() => stage?.frame(2.7, 0));
    setTimeout(() => {
      cls('purse-out'); setBeat('beat-sunset'); cls('venue-in');
      stage?.frame(8.3, 0);
      setTimeout(handOff, 1800);
    }, 1800);
  }
  function play() {
    if (playing || !document.body.classList.contains('on-home')) return;
    playing = true;
    resetFilm();
    window.MUNJourney?.warm();
    film.setAttribute('aria-hidden', 'false');
    document.body.classList.add('film-playing');
    $('.film-skip').focus({ preventScroll: true });
    loadStage().then(s => s?.resize());
    if (reduced) { playStill(); return; }
    cls('is-on');
    t0 = last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function skip() {
    stop();
    if (window.MUNRouter?.navigateSection) window.MUNRouter.navigateSection('map');
    else window.MUNHomeNavigation?.goto('map');
  }

  /* ---------- triggers ---------- */
  cta.querySelector('.film-play').addEventListener('click', play);
  cta.querySelector('.film-skip-link').addEventListener('click', skip);
  $('.film-skip').addEventListener('click', skip);
  film.addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });
  const atHero = () => !playing && document.body.classList.contains('on-home') && !document.querySelector('section[role="dialog"][aria-hidden="false"]');
  addEventListener('wheel', e => { if (e.deltaY > 12 && atHero()) play(); }, { passive: true });
  let touchY = null;
  addEventListener('touchstart', e => { touchY = atHero() ? e.touches[0].clientY : null; }, { passive: true });
  addEventListener('touchmove', e => { if (touchY !== null && touchY - e.touches[0].clientY > 46) { touchY = null; play(); } }, { passive: true });
  addEventListener('keydown', e => {
    if (!atHero() || /input|textarea|select/i.test(e.target.tagName)) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); play(); }
  });
  addEventListener('resize', () => { if (playing) stage?.resize(); });

  // Build the stage in idle time after the hero's own opening, like the globe.
  setTimeout(() => (window.requestIdleCallback || (f => setTimeout(f, 1)))(() => loadStage(), { timeout: 4000 }), 3200);
  window.MUNFilm = { play, skip };
}
