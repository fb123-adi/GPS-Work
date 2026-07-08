/* AURUM garment engine — stylized 3D garments with cloth motion,
   fabric materials, patterns, monogram embroidery and light rigs.
   Shared by the product atelier view and the Customization Studio. */
import * as THREE from "three";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

/* ---------- Fabric presets ---------- */
export const FABRICS = {
  cotton:   { label: "Egyptian cotton",        rough: 0.88, sheen: 0.35, clearcoat: 0,    delta: 0 },
  merino:   { label: "Biella merino",          rough: 0.78, sheen: 0.8,  clearcoat: 0,    delta: 120 },
  bamboo:   { label: "Bamboo jersey",          rough: 0.7,  sheen: 0.6,  clearcoat: 0,    delta: 60 },
  recycled: { label: "Recycled performance",   rough: 0.6,  sheen: 0.5,  clearcoat: 0,    delta: 40 },
  shell:    { label: "StormShell 3L",          rough: 0.34, sheen: 0.2,  clearcoat: 0.5,  delta: 180 },
  fleece:   { label: "Thermal fleece",         rough: 1.0,  sheen: 0.9,  clearcoat: 0,    delta: 90 },
  knit:     { label: "Como luxury knit",       rough: 0.55, sheen: 1.0,  clearcoat: 0,    delta: 240 },
};

/* ---------- Pattern painters (canvas texture) ---------- */
export const PATTERNS = {
  none:      { label: "Plain", delta: 0 },
  stripe:    { label: "Pinstripe", delta: 45 },
  chevron:   { label: "Chevron", delta: 60 },
  camo:      { label: "Camo", delta: 75 },
  geometric: { label: "Geo", delta: 60 },
};

function paintTexture({ color, pattern = "none", accent = "#D4AF37", monogram = "" }) {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const x = c.getContext("2d");
  x.fillStyle = color; x.fillRect(0, 0, 1024, 1024);

  x.strokeStyle = accent; x.fillStyle = accent;
  if (pattern === "stripe") {
    x.globalAlpha = 0.5; x.lineWidth = 3;
    for (let i = 0; i < 1024; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke(); }
  } else if (pattern === "chevron") {
    x.globalAlpha = 0.42; x.lineWidth = 5;
    for (let yy = -64; yy < 1100; yy += 96) {
      x.beginPath();
      for (let xx = 0; xx <= 1024; xx += 64)
        x.lineTo(xx, yy + ((xx / 64) % 2 ? 0 : 40));
      x.stroke();
    }
  } else if (pattern === "camo") {
    x.globalAlpha = 0.22;
    for (let i = 0; i < 46; i++) {
      const px = (i * 197) % 1024, py = (i * 311) % 1024, r = 60 + (i * 53) % 90;
      x.beginPath(); x.ellipse(px, py, r, r * 0.62, i, 0, Math.PI * 2); x.fill();
    }
  } else if (pattern === "geometric") {
    x.globalAlpha = 0.35; x.lineWidth = 2.5;
    for (let yy = 0; yy < 1024; yy += 128)
      for (let xx = 0; xx < 1024; xx += 128) {
        x.beginPath();
        x.moveTo(xx + 64, yy); x.lineTo(xx + 128, yy + 64); x.lineTo(xx + 64, yy + 128); x.lineTo(xx, yy + 64);
        x.closePath(); x.stroke();
      }
  }
  x.globalAlpha = 1;

  if (monogram) {
    // Chest placement: lathe UV front sits near u=0.25
    x.save();
    x.translate(256, 330);
    x.font = "700 64px Italiana, Didot, serif";
    x.textAlign = "center";
    x.lineWidth = 2;
    x.strokeStyle = accent;
    x.shadowColor = "rgba(0,0,0,0.45)"; x.shadowBlur = 6;
    x.strokeText(monogram.toUpperCase().slice(0, 12), 0, 0);
    x.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- Geometry builders ---------- */
function lathe(pointsXY, segments = 48) {
  const pts = pointsXY.map(([px, py]) => new THREE.Vector2(px, py));
  return new THREE.LatheGeometry(pts, segments);
}
function torsoProfile({ crop = 0, long = 0, flare = 0 }) {
  const hemY = -1.35 + crop * 0.5 - long * 0.55;
  return [
    [0.98 + flare * 0.35, hemY],
    [0.94, hemY + 0.35],
    [0.9, -0.35],
    [1.02, 0.45],
    [0.98, 0.8],
    [0.68, 1.18],
    [0.36, 1.32],
    [0.34, 1.42],
  ];
}
function sleeve(len, r0, side, drop = 0) {
  const s = side; // -1 | 1
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(s * 0.62, 1.05 - drop * 0.1, 0),
    new THREE.Vector3(s * (1.0 + len * 0.28), 0.75 - len * 0.5, 0.02),
    new THREE.Vector3(s * (1.15 + len * 0.5), 0.45 - len * 1.15, 0.05),
  ]);
  const g = new THREE.TubeGeometry(curve, 20, r0, 14, false);
  return g;
}
function leg(len, rTop, rBot, side, spread = 0.16) {
  const s = side;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(s * 0.34, -0.1, 0),
    new THREE.Vector3(s * (0.4 + spread), -0.9 - len * 0.5, 0.02),
    new THREE.Vector3(s * (0.42 + spread * 1.4), -1.4 - len * 1.25, 0.02),
  ]);
  return new THREE.TubeGeometry(curve, 22, rTop, 14, false);
}

