/* AURUM hero — liquid-gold silk in a dark vault.
   A displaced ribbon of cloth under studio light, gold dust drifting,
   camera easing toward the cursor. Progressive enhancement only:
   the page is complete without it. */
import * as THREE from "three";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

export function mountHero(host) {
  if (!host) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch { return; }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.6, 9);

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  /* --- The silk --- */
  const geo = new THREE.PlaneGeometry(15, 7, 96, 32);
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#8a6a14"),
    metalness: 1.0,
    roughness: 0.32,
    sheen: 1.0,
    sheenColor: new THREE.Color("#D4AF37"),
    sheenRoughness: 0.4,
    side: THREE.DoubleSide,
  });
  const silk = new THREE.Mesh(geo, mat);
  silk.rotation.x = -0.62;
  silk.position.set(0, -0.4, 0);
  scene.add(silk);

  const pos = geo.attributes.position;
  const base = pos.array.slice();
  function drape(t) {
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      pos.array[i * 3 + 2] =
        Math.sin(x * 0.9 + t * 0.55) * 0.42 +
        Math.cos(y * 1.4 + t * 0.38) * 0.3 +
        Math.sin((x + y) * 0.5 + t * 0.22) * 0.24;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }
  drape(1.2);

  /* --- Gold dust --- */
  const N = 320;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 16;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    seed[i] = Math.random() * Math.PI * 2;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const dust = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xd4af37, size: 0.035, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(dust);

  /* --- Lights --- */
  const key = new THREE.SpotLight(0xffe9b0, 260, 40, 0.55, 0.5);
  key.position.set(4, 9, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8090ff, 0.35);
  rim.position.set(-6, 2, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x1a1610, 2.2));

  /* --- Loop --- */
  const mouse = { x: 0, y: 0 };
  addEventListener("pointermove", e => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    const { clientWidth: w, clientHeight: h } = host;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  let raf, t = 0;
  const clock = new THREE.Clock();
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    drape(t);
    for (let i = 0; i < N; i++) {
      pPos[i * 3 + 1] += Math.sin(t * 0.6 + seed[i]) * 0.0016;
      pPos[i * 3] += Math.cos(t * 0.4 + seed[i]) * 0.0012;
    }
    pGeo.attributes.position.needsUpdate = true;
    camera.position.x += (mouse.x * 1.1 - camera.position.x) * 0.03;
    camera.position.y += (0.6 - mouse.y * 0.55 - camera.position.y) * 0.03;
    camera.lookAt(0, -0.2, 0);
    renderer.render(scene, camera);
  }

  if (reduced) {
    renderer.render(scene, camera); // one still frame, no motion
  } else {
    frame();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { clock.getDelta(); frame(); }
    });
  }
}
