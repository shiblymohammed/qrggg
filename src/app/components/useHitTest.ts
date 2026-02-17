import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useHitTest() {
  const { gl } = useThree();

  const reticleMatrix = useRef(new THREE.Matrix4());
  const hitTestSource = useRef<XRHitTestSource | null>(null);
  const referenceSpace = useRef<XRReferenceSpace | null>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const session = gl.xr.getSession();
    if (!session) return;

    let viewerSpace: XRReferenceSpace;

    const setupHitTest = async () => {
      referenceSpace.current =
        await session.requestReferenceSpace("local-floor");

      viewerSpace = await session.requestReferenceSpace("viewer");

      hitTestSource.current = await (session as any).requestHitTestSource({
        space: viewerSpace,
      });
    };

    setupHitTest();

    session.addEventListener("end", () => {
      hitTestSource.current = null;
    });

    return () => {
      hitTestSource.current?.cancel();
      hitTestSource.current = null;
    };
  }, [gl]);

  useFrame((state, delta, frame) => {
    if (!frame || !hitTestSource.current || !referenceSpace.current) return;

    const hitTestResults = frame.getHitTestResults(hitTestSource.current);

    if (hitTestResults.length > 0) {
      const hit = hitTestResults[0];
      const pose = hit.getPose(referenceSpace.current);

      if (pose) {
        reticleMatrix.current.fromArray(pose.transform.matrix);
        setVisible(true);
      }
    } else {
      setVisible(false);
    }
  });

  return { reticleMatrix, visible };
}
