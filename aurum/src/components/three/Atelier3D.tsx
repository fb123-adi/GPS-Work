"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { ProductTone } from "@/lib/products";

/**
 * AURUM 3D Atelier viewer.
 *
 * A self-contained WebGL scene — studio lighting is hand-placed (no remote
 * HDRIs) so it renders offline and deterministically. It stands in as the
 * brief's "360° view": OrbitControls let the user spin the piece; auto-rotate
 * idles when untouched. Swap `<AtelierForm>` for a <primitive object={gltf}>
 * to drop in a real garment GLB later (see modelUrl note in ProductViewer).
 */

const toneToMaterial: Record<ProductTone, { color: string; metalness: number; roughness: number }> = {
  champagne: { color: "#C9A24B", metalness: 1, roughness: 0.22 },
  ink: { color: "#2A2622", metalness: 0.9, roughness: 0.3 },
  graphite: { color: "#6A635B", metalness: 0.95, roughness: 0.28 },
  olive: { color: "#5A5E3E", metalness: 0.85, roughness: 0.32 },
  oxblood: { color: "#6E322C", metalness: 0.85, roughness: 0.3 },
};

function AtelierForm({ tone, autoRotate }: { tone: ProductTone; autoRotate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const accent = useRef<THREE.Mesh>(null);
  const mat = toneToMaterial[tone];

  useFrame((_, delta) => {
    if (autoRotate && group.current) group.current.rotation.y += delta * 0.25;
    if (accent.current) accent.current.rotation.x += delta * 0.6;
  });

  return (
    <group ref={group}>
      {/* Hero form — a polished knot reads as a luxury material study */}
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

      {/* Orbiting brass accent */}
      <mesh ref={accent} position={[1.7, 0.9, 0]} castShadow>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#A98343" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
}

export default function Atelier3D({
  tone = "champagne",
  autoRotate = true,
  className,
}: {
  tone?: ProductTone;
  autoRotate?: boolean;
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
      {/* Hand-placed studio rig */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight position={[-6, 2, 2]} angle={0.5} penumbra={1} intensity={40} color="#CA8A04" />
      <pointLight position={[0, -3, -4]} intensity={8} color="#FAF7F0" />

      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
        <AtelierForm tone={tone} autoRotate={autoRotate} />
      </Float>

      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.5}
        scale={9}
        blur={2.6}
        far={4}
        color="#0C0A09"
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
