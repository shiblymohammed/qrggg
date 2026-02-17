import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";

export default function FoodModel({ url, position }: any) {
  const gltf = useGLTF(url) as GLTF;
  return <primitive object={gltf.scene} position={position} scale={0.3} />;
}
