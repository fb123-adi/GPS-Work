"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, ContactShadows, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { ProductTone } from "@/lib/products";

/**
 * AURUM 3D Atelier viewer.
 *
 * Renders a real glTF garment model when `modelUrl` is supplied, otherwise a
 * procedural "material study" form. Studio lighting is hand-placed (no remote
 * HDRIs) so it renders offline and deterministically — the env CDN is blocked
 * in this environment anyway. OrbitControls let the user spin the piece; it
 * auto-rotates while idle. This is the brief's interactive "360° view".
 */

const toneToMaterial: Record<ProductTone, { color: string; metalness: number; roughness: number }> = {
  champagne: { color: "#C9A24B", metalness: 1, roughness: 0.22 },
  ink: { color: "#2A2622", metalness: 0.9, roughness: 0.3 },
  graphite: { color: "#6A635B", metalness: 0.95, roughness: 0.28 },
  olive: { color: "#5A5E3E", metalness: 0.85, roughness: 0.32 },
  oxblood: { color: "#6E322C", metalness: 0.85, roughness: 0.3 },
};

function ProceduralForm({ tone, autoRotate }: { tone: ProductTone; autoRotate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const accent = useRef<THREE.Mesh>(null);
  const mat = toneToMaterial[tone];

  useFrame((_, delta) => {
    if (autoRotate && group.current) group.current.rotation.y += delta * 0.25;
    if (accent.current) accent.current.rotation.x += delta * 0.6;
  });

  return (
    <group ref={group}>
      <mesh castShadow receiveShadow>
        <torusKnotGeometry args={[0.95, 0.3, 220, 32]} />
        <meshPhysicalMaterial
          color={mat.color}
          metalness={mat.metalness}
          roughness={mat.roughness}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          envMapIntensity={0.8}
        />
      </mesh>
      <mesh ref={accent} position={[1.7, 0.9, 0]} castShadow>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#A98343" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
}

function GltfModel({ url, autoRotate }: { url: string; autoRotate: boolean }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const group = useRef<THREE.Group>(null);

  // Center the model at the origin and normalise its size into the frame.
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    cloned.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    if (group.current) group.current.scale.setScalar(2.6 / maxDim);
  }, [cloned]);

  useFrame((_, delta) => {
    if (autoRotate && group.current) group.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={group} rotation={[0, -0.5, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

export default function Atelier3D({
  tone = "champagne",
  autoRotate = true,
  modelUrl,
  className,
}: {
  tone?: ProductTone;
  autoRotate?: boolean;
  modelUrl?: string;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.4, 5], fov: 32 }}
    >
      {/* Hand-placed studio rig (no network HDRIs) */}
      <hemisphereLight args={["#FAF7F0", "#1C1917", 0.6]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -2]} intensity={1} color="#E7DCC4" />
      <spotLight position={[-6, 2, 2]} angle={0.5} penumbra={1} intensity={36} color="#CA8A04" />
      <pointLight position={[0, -3, -4]} intensity={6} color="#FAF7F0" />

      <Float speed={1.3} rotationIntensity={0.35} floatIntensity={0.5}>
        {/* While the GLB streams, the procedural form holds the frame. */}
        <Suspense fallback={<ProceduralForm tone={tone} autoRotate={autoRotate} />}>
          {modelUrl ? (
            <GltfModel url={modelUrl} autoRotate={autoRotate} />
          ) : (
            <ProceduralForm tone={tone} autoRotate={autoRotate} />
          )}
        </Suspense>
      </Float>

      <ContactShadows position={[0, -1.6, 0]} opacity={0.5} scale={9} blur={2.6} far={4} color="#0C0A09" />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}

// Hint the loader so the model is ready the moment the viewer mounts.
useGLTF.preload("/models/aurum-sneaker.glb");
