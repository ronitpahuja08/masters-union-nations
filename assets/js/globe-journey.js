import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';

// Scroll choreography: the Earth emerges, completes one rotation, then its surface unrolls
// into the flat world map. The flat map in the page is the same image, so the hand-off is seamless.
const canvas = document.getElementById('globeCanvas');
const stick = document.getElementById('journeyStick');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (v, a, b) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const easeOut = t => 1 - Math.pow(1 - t, 3);
const smoother = (v, a, b) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };

const IMG_ASPECT = 1672 / 941;
const TARGET_U = 0.705;     // India's position across the atlas; the spin ends facing it
const TARGET_LAT = 0.34;
const FOV = 40;
const UNROLL_END = 0.88;   // keep in sync with LAND in home.js

try {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);

  const tex = new THREE.TextureLoader().load('assets/images/world-atlas-india-focus.png', () => render(currentP));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const uniforms = {
    map: { value: tex },
    uMorph: { value: 0 },
    uRot: { value: new THREE.Vector2(0, 0) },
    uPlane: { value: new THREE.Vector2(2 * IMG_ASPECT, 2) },
    uCenterU: { value: TARGET_U }
  };

  // one grid that is both the sphere and the flat map; uMorph slides every vertex from sphere to plane
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 240, 120),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      vertexShader: `
        uniform float uMorph; uniform vec2 uRot; uniform vec2 uPlane; uniform float uCenterU;
        varying vec2 vUv; varying vec3 vN;
        mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s, 0.,1.,0., s,0.,c);}
        mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0., 0.,c,s, 0.,-s,c);}
        void main(){
          vUv=uv;
          float phi=uv.x*6.28318530718, theta=(1.-uv.y)*3.14159265359;
          vec3 sp=vec3(-cos(phi)*sin(theta), cos(theta), sin(phi)*sin(theta));
          vec3 sph=rotX(uRot.x)*rotY(uRot.y)*sp;
          vec3 pl=vec3((uv.x-.5)*uPlane.x,(uv.y-.5)*uPlane.y,0.);
          float d=abs(uv.x-uCenterU)/max(uCenterU,1.-uCenterU);
          float m=clamp(uMorph*1.9-.9*d,0.,1.);
          m=m*m*m*(m*(m*6.-15.)+10.);
          vN=normalize(mix(sph,vec3(0.,0.,1.),m));
          gl_Position=projectionMatrix*modelViewMatrix*vec4(mix(sph,pl,m),1.);
        }`,
      fragmentShader: `
        uniform sampler2D map; varying vec2 vUv; varying vec3 vN;
        void main(){
          vec4 c=texture2D(map,vUv);
          float f=clamp(vN.z,0.,1.);
          float shade=mix(.26,1.,smoothstep(0.,.55,f));
          if(!gl_FrontFacing) shade*=.4;
          gl_FragColor=vec4(c.rgb*shade,1.);
          #include <colorspace_fragment>
        }`
    })
  );
  sheet.frustumCulled = false;
  scene.add(sheet);

  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uA: { value: 1 } },
    vertexShader: 'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform float uA;varying vec3 vN;void main(){float i=pow(max(0.,.68-dot(vN,vec3(0.,0.,1.))),3.);gl_FragColor=vec4(.74,.14,.26,1.)*i*1.5*uA;}',
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.12, 64, 48), haloMat);
  scene.add(halo);

  const endY = -(TARGET_U - 0.25) * Math.PI * 2;
  const startY = endY - Math.PI * 2;              // exactly one full revolution
  const dEnd = 1 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));   // distance at which a 2-unit-tall plane fills the screen

  function resize() {
    const w = stick.clientWidth, h = stick.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // distance that keeps the whole sphere on screen, and its on-screen radius (used to place the side words)
    dBase = Math.max(4, Math.sqrt(1 + Math.pow(3.43 / camera.aspect, 2)));
    const radiusPx = (h / 2) * (1 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / Math.sqrt(dBase * dBase - 1);
    stick.style.setProperty('--globe-r', radiusPx.toFixed(1) + 'px');
    const ph = 2 * Math.max(1, camera.aspect / IMG_ASPECT);       // "cover" sizing, like the page's background
    uniforms.uPlane.value.set(ph * IMG_ASPECT, ph);
  }

  let currentP = 0, dBase = 4;
  function render(p) {
    currentP = p;
    const d0 = dBase + 6 * (1 - easeOut(clamp(p / 0.3, 0, 1)));   // emerge: glide in from far away
    // unroll ends exactly at UNROLL_END, where the page swaps to its own map and lands; the blend keeps
    // some speed at the end so the sheet arrives with momentum instead of drifting to a stop
    const ut = clamp((p - 0.54) / (UNROLL_END - 0.54), 0, 1);
    const unroll = 0.6 * smoother(ut, 0, 1) + 0.4 * Math.pow(ut, 2.4);
    camera.position.set(0, 0, d0 + (dEnd - d0) * unroll);
    camera.lookAt(0, 0, 0);
    const spin = smoother(p, 0.1, 0.6);
    uniforms.uRot.value.set(0.05 + (TARGET_LAT - 0.05) * spin, startY + (endY - startY) * spin);
    uniforms.uMorph.value = unroll;
    haloMat.uniforms.uA.value = 1 - smooth(unroll, 0, 0.35);
    halo.visible = unroll < 0.4;
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
