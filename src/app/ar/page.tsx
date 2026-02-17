"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, useXRHitTest } from "@react-three/xr";
import { useState, useRef, useCallback } from "react";
import * as THREE from "three";
import FoodModel from "../components/FoodModel";

const store = createXRStore();

function Reticle({ onPositionUpdate }: { onPositionUpdate: (pos: THREE.Vector3) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const lastPosition = useRef(new THREE.Vector3());

  useXRHitTest((results: XRHitTestResult[], getWorldMatrix: any) => {
    if (results.length > 0 && ref.current) {
      const hitMatrix = getWorldMatrix(results[0]);
      ref.current.visible = true;
      ref.current.matrix.copy(hitMatrix);
      ref.current.matrixAutoUpdate = false;

      // Update position for placement
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(hitMatrix);
      lastPosition.current.copy(position);
      onPositionUpdate(position);
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
  const [objects, setObjects] = useState<any[]>([]);
  const [selected, setSelected] = useState("burger");
  const [inAR, setInAR] = useState(false);
  const [reticlePosition, setReticlePosition] = useState<THREE.Vector3 | null>(null);
  const [surfaceDetected, setSurfaceDetected] = useState(false);

  const startAR = async () => {
    await store.enterAR();
    setInAR(true);
  };

  const handlePositionUpdate = useCallback((pos: THREE.Vector3) => {
    setReticlePosition(pos);
    setSurfaceDetected(true);
  }, []);

  const placeObject = () => {
    if (reticlePosition) {
      // Place at reticle position
      setObjects([
        ...objects,
        {
          id: Date.now(),
          type: selected,
          position: reticlePosition.toArray(),
        },
      ]);
    } else {
      // Fallback: place in front of camera
      setObjects([
        ...objects,
        {
          id: Date.now(),
          type: selected,
          position: [0, -0.5, -1.5],
        },
      ]);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      {!inAR && (
        <button
          onClick={startAR}
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
      )}

      {/* Surface detection indicator */}
      {inAR && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            padding: "8px 16px",
            background: surfaceDetected ? "rgba(0, 255, 0, 0.8)" : "rgba(255, 165, 0, 0.8)",
            color: "white",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {surfaceDetected ? "✓ Surface Detected" : "Scan floor..."}
        </div>
      )}

      {/* Food Selection */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setSelected("burger")}
          style={{
            padding: "10px 20px",
            background: selected === "burger" ? "#3b82f6" : "#4b5563",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
          }}
        >
          🍔 Burger
        </button>
        <button
          onClick={() => setSelected("pizza")}
          style={{
            padding: "10px 20px",
            background: selected === "pizza" ? "#3b82f6" : "#4b5563",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
          }}
        >
          🍕 Pizza
        </button>
      </div>

      {/* Place Button */}
      <button
        onClick={placeObject}
        style={{
          position: "absolute",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          padding: "15px 30px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "25px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Place
      </button>

      <Canvas frameloop="demand">
        <XR store={store}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 10, 5]} intensity={1} />

          {/* Reticle for surface detection */}
          {inAR && <Reticle onPositionUpdate={handlePositionUpdate} />}

          {objects.map((obj: any) => (
            <FoodModel
              key={obj.id}
              url={`/models/${obj.type}.glb`}
              position={obj.position}
            />
          ))}
        </XR>
      </Canvas>
    </div>
  );
}
