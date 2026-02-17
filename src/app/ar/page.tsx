"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, useXRHitTest } from "@react-three/xr";
import { useRef } from "react";
import * as THREE from "three";

const store = createXRStore();

function Reticle() {
  const ref = useRef<THREE.Mesh>(null);

  useXRHitTest((results: XRHitTestResult[], getWorldMatrix: any) => {
    if (results.length > 0 && ref.current) {
      const hitMatrix = getWorldMatrix(results[0]);
      ref.current.visible = true;
      ref.current.matrix.copy(hitMatrix);
      ref.current.matrixAutoUpdate = false;
    } else if (ref.current) {
      ref.current.visible = false;
    }
  }, "viewer");

  return (
    <mesh ref={ref} visible={false}>
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function ARPage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button
        onClick={() => store.enterAR()}
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          padding: "12px 24px",
          background: "white",
          border: "none",
          borderRadius: "25px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Start AR
      </button>

      <Canvas>
        <XR store={store}>
          <ambientLight intensity={1} />
          
          {/* Test cube - always visible */}
          <mesh position={[0, 0, -1]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="red" />
          </mesh>

          {/* Reticle - shows on surfaces */}
          <Reticle />
        </XR>
      </Canvas>
    </div>
  );
}

