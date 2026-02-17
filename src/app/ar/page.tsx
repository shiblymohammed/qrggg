"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";

const store = createXRStore();

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
          <mesh position={[0, 0, -1]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </XR>
      </Canvas>
    </div>
  );
}

