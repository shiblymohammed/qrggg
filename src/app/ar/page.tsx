"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState, useRef } from "react";
import FoodModel from "../components/FoodModel";
import Reticle from "../components/Reticle";
import * as THREE from "three";

const store = createXRStore();

export default function ARPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState("burger");
  const reticleRef = useRef<THREE.Mesh>(null);

  const placeItem = () => {
    if (!reticleRef.current) return;

    const position = new THREE.Vector3();
    position.setFromMatrixPosition(reticleRef.current.matrix);

    setItems([
      ...items,
      {
        id: Date.now(),
        type: selected,
        position: position.toArray(),
      },
    ]);
  };

  const handleStartAR = async () => {
    try {
      await store.enterAR();
    } catch (error) {
      console.error("AR Error:", error);
      alert(`AR Error: ${error}`);
    }
  };

  return (
    <div className="w-screen h-screen bg-black relative">
      <button
        onClick={handleStartAR}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full z-10"
      >
        Start AR
      </button>

      <Canvas
        gl={{ alpha: true }}
        onCreated={({ gl }) => {
          // Configure XR session to request hit-test
          const originalRequestSession = navigator.xr?.requestSession.bind(navigator.xr);
          if (navigator.xr && originalRequestSession) {
            (navigator.xr as any).requestSession = function (mode: XRSessionMode, options?: any) {
              const enhancedOptions = {
                ...options,
                requiredFeatures: [...(options?.requiredFeatures || []), "hit-test"],
                optionalFeatures: [...(options?.optionalFeatures || []), "dom-overlay", "local-floor"],
              };
              return originalRequestSession(mode, enhancedOptions);
            };
          }
        }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <XR store={store}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 10, 5]} intensity={1} />

          {/* Test cube - should always be visible */}
          <mesh position={[0, 0, -1]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial color="red" />
          </mesh>

          <Reticle />

          {items.map((item: any) => (
            <FoodModel
              key={item.id}
              url={`/models/${item.type}.glb`}
              position={item.position}
            />
          ))}
        </XR>
      </Canvas>

      {/* Category Bar */}
      <div className="absolute bottom-40 w-full flex justify-center gap-6 text-white">
        <span className="text-blue-500">Fast Food</span>
        <span>Desserts</span>
        <span>Drinks</span>
      </div>

      {/* Food Selection Cards */}
      <div className="absolute bottom-24 w-full flex justify-center gap-4 overflow-x-auto px-6">
        <button
          onClick={() => setSelected("burger")}
          className={`px-4 py-2 rounded-lg ${
            selected === "burger" ? "bg-blue-500" : "bg-gray-700"
          } text-white`}
        >
          🍔 Burger
        </button>

        <button
          onClick={() => setSelected("pizza")}
          className={`px-4 py-2 rounded-lg ${
            selected === "pizza" ? "bg-blue-500" : "bg-gray-700"
          } text-white`}
        >
          🍕 Pizza
        </button>
      </div>

      {/* Place Button */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <button
          onClick={placeItem}
          className="bg-blue-500 text-white px-6 py-3 rounded-full"
        >
          Place
        </button>
      </div>
    </div>
  );
}
