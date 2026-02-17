"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useHitTest } from "./useHitTest";

export default function Reticle() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { reticleMatrix, visible } = useHitTest();

  useEffect(() => {
    if (!meshRef.current) return;

    meshRef.current.visible = visible;
    meshRef.current.matrix.fromArray(reticleMatrix.current.elements);
    meshRef.current.matrixAutoUpdate = false;
  }, [visible, reticleMatrix]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
    </mesh>
  );
}
