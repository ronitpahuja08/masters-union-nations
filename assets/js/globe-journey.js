import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';

// Scroll-scrubbed 3D reveal: a marble delegate strikes the globe and opens the map.
const canvas = document.getElementById('globeCanvas');
const stick = document.getElementById('journeyStick');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (v, a, b) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

try {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 80);
  camera.position.set(0, 0, 8.6);
  scene.add(new THREE.HemisphereLight(0xffd9bd, 0x190513, .92));
  const key = new THREE.DirectionalLight(0xffd3a8, 2.1); key.position.set(-3, 5, 7); scene.add(key);
  const fill = new THREE.DirectionalLight(0x8a283f, .32); fill.position.set(2, -1, -3); scene.add(fill);

  const loader = new THREE.TextureLoader();
  let textureReady = false, poseCount = 0, lastRenderedP = -1;
  const atlas = loader.load('assets/images/world-atlas-india-focus.png', texture => {
    colorizeFragments(texture.image);
    textureReady = true;
    render(currentP, true);
  }, undefined, () => window.dispatchEvent(new Event('globe-failed')));
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const planetRadius = 1.36;
  const planet = new THREE.Group();
  planet.position.set(.95, .02, 0);
  scene.add(planet);
  const earthMaterial = new THREE.MeshStandardMaterial({ map: atlas, emissiveMap: atlas, emissive: 0x9f766f, emissiveIntensity: .34, roughness: 1, metalness: 0, transparent: true });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(planetRadius, 48, 36), earthMaterial);
  planet.add(earth);
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(planetRadius * 1.065, 40, 30), new THREE.MeshBasicMaterial({ color: 0xaa3153, side: THREE.BackSide, transparent: true, opacity: .11, blending: THREE.AdditiveBlending, depthWrite: false }));
  planet.add(atmosphere);

  // Eight committee beacons glow across the globe before the map opens.
  const committeeLocations = [[46.2,6.1],[40.7,-74],[1.35,103.8],[12.97,77.59],[28.61,77.2],[19.07,72.88],[28.46,77.03],[51.5,-.12]];
  const beacons = new THREE.Group(); planet.add(beacons);
  committeeLocations.forEach(([lat, lon], i) => {
    const phi = (lon + 180) * Math.PI / 180, theta = (90 - lat) * Math.PI / 180;
    const point = new THREE.Vector3(-planetRadius * Math.sin(theta) * Math.cos(phi), planetRadius * Math.cos(theta), planetRadius * Math.sin(theta) * Math.sin(phi));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.035, 14, 12), new THREE.MeshBasicMaterial({ color: i === 5 ? 0xffc474 : 0xd9eaff }));
    dot.position.copy(point.multiplyScalar(1.012)); beacons.add(dot);
  });

  // Fractures begin where the gavel meets the upper-left edge of the globe.
  const fractureMaterial = new THREE.LineBasicMaterial({ color: 0xffdca0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
  const fractures = new THREE.Group(); planet.add(fractures);
  const impactDirection = new THREE.Vector3(-.72, -.28, .64).normalize();
  const impactSurface = impactDirection.clone().multiplyScalar(planetRadius * 1.009);
  const tangentA = new THREE.Vector3().crossVectors(impactSurface, new THREE.Vector3(0, 0, 1)).normalize();
  const tangentB = new THREE.Vector3().crossVectors(impactSurface, tangentA).normalize();
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const points = [impactSurface.clone()];
    for (let j = 1; j <= 5; j++) {
      const len = j * .11 + (j % 2 ? .018 : -.012);
      points.push(impactSurface.clone().addScaledVector(tangentA, Math.cos(angle) * len).addScaledVector(tangentB, Math.sin(angle) * len).normalize().multiplyScalar(planetRadius * 1.012));
    }
    fractures.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), fractureMaterial));
  }
  const shock = new THREE.Mesh(new THREE.TorusGeometry(.15, .012, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffd58f, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
  shock.position.copy(planet.position).add(impactSurface); scene.add(shock);

  // A bounded point cloud keeps the impact dense without rebuilding nine thousand
  // positions on every frame of the map handoff.
  const random = n => { const x = Math.sin(n * 127.1 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const fragmentCount = innerWidth < 700 ? 950 : 2400;
  const fragmentBase = new Float32Array(fragmentCount * 3);
  const fragmentData = new Float32Array(fragmentCount * 3);
  const fragmentColors = new Float32Array(fragmentCount * 3);
  const fragmentSpeed = new Float32Array(fragmentCount);
  const fragmentJitterX = new Float32Array(fragmentCount);
  const fragmentJitterY = new Float32Array(fragmentCount);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < fragmentCount; i++) {
    const y = 1 - 2 * (i + .5) / fragmentCount;
    const r = Math.sqrt(1 - y * y);
    const angle = i * goldenAngle + (random(i + 11) - .5) * .035;
    fragmentBase[i * 3] = Math.cos(angle) * r;
    fragmentBase[i * 3 + 1] = y;
    fragmentBase[i * 3 + 2] = Math.sin(angle) * r;
    fragmentSpeed[i] = .66 + random(i + 53) * .85;
    fragmentJitterX[i] = (random(i + 240) - .5) * .32;
    fragmentJitterY[i] = (random(i + 710) - .5) * .32;
  }
  const fragmentGeo = new THREE.BufferGeometry();
  fragmentGeo.setAttribute('position', new THREE.BufferAttribute(fragmentData, 3));
  fragmentGeo.setAttribute('color', new THREE.BufferAttribute(fragmentColors, 3));
  const fragmentMaterial = new THREE.PointsMaterial({ size: .027, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
  const fragments = new THREE.Points(fragmentGeo, fragmentMaterial);
  fragments.frustumCulled = false;
  fragments.renderOrder = 4;
  scene.add(fragments);

  const sparkCount = innerWidth < 700 ? 180 : 400;
  const sparkData = new Float32Array(sparkCount * 3);
  const sparkColors = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount; i++) {
    const warm = random(i + 991) > .22;
    sparkColors[i * 3] = warm ? 1 : .62;
    sparkColors[i * 3 + 1] = warm ? .58 + random(i + 271) * .26 : .8;
    sparkColors[i * 3 + 2] = warm ? .33 : 1;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkData, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));
  const sparkMaterial = new THREE.PointsMaterial({ size: .04, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const sparks = new THREE.Points(sparkGeo, sparkMaterial);
  sparks.frustumCulled = false;
  sparks.renderOrder = 6;
  scene.add(sparks);

  const trailCount = innerWidth < 700 ? 28 : 55;
  const trailData = new Float32Array(trailCount * 6);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailData, 3));
  const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffc68f, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const trails = new THREE.LineSegments(trailGeo, trailMaterial);
  trails.frustumCulled = false;
  trails.renderOrder = 7;
  scene.add(trails);

  const chipCount = innerWidth < 700 ? 42 : 80;
  const chipMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, depthTest: false });
  const chips = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(.018, 0), chipMaterial, chipCount);
  chips.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  chips.frustumCulled = false;
  chips.renderOrder = 5;
  const chipColor = new THREE.Color();
  for (let i = 0; i < chipCount; i++) {
    chipColor.set(i % 7 === 0 ? 0xe6b477 : i % 11 === 0 ? 0x91bad1 : 0x25212f);
    chips.setColorAt(i, chipColor);
  }
  scene.add(chips);
  const chipTransform = new THREE.Object3D();

  function colorizeFragments(image) {
    const sample = document.createElement('canvas');
    sample.width = 512; sample.height = 256;
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, sample.width, sample.height);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    for (let i = 0; i < fragmentCount; i++) {
      const x = fragmentBase[i * 3], y = fragmentBase[i * 3 + 1], z = fragmentBase[i * 3 + 2];
      const u = ((Math.atan2(z, -x) / (Math.PI * 2)) + 1) % 1;
      const v = Math.acos(clamp(y, -1, 1)) / Math.PI;
      const pixel = (Math.floor(v * 255) * 512 + Math.floor(u * 511)) * 4;
      const light = i % 11 === 0 ? 1.8 : 1.18;
      fragmentColors[i * 3] = Math.min(1, pixels[pixel] / 255 * light + .055);
      fragmentColors[i * 3 + 1] = Math.min(1, pixels[pixel + 1] / 255 * light + .025);
      fragmentColors[i * 3 + 2] = Math.min(1, pixels[pixel + 2] / 255 * light + .035);
    }
    fragmentGeo.attributes.color.needsUpdate = true;
  }

  // Two coherent poses let the whole torso, shoulders and both hands follow the swing.
  const figure = new THREE.Group();
  const figureGeometry = new THREE.PlaneGeometry(3.73, 5.6);
  function pose(path, depth) {
    const material = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: .025, side: THREE.DoubleSide, depthWrite: false, depthTest: false, toneMapped: false, opacity: 0 });
    const mesh = new THREE.Mesh(figureGeometry, material);
    mesh.position.set(0, 2.8, depth);
    figure.add(mesh);
    loader.load(path, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      material.map = texture;
      material.needsUpdate = true;
      poseCount++;
      render(currentP, true);
    }, undefined, () => window.dispatchEvent(new Event('globe-failed')));
    return mesh;
  }
  const windupPose = pose('assets/images/mun-statue-two-hand-windup.webp', 1.4);
  const contactPose = pose('assets/images/mun-statue-two-hand-contact.webp', 1.41);
  scene.add(figure);

  const starPositions = new Float32Array(160 * 3);
  for (let i = 0; i < 160; i++) { const r = 4 + Math.random() * 9, a = Math.random() * Math.PI * 2; starPositions[i * 3] = Math.cos(a) * r; starPositions[i * 3 + 1] = (Math.random() - .5) * 8; starPositions[i * 3 + 2] = -3 - Math.random() * 5; }
  const starsGeo = new THREE.BufferGeometry(); starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xc1d7ff, size: .012, transparent: true, opacity: .35, depthWrite: false })));

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    const w = Math.max(1, stick.clientWidth), h = Math.max(1, stick.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (camera.aspect < 1) { camera.position.z = 10.2; planet.position.set(.48, .02, 0); figure.position.x = -1.08; figure.scale.setScalar(.84); }
    else { camera.position.z = 8.6; planet.position.set(.95, -.23, 0); figure.position.x = -1.35; figure.scale.setScalar(1.12); }
    render(currentP, true);
  }

  let currentP = 0;
  function render(p = currentP, force = false) {
    currentP = p;
    // Keep the last progress while offscreen. Draw only after every pose and the atlas are ready.
    if (!renderer || !textureReady || poseCount < 2 || document.hidden || p < .255 || p > .965) return;
    if (!force && Math.abs(p - lastRenderedP) < .0008) return;
    lastRenderedP = p;
    const globeIn = prefersReduced ? (p > .27 ? 1 : 0) : smooth(p, .27, .36);
    const actorIn = prefersReduced ? 0 : smooth(p, .32, .43) * (1 - smooth(p, .73, .86));
    const windup = smooth(p, .45, .54);
    const strike = prefersReduced ? 0 : smooth(p, .55, .635);
    const burst = prefersReduced ? 0 : smooth(p, .635, .81);
    const fragmentOpacity = smooth(p, .64, .675) * (1 - smooth(p, .84, .93));
    const impactGlow = smooth(p, .615, .638) * (1 - smooth(p, .67, .735));

    planet.scale.setScalar(Math.max(.0001, globeIn));
    planet.rotation.y = mix(-.42, -.05, smooth(p, .2, .55));
    planet.rotation.x = mix(.13, .02, smooth(p, .2, .56));
    earthMaterial.opacity = 1 - smooth(p, .636, .685);
    earth.visible = earthMaterial.opacity > .005;
    atmosphere.material.opacity = .11 * earthMaterial.opacity;
    beacons.visible = p < .65;
    fractureMaterial.opacity = impactGlow * earthMaterial.opacity;
    shock.position.copy(planet.position).add(impactSurface);
    shock.scale.setScalar(.2 + impactGlow * 3.3);
    shock.material.opacity = impactGlow * .65;

    fragments.visible = fragmentOpacity > .002;
    sparks.visible = fragments.visible;
    chips.visible = fragments.visible;
    trails.visible = fragments.visible;
    fragmentMaterial.opacity = fragmentOpacity * .94;
    sparkMaterial.opacity = fragmentOpacity * .72;
    chipMaterial.opacity = fragmentOpacity * .64;
    trailMaterial.opacity = fragmentOpacity * smooth(p, .70, .765) * (1 - smooth(p, .83, .92)) * .38;
    if (fragments.visible) {
      const depthT = burst * burst;
      for (let i = 0; i < fragmentCount; i++) {
        const k = i * 3, speed = fragmentSpeed[i], x = fragmentBase[k], y = fragmentBase[k + 1], z = fragmentBase[k + 2];
        const radius = planetRadius * (1 + burst * (3.1 + speed * 1.1));
        fragmentData[k] = planet.position.x + x * radius + fragmentJitterX[i] * burst;
        fragmentData[k + 1] = planet.position.y + y * radius + fragmentJitterY[i] * burst;
        fragmentData[k + 2] = z * planetRadius + depthT * (3.2 + speed * 2.3);
      }
      fragmentGeo.attributes.position.needsUpdate = true;
      for (let i = 0; i < sparkCount; i++) {
        const k = i * 3, source = ((i * 37) % fragmentCount) * 3, speed = fragmentSpeed[(i * 37) % fragmentCount];
        const radius = planetRadius * (1 + burst * (3.3 + speed * 1.3));
        sparkData[k] = planet.position.x + fragmentBase[source] * radius;
        sparkData[k + 1] = planet.position.y + fragmentBase[source + 1] * radius;
        sparkData[k + 2] = fragmentBase[source + 2] * planetRadius + depthT * (4.2 + speed * 2.2);
      }
      sparkGeo.attributes.position.needsUpdate = true;
      for (let i = 0; i < trailCount; i++) {
        const source = ((i * 73) % fragmentCount) * 3, k = i * 6;
        const x = fragmentData[source], y = fragmentData[source + 1], z = fragmentData[source + 2];
        trailData[k] = x; trailData[k + 1] = y; trailData[k + 2] = z;
        trailData[k + 3] = planet.position.x + (x - planet.position.x) * .88;
        trailData[k + 4] = planet.position.y + (y - planet.position.y) * .88;
        trailData[k + 5] = z - (.18 + burst * .7);
      }
      trailGeo.attributes.position.needsUpdate = true;
      for (let i = 0; i < chipCount; i++) {
        const source = ((i * 71) % fragmentCount) * 3, speed = fragmentSpeed[(i * 71) % fragmentCount];
        const radius = planetRadius * (1 + burst * (2.8 + speed * 1.2));
        chipTransform.position.set(
          planet.position.x + fragmentBase[source] * radius,
          planet.position.y + fragmentBase[source + 1] * radius,
          fragmentBase[source + 2] * planetRadius + depthT * (3.8 + speed * 2.5)
        );
        chipTransform.rotation.set(burst * (i % 13) * .41, burst * (i % 17) * .34, burst * (i % 11) * .52);
        chipTransform.scale.setScalar((.52 + random(i + 420) * .88) * (1 + burst * .7));
        chipTransform.updateMatrix();
        chips.setMatrixAt(i, chipTransform.matrix);
      }
      chips.instanceMatrix.needsUpdate = true;
    }

    figure.visible = actorIn > .005 && !!windupPose.material.map;
    const entrance = smooth(p, .32, .43);
    figure.position.y = (camera.aspect < 1 ? -2.7 : -3.7) + strike * .6;
    figure.position.x = (camera.aspect < 1 ? -1.6 : -2.15) - (1 - entrance) * 1.8 + strike * .22;
    figure.scale.setScalar(camera.aspect < 1 ? .84 : 1.12);
    figure.rotation.y = mix(-.19, .08, strike);
    figure.rotation.z = mix(-.055, -.14, strike);
    const poseBlend = smooth(p, .56, .605);
    windupPose.material.opacity = actorIn * (1 - poseBlend);
    contactPose.material.opacity = actorIn * poseBlend;

    const hit = smooth(p, .6, .63);
    const rumble = prefersReduced ? 0 : hit * (1 - smooth(p, .63, .7));
    camera.position.x = Math.sin(p * 590) * rumble * .042;
    camera.position.y = Math.cos(p * 510) * rumble * .027;
    renderer.render(scene, camera);
  }
  resize();
  addEventListener('resize', resize, { passive: true });
  addEventListener('journey', e => render(e.detail));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(currentP, true); });
  render(0);
} catch (err) {
  console.warn('3D hammer journey unavailable; using the accessible fade transition.', err);
  window.dispatchEvent(new Event('globe-failed'));
}
