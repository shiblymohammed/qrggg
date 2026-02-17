"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, useXRHitTest } from "@react-three/xr";
import { useState, useEffect, useRef } from "react";
import FoodModel from "../components/FoodModel";
import Reticle from "../components/Reticle";
import type { Matrix4 } from "three";

const store = createXRStore();

function ARScene({ items, onReticlePosition }: any) {
  const reticleRef = useRef<any>(null);

  useXRHitTest((results: any[], getWorldMatrix: any) => {
    if (results.length > 0 && reticleRef.current) {
      const hitMatrix = getWorldMatrix(results[0]);
      hitMatrix.decompose(
        reticleRef.current.position,
        reticleRef.current.quaternion,
        reticleRef.current.scale
      );
      onReticlePosition(reticleRef.current.position.toArray());
    }
  }, "viewer");

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      <group ref={reticleRef}>
        <Reticle />
      </group>

      {items.map((item: any) => (
        <FoodModel
          key={item.id}
          url={`/models/${item.type}.glb`}
          position={item.position}
        />
      ))}
    </>
  );
}

export default function ARPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState("burger");
  const [arSupported, setArSupported] = useState(true);
  const [reticlePosition, setReticlePosition] = useState([0, 0, -1]);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
        setArSupported(supported);
      });
    } else {
      setArSupported(false);
    }
  }, []);

  const placeItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        type: selected,
        position: [...reticlePosition],
      },
    ]);
  };

  const handleStartAR = async () => {
    try {
      await store.enterAR();
    } catch (error) {
      console.error("AR Error:", error);
      alert("AR not available. Make sure you're using Chrome on Android with ARCore support.");
    }
  };

  return (
    <div className="w-screen h-screen bg-black relative">
      <button
        onClick={handleStartAR}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full z-10"
      >
        {arSupported ? "Start AR" : "AR Not Supported"}
      </button>

      <Canvas>
        <XR store={store}>
          <ARScene items={items} onReticlePosition={setReticlePosition} />
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
