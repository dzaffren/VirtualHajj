import { useMemo } from "react";
import { CylinderGeometry, MeshStandardMaterial } from "three";
import { useScenePalette } from "../scene/palette";

// 100 columns of 1,980 triangles each, in two rings round the Kaabah. Culling is off, so the load never changes with the camera angle.
export function StressLoad() {
  const { ground } = useScenePalette();
  const geometry = useMemo(() => new CylinderGeometry(0.6, 0.6, 8, 90, 10), []);
  const material = useMemo(
    () => new MeshStandardMaterial({ color: ground, roughness: 0.7 }),
    [ground],
  );
  return (
    <>
      {Array.from({ length: 100 }, (_, i) => {
        const a = ((i % 50) / 50) * Math.PI * 2;
        const r = i < 50 ? 36 : 44;
        return (
          <mesh
            key={i}
            geometry={geometry}
            material={material}
            position={[Math.cos(a) * r, 4, Math.sin(a) * r]}
            frustumCulled={false}
          />
        );
      })}
    </>
  );
}
