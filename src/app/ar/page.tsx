"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState, useRef } from "react";
import * as THREE from "three";
import FoodModel from "../components/FoodModel";

const store = createXRStore();

export default function ARPage() {
  const [objects, setObjects] = useState<any[]>([]);
  const [selected, setSelected] = useState("burger");
  const [inAR, setInAR] = useState(false);

  const startAR = async () => {
    await store.enterAR();
    setInAR(true);
  };

  const placeObject = () => {
    // Place object 1.5 meters in front of camera
    setObjects([
      ...objects,
      {
        id: Date.now(),
        type: selected,
        position: [0, -0.5, -1.5],
      },
    ]);
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