/* Each builder returns { group, cloth: Mesh[] (breeze-animated) } */
const BUILDERS = {
  tee(mat) {
    const torso = new THREE.Mesh(lathe(torsoProfile({})), mat);
    const s1 = new THREE.Mesh(sleeve(0.18, 0.3, -1), mat);
    const s2 = new THREE.Mesh(sleeve(0.18, 0.3, 1), mat);
    const g = group([torso, s1, s2]);
    return { group: g, cloth: [torso] };
  },
  oversized(mat) {
    const torso = new THREE.Mesh(lathe(torsoProfile({ flare: 0.5, long: 0.3 })), mat);
    const s1 = new THREE.Mesh(sleeve(0.35, 0.38, -1), mat);
    const s2 = new THREE.Mesh(sleeve(0.35, 0.38, 1), mat);
    return { group: group([torso, s1, s2]), cloth: [torso] };
  },
  longsleeve(mat) {
    const torso = new THREE.Mesh(lathe(torsoProfile({})), mat);
    const s1 = new THREE.Mesh(sleeve(1, 0.26, -1), mat);
    const s2 = new THREE.Mesh(sleeve(1, 0.26, 1), mat);
    return { group: group([torso, s1, s2]), cloth: [torso] };
  },
  hoodie(mat) {
    const torso = new THREE.Mesh(lathe(torsoProfile({ long: 0.15 })), mat);
    const s1 = new THREE.Mesh(sleeve(1, 0.3, -1), mat);
    const s2 = new THREE.Mesh(sleeve(1, 0.3, 1), mat);
    const hood = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.62), mat);
    hood.position.set(0, 1.32, -0.14);
    hood.rotation.x = -0.35;
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.1), mat);
    pocket.position.set(0, -0.75, 0.62);
    return { group: group([torso, s1, s2, hood, pocket]), cloth: [torso, hood] };
  },
  crop(mat) {
    const torso = new THREE.Mesh(lathe(torsoProfile({ crop: 1 })), mat);
    const s1 = new THREE.Mesh(sleeve(0.5, 0.28, -1), mat);
    const s2 = new THREE.Mesh(sleeve(0.5, 0.28, 1), mat);
    return { group: group([torso, s1, s2]), cloth: [torso] };
  },
  jacket(mat) {
    const torso = new THREE.Mesh(lathe(torsoProfile({ long: 0.25, flare: 0.15 })), mat);
    const s1 = new THREE.Mesh(sleeve(1, 0.32, -1), mat);
    const s2 = new THREE.Mesh(sleeve(1, 0.32, 1), mat);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.07, 12, 32), mat);
    collar.position.set(0, 1.33, 0.02);
    collar.rotation.x = Math.PI / 2 - 0.12;
    collar.scale.z = 0.7;
    return { group: group([torso, s1, s2, collar]), cloth: [torso] };
  },
  puffer(mat) {
    const { group: g, cloth } = BUILDERS.jacket(mat);
    // quilt ridges
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.96 - i * 0.02, 0.05, 10, 40), mat);
      ring.position.y = -1.05 + i * 0.55;
      ring.scale.z = 0.62 / 0.92; // match torso flatten in world
      g.add(ring);
    }
    return { group: g, cloth };
  },
  pants(mat) {
    const hip = new THREE.Mesh(lathe([[0.82, -0.35], [0.86, 0.1], [0.8, 0.42]]), mat);
    const l1 = new THREE.Mesh(leg(1, 0.3, 0.2, -1), mat);
    const l2 = new THREE.Mesh(leg(1, 0.3, 0.2, 1), mat);
    const g = group([hip, l1, l2]);
    g.position.y = 0.8;
    return { group: g, cloth: [l1, l2] };
  },
  shorts(mat) {
    const hip = new THREE.Mesh(lathe([[0.84, -0.35], [0.88, 0.1], [0.82, 0.42]]), mat);
    const l1 = new THREE.Mesh(leg(0.15, 0.34, 0.3, -1), mat);
    const l2 = new THREE.Mesh(leg(0.15, 0.34, 0.3, 1), mat);
    const g = group([hip, l1, l2]);
    g.position.y = 0.5;
    return { group: g, cloth: [] };
  },
  leggings(mat) {
    const hip = new THREE.Mesh(lathe([[0.72, -0.35], [0.76, 0.1], [0.7, 0.42]]), mat);
    const l1 = new THREE.Mesh(leg(1.05, 0.24, 0.13, -1, 0.08), mat);
    const l2 = new THREE.Mesh(leg(1.05, 0.24, 0.13, 1, 0.08), mat);
    const g = group([hip, l1, l2]);
    g.position.y = 0.8;
    return { group: g, cloth: [] };
  },
  bra(mat) {
    const band = new THREE.Mesh(lathe([[0.86, -0.5], [0.9, -0.1], [0.84, 0.28]]), mat);
    const strap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.1, 10), mat);
    strap1.position.set(-0.42, 0.75, -0.05); strap1.rotation.z = 0.18; strap1.rotation.x = -0.22;
    const strap2 = strap1.clone(); strap2.position.x = 0.42; strap2.rotation.z = -0.18;
    const g = group([band, strap1, strap2]);
    g.position.y = 0.35;
    return { group: g, cloth: [] };
  },
  dress(mat) {
    const body = new THREE.Mesh(lathe([
      [1.35, -1.9], [1.0, -1.0], [0.8, -0.3], [0.9, 0.45], [0.85, 0.8], [0.6, 1.15], [0.33, 1.3], [0.31, 1.4],
    ]), mat);
    return { group: group([body]), cloth: [body] };
  },
  skirt(mat) {
    const body = new THREE.Mesh(lathe([[1.15, -1.0], [0.9, -0.3], [0.78, 0.3], [0.8, 0.45]]), mat);
    const g = group([body]);
    g.position.y = 0.4;
    return { group: g, cloth: [body] };
  },
  jersey(mat) {
    const { group: g, cloth } = BUILDERS.tee(mat);
    return { group: g, cloth };
  },
  tracksuit(mat) {
    const top = BUILDERS.jacket(mat);
    top.group.scale.setScalar(0.72);
    top.group.position.y = 0.95;
    const btm = BUILDERS.pants(mat);
    btm.group.scale.setScalar(0.72);
    btm.group.position.y = -1.15;
    const g = new THREE.Group();
    g.add(top.group, btm.group);
    return { group: g, cloth: [...top.cloth, ...btm.cloth] };
  },
  swim(mat) {
    const body = new THREE.Mesh(lathe([
      [0.7, -0.9], [0.82, -0.3], [0.78, 0.3], [0.62, 0.75], [0.4, 1.0],
    ]), mat);
    return { group: group([body]), cloth: [] };
  },
};

