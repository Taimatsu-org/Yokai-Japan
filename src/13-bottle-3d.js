/* 3d render */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('yokai-3d-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  const GLB_URL = 'https://raw.githubusercontent.com/JackZhuCU/yokai-japan/main/Yokai%20Bake_2.glb';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  let lastActivity = performance.now();
  let sceneReady = false;
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 0.8s ease-out';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0302);
  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.01, 200);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Load real studio HDRI for crisp glass reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  new RGBELoader().load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/ferndale_studio_09_1k.hdr',
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      texture.dispose();
      pmremGenerator.dispose();
      lastActivity = performance.now();
    }
  );

  // Bloom composer
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (!isMobile) {
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(Math.floor(container.clientWidth / 2), Math.floor(container.clientHeight / 2)), 0.15, 0.4, 1.0);
    composer.addPass(bloomPass);
    composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main() { vec3 c = texture2D(tDiffuse, vUv).rgb; vec3 s = c * c * (3.0 - 2.0 * c); c = mix(c, s, 0.5); float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, 1.1); gl_FragColor = vec4(c, 1.0); }'
    }));
  }
  composer.addPass(new OutputPass());

  const bc = new THREE.Vector3();
  let pivot = null;
  let hazeMat = null;
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    lastActivity = performance.now();
    const rect = container.getBoundingClientRect();
    mouseX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
    mouseY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
  });

  let mixer = null;
  let duration = 0;
  let actions = [];
  let scrollProgress = 0;
  let cutSides = [0, 0, 0];

  // Scene-based scroll remapping to eliminate pause (offset away from interp zones)
  const safetyOffset = 0.2;
  const sceneStarts = [0, 2.013 + safetyOffset, 3.993 + safetyOffset, 5.973 + safetyOffset];
  const sceneEnds = [1.98 - safetyOffset, 3.96 - safetyOffset, 5.94 - safetyOffset, 8 - safetyOffset];
  const totalUsable = sceneEnds.reduce((s, e, i) => s + (e - sceneStarts[i]), 0);
  const scrollPoints = [0];
  let cum = 0;
  for (let i = 0; i < 4; i++) {
    cum += (sceneEnds[i] - sceneStarts[i]) / totalUsable;
    scrollPoints.push(cum);
  }

  const loader = new GLTFLoader();
  loader.load(GLB_URL, (gltf) => {
    scene.add(gltf.scene);

    // Force world matrix computation + material tweaks
    gltf.scene.traverse(child => {
      if (!child.isMesh) return;
      if (child.name === 'tag' || child.name === 'water') { child.visible = false; return; }
      child.getWorldPosition(new THREE.Vector3());
      if (!child.material) return;
      var mat = child.material;
      var isGlass = mat.transmission !== undefined && mat.transmission > 0.3;
      if (isGlass) {
        mat.transmission = 1.0;
        mat.roughness = 0.0;
        mat.ior = 1.5;
        mat.thickness = 0.1;
        mat.envMapIntensity = 0.7;
        mat.specularIntensity = 1.0;
        if (!isMobile) { mat.clearcoat = 1.0; mat.clearcoatRoughness = 0.03; }
        mat.attenuationColor = new THREE.Color(0xd06040);
        mat.attenuationDistance = 0.08;
        child.renderOrder = 1;
      } else if (child.name === 'Plane') {
        mat.color.multiplyScalar(0.5);
        mat.envMapIntensity = 0;
      } else {
        mat.transparent = false;
        if (mat.transmission !== undefined) mat.transmission = 0;
        mat.depthWrite = true;
        mat.envMapIntensity = 0.6;
        if (child.name === 'cap') {
          mat.roughness = 0.55;
          mat.metalness = 0;
          if ('clearcoat' in mat) { mat.clearcoat = 0.3; mat.clearcoatRoughness = 0.5; }
        } else if (child.name === 'Mesh_1') {
          mat.roughness = 0.05;
          mat.metalness = 1.0;
          mat.envMapIntensity = 0.8;
          mat.color.multiplyScalar(0.55);
        } else if (child.name.startsWith('body-1_Cube002_')) {
          mat.color.multiply(new THREE.Color(0.6, 0.3, 0.2));
        }
      }
    });

    var bottleBox = new THREE.Box3();
    gltf.scene.traverse(child => {
      if (child.isMesh && child.name !== 'Plane') bottleBox.expandByObject(child);
    });
    bottleBox.getCenter(bc);
    camera.position.set(bc.x + 2.2, bc.y, bc.z);
    camera.lookAt(bc);

    var bgLight = new THREE.PointLight(0xff7844, 25, 30, 1.5);
    bgLight.position.set(bc.x - 2, bc.y - 1.8, bc.z);
    scene.add(bgLight);

    var keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(bc.x + 3, bc.y + 2, bc.z + 1);
    scene.add(keyLight);

    var rimTarget = new THREE.Object3D();
    rimTarget.position.copy(bc);
    scene.add(rimTarget);
    var rim1 = new THREE.DirectionalLight(0xffffff, 1.5);
    rim1.position.set(bc.x + 0.5, bc.y + 1, bc.z + 2.5);
    rim1.target = rimTarget;
    scene.add(rim1);
    var rim2 = new THREE.DirectionalLight(0xffffff, 1.5);
    rim2.position.set(bc.x + 0.5, bc.y + 1, bc.z - 2.5);
    rim2.target = rimTarget;
    scene.add(rim2);

    let planeChild = null;
    gltf.scene.traverse(c => { if (c.name === 'Plane') planeChild = c; });
    if (planeChild) scene.attach(planeChild);

    if (!isMobile) {
      hazeMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform float uTime; varying vec2 vUv; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);} float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<2;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;} void main(){vec2 p=vUv*2.5+vec2(uTime*0.03,uTime*0.015);float n=fbm(p);float alpha=smoothstep(0.3,0.8,n)*0.22;gl_FragColor=vec4(vec3(0.45,0.18,0.08),alpha);}',
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const haze = new THREE.Mesh(new THREE.PlaneGeometry(7, 5), hazeMat);
      haze.position.set(bc.x - 0.8, bc.y, bc.z);
      haze.rotation.y = Math.PI / 2;
      scene.add(haze);
    }

    const p = new THREE.Group();
    p.position.copy(bc);
    scene.add(p);
    p.attach(gltf.scene);
    pivot = p;
    lastActivity = performance.now();
    sceneReady = true;
    requestAnimationFrame(() => { canvas.style.opacity = '1'; });

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach(clip => {
        var action = mixer.clipAction(clip);
        action.play();
        action.paused = true;
        actions.push(action);
        if (clip.duration > duration) duration = clip.duration;
      });

      gsap.registerPlugin(ScrollTrigger);
      var triggerEl = document.querySelector('._3d-scene') || document.querySelector('[class*="3d-scene"]');
      if (triggerEl) {
        ScrollTrigger.create({
          trigger: triggerEl,
          start: 'top top', end: 'bottom bottom',
          onUpdate: (self) => { scrollProgress = self.progress; lastActivity = performance.now(); }
        });
      }
    }
  }, undefined, (error) => {
    console.error('YOKAI 3D: Failed to load model', error);
  });

  function animate() {
    requestAnimationFrame(animate);
    if (sceneReady && performance.now() - lastActivity > 3000) return;
    if (mixer && duration && actions.length) {
      var rawP = Math.max(0, Math.min(scrollProgress, 1));
      // Map scroll to animation time via scene boundaries (no dead zones)
      var t = sceneEnds[3];
      for (var si = 0; si < 4; si++) {
        if (rawP <= scrollPoints[si + 1]) {
          var scenePct = (rawP - scrollPoints[si]) / (scrollPoints[si + 1] - scrollPoints[si]);
          t = sceneStarts[si] + scenePct * (sceneEnds[si] - sceneStarts[si]);
          break;
        }
      }
      actions.forEach(action => { action.time = t; action.paused = false; });
      mixer.update(0);
      actions.forEach(action => { action.paused = true; });
    }
    if (pivot) {
      const tRotY = mouseX * 0.05;
      const tRotZ = -mouseY * 0.025;
      pivot.rotation.y += (tRotY - pivot.rotation.y) * 0.06;
      pivot.rotation.z += (tRotZ - pivot.rotation.z) * 0.06;
    }
    if (hazeMat) hazeMat.uniforms.uTime.value = performance.now() * 0.001;
    composer.render();
  }
  animate();

  var resizeObserver = new ResizeObserver(() => {
    var w = container.clientWidth;
    var h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  });
  resizeObserver.observe(container);
});
