import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useHitTest() {
  const { gl } = useThree();
  const [reticleVisible, setReticleVisible] = useState(false);
  const reticleMatrix = useRef(new THREE.Matrix4());
  const hitTestSource = useRef<XRHitTestSource | null>(null);
  const viewerSpace = useRef<XRReferenceSpace | null>(null);

  useEffect(() => {
    const session = gl.xr.getSession();
    if (!session) return;

    session.requestReferenceSpace("viewer").then((space) => {
      viewerSpace.current = space;
      session.requestHitTestSource({ space }).then((source) => {
        hitTestSource.current = source;
      });
    });

    return () => {
      hitTestSource.current?.cancel();
      hitTestSource.current = null;
    };
  }, [gl]);

  useFrame((_, delta, frame) => {
    if (!frame || !hitTestSource.current) return;

    const referenceSpace = gl.xr.getReferenceSpace();
    const hitTestResults = frame.getHitTestResults(hitTestSource.current);

    if (hitTestResults.length > 0) {
      const hit = hitTestResults[0];
      const pose = hit.getPose(referenceSpace);

      if (pose) {
        reticleMatrix.current.fromArray(pose.transform.matrix);
        setReticleVisible(true);
      }
    } else {
      setReticleVisible(false);
    }
  });

  return { reticleMatrix, reticleVisible };
}