/* Map studio/product silhouettes → builders */
export const TYPE_MAP = {
  tee: "tee", oversizedTee: "oversized", cropTee: "crop", tank: "tee", polo: "tee",
  compression: "longsleeve", hoodie: "hoodie", cropHoodie: "crop", sweatshirt: "longsleeve",
  jersey: "jersey", jacket: "jacket", bomber: "jacket", windbreaker: "jacket",
  puffer: "puffer", coat: "jacket", blazer: "jacket", vest: "swim",
  joggers: "pants", cargo: "pants", shorts: "shorts", leggings: "leggings",
  bra: "bra", dress: "dress", skirt: "skirt", set: "tracksuit", swim: "swim",
};
export const HAS_3D = new Set(Object.keys(TYPE_MAP));

function group(meshes) {
  const g = new THREE.Group();
  meshes.forEach(m => { m.scale.z = m.scale.z || 1; g.add(m); });
  // Flatten torso-ish meshes front-to-back for a garment read
  g.children.forEach(m => { if (m.geometry.type === "LatheGeometry") m.scale.z = 0.62; });
  return g;
}

/* ---------- Viewer ---------- */
export function createViewer(host, config = {}) {
  const state = {
    type: config.type || "hoodie",
    color: config.color || "#141310",
    accent: config.accent || "#D4AF37",
    fabric: config.fabric || "merino",
    pattern: config.pattern || "none",
    monogram: config.monogram || "",
    lighting: config.lighting || "studio",
    autorotate: config.autorotate ?? true,
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 0.25, 7.1);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.4; controls.maxDistance = 10;
  controls.autoRotate = state.autorotate && !reduced;
  controls.autoRotateSpeed = 1.1;

  /* Pedestal */
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.7, 0.14, 56),
    new THREE.MeshStandardMaterial({ color: 0xd6cfbc, metalness: 0.15, roughness: 0.6 }));
  pedestal.position.y = -2.35;
  scene.add(pedestal);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.65, 0.012, 8, 72),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.3 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -2.27;
  scene.add(ring);

  /* Light rigs */
  const rigs = {};
  function makeRig(build) { const g = new THREE.Group(); build(g); g.visible = false; scene.add(g); return g; }
  rigs.studio = makeRig(g => {
    const key = new THREE.SpotLight(0xffe9b0, 170, 40, 0.5, 0.45); key.position.set(3.5, 7, 5); g.add(key);
    const rim = new THREE.DirectionalLight(0xa8b4ff, 0.5); rim.position.set(-5, 2, -4); g.add(rim);
    g.add(new THREE.AmbientLight(0x141210, 2.4));
  });
  rigs.daylight = makeRig(g => {
    g.add(new THREE.HemisphereLight(0xfff4e0, 0x2a2620, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.8); sun.position.set(4, 8, 3); g.add(sun);
  });
  rigs.runway = makeRig(g => {
    const l = new THREE.SpotLight(0xd4af37, 420, 40, 0.4, 0.5); l.position.set(-5, 6, 3); g.add(l);
    const r = new THREE.SpotLight(0x8090ff, 260, 40, 0.4, 0.5); r.position.set(5, 6, -2); g.add(r);
    g.add(new THREE.AmbientLight(0x0c0b0a, 2));
  });

  /* Garment */
  let garment = null, clothMeshes = [], clothBases = [];
  const material = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide });

  function applyMaterial() {
    const f = FABRICS[state.fabric] || FABRICS.merino;
    material.map?.dispose();
    material.map = paintTexture(state);
    material.color = new THREE.Color(0xffffff);
    material.roughness = f.rough;
    material.sheen = f.sheen * 0.3;          // grazing shimmer, not a paint layer
    material.sheenRoughness = 0.55;
    material.sheenColor = new THREE.Color(state.accent);
    material.clearcoat = f.clearcoat;
    material.metalness = 0.05;
    material.envMapIntensity = 0.55;
    material.needsUpdate = true;
  }

  function rebuild() {
    if (garment) {
      scene.remove(garment);
      garment.traverse(o => o.geometry?.dispose());
    }
    const builder = BUILDERS[TYPE_MAP[state.type] || "tee"];
    const built = builder(material);
    garment = built.group;
    clothMeshes = built.cloth;
    clothBases = clothMeshes.map(m => m.geometry.attributes.position.array.slice());
    scene.add(garment);
  }

  function applyLighting() {
    Object.entries(rigs).forEach(([k, g]) => g.visible = k === state.lighting);
    renderer.toneMappingExposure = state.lighting === "daylight" ? 1.15 : 1.0;
  }

  applyMaterial(); rebuild(); applyLighting();

  let framed = false;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!framed) {
      // Portrait stages need more distance to keep the garment in frame
      camera.position.z = camera.aspect < 1 ? 8.8 : 7.1;
      framed = true;
    }
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(host);

  let raf, t = 0;
  const clock = new THREE.Clock();
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    if (!reduced) {
      clothMeshes.forEach((m, k) => {
        const pos = m.geometry.attributes.position, base = clothBases[k];
        for (let i = 0; i < pos.count; i++) {
          const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2];
          const sway = Math.sin(by * 2.2 + t * 1.6) * 0.016 + Math.sin(bx * 3 + t * 1.1) * 0.012;
          pos.array[i * 3] = bx + sway;
          pos.array[i * 3 + 2] = bz + Math.cos(by * 2.6 + t * 1.3) * 0.014;
        }
        pos.needsUpdate = true;
      });
    }
    controls.update();
    renderer.render(scene, camera);
  }
  frame();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else { clock.getDelta(); frame(); }
  });

  return {
    set(patch) {
      const typeChanged = patch.type && patch.type !== state.type;
      Object.assign(state, patch);
      applyMaterial();
      if (typeChanged) rebuild();
      if (patch.lighting) applyLighting();
      if ("autorotate" in patch) controls.autoRotate = patch.autorotate && !reduced;
    },
    snapshot() {
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL("image/png");
    },
    get state() { return { ...state }; },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); },
  };
}
