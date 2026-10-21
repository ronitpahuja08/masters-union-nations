import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';

// The Earth revolves into view as you scroll from the home page, then flattens into the world map.
const canvas = document.getElementById('globeCanvas');
const stick = document.getElementById('journeyStick');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (v, a, b) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// where India sits on the flat atlas (fraction across / down); used to finish the spin facing it
const TARGET_U = 0.705;
const TARGET_LAT = 0.34;

try {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);

  const tex = new THREE.TextureLoader().load('assets/images/world-atlas-night.png', () => render(currentP));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.ShaderMaterial({
      uniforms: { map: { value: tex } },
      vertexShader: 'varying vec2 vUv;varying vec3 vN;void main(){vUv=uv;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform sampler2D map;varying vec2 vUv;varying vec3 vN;void main(){vec4 c=texture2D(map,vUv);float f=clamp(vN.z,0.,1.);c.rgb*=mix(.28,1.,smoothstep(0.,.55,f));gl_FragColor=vec4(c.rgb,1.);\n#include <colorspace_fragment>\n}'
    })
  );
  scene.add(earth);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 64, 48),
    new THREE.ShaderMaterial({
      vertexShader: 'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec3 vN;void main(){float i=pow(max(0.,.68-dot(vN,vec3(0.,0.,1.))),3.);gl_FragColor=vec4(.30,.56,1.,1.)*i*1.6;}',
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    })
  );
  scene.add(halo);

  const endY = -(TARGET_U - 0.25) * Math.PI * 2;
  const startY = endY - 4.4;

  function resize() {
    const w = stick.clientWidth, h = stick.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let currentP = 0;
  function render(p) {
    currentP = p;
    const t = smooth(p, 0.04, 0.8);
    const dist = 7 - 4.4 * Math.pow(t, 1.35);        // pull in, stopping while the texture is still crisp
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    const spin = smooth(p, 0.03, 0.82);
    earth.rotation.set(0.12 + (TARGET_LAT - 0.12) * spin, startY + (endY - startY) * spin, 0);
    halo.visible = p < 0.97;
    renderer.render(scene, camera);
  }

  resize();
  addEventListener('resize', () => { resize(); render(currentP); });
  addEventListener('journey', e => render(e.detail));
  render(0);
} catch (err) {
  console.warn('Globe unavailable, using a plain fade:', err);
  window.dispatchEvent(new Event('globe-failed'));
}
