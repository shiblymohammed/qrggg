"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, useXRHitTest } from "@react-three/xr";
import { useState, useEffect, useRef } from "react";
import FoodModel from "../components/FoodModel";
import Reticle from "../components/Reticle";

const store = createXRStore();

function ARScene({ items, onReticlePosition }: any) {
  const reticleRef = useRef<any>(null);
  const [reticleVisible, setReticleVisible] = useState(false);

  useXRHitTest((results: any[], getWorldMatrix: any) => {
    if (results.length > 0 && reticleRef.current) {
      setReticleVisible(true);
      const hitMatrix = getWorldMatrix(results[0]);
      hitMatrix.decompose(
        reticleRef.current.position,
        reticleRef.current.quaternion,
        reticleRef.current.scale
      );
      onReticlePosition(reticleRef.current.position.toArray());
    } else {
      setReticleVisible(false);
    }
  }, "viewer");

  return (
    <>
      <ambientLight intensity={2} />
      <directionalLight position={[0, 10, 5]} intensity={2} />
      <pointLight position={[0, 2, 0]} intensity={1} />

      {reticleVisible && (
        <group ref={reticleRef}>
          <Reticle />
        </group>
      )}

      {items.map((item: any) => (
        <FoodModel
          key={item.id}
          url={`/models/${item.type}.glb`}
          position={item.position}
        />
      ))}

      {/* Always visible test cube to verify AR is working */}
      <mesh position={[0, 0, -1]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
      </mesh>

      {/* Another cube to the side */}
      <mesh position={[0.3, 0, -1]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="blue" emissive="blue" emissiveIntensity={0.5} />
      </mesh>
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

      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        gl={{ alpha: true }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
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
