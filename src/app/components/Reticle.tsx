"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useHitTest } from "./useHitTest";

export default function Reticle() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { reticleMatrix, reticleVisible } = useHitTest();

  if (meshRef.current) {
    meshRef.current.visible = reticleVisible;
    meshRef.current.matrix.copy(reticleMatrix.current);
    meshRef.current.matrixAutoUpdate = false;
  }

  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} transparent opacity={0.8} />
    </mesh>
  );
}
