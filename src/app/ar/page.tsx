"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, useXRHitTest } from "@react-three/xr";
import { useRef, useState } from "react";
import * as THREE from "three";
import FoodModel from "../components/FoodModel";

const store = createXRStore();

function Reticle({ onPlace }: any) {
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
    <mesh
      ref={ref}
      visible={false}
      onClick={() => {
        if (!ref.current) return;
        const position = new THREE.Vector3();
        position.setFromMatrixPosition(ref.current.matrix);
        onPlace(position);
      }}
    >
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function ARPage() {
  const [objects, setObjects] = useState<any[]>([]);
  const [selected, setSelected] = useState("burger");

  const addObject = (position: THREE.Vector3) => {
    setObjects([
      ...objects,
      {
        id: Date.now(),
        type: selected,
        position: position.toArray(),
      },
    ]);
  };

  return (
    <div className="w-screen h-screen bg-black relative">
      <button
        onClick={() => store.enterAR()}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full z-10"
      >
        Start AR
      </button>

      <Canvas>
        <XR store={store}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 10, 5]} intensity={1} />

          <Reticle onPlace={addObject} />

          {objects.map((obj: any) => (
            <FoodModel
              key={obj.id}
              url={`/models/${obj.type}.glb`}
              position={obj.position}
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
          onClick={() => {
            // Trigger reticle click programmatically
            const reticlePosition = new THREE.Vector3(0, 0, -1);
            addObject(reticlePosition);
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded-full"
        >
          Place
        </button>
      </div>
    </div>
  );
}

