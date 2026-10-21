import { useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { useScenePalette } from "./palette";

function kiswahTexture(kiswah: string, band: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = kiswah;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = band;
  g.fillRect(0, 76, 256, 16);
  g.globalAlpha = 0.05;
  for (let x = 0; x < 256; x += 4) g.fillRect(x, 0, 1, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Sky, light, ground and the 11 x 13 x 12 m Kaabah, shared by every page.
export function BaseScene() {
  const p = useScenePalette();
  const kiswah = useMemo(
    () => kiswahTexture(p.kiswah, p.kiswahBand),
    [p.kiswah, p.kiswahBand],
  );
  return (
    <>
      <color attach="background" args={[p.sky]} />
      <hemisphereLight args={["#ffffff", p.ground, p.hemisphere]} />
      <directionalLight position={[30, 50, 20]} intensity={p.sun} />
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[90, 64]} />
        <meshStandardMaterial color={p.ground} roughness={0.85} />
      </mesh>
      <mesh position-y={6.5}>
        <boxGeometry args={[11, 13, 12]} />
        <meshStandardMaterial
          attach="material-0"
          map={kiswah}
          roughness={0.9}
        />
        <meshStandardMaterial
          attach="material-1"
          map={kiswah}
          roughness={0.9}
        />
        <meshStandardMaterial
          attach="material-2"
          color={p.kiswah}
          roughness={0.9}
        />
        <meshStandardMaterial
          attach="material-3"
          color={p.kiswah}
          roughness={0.9}
        />
        <meshStandardMaterial
          attach="material-4"
          map={kiswah}
          roughness={0.9}
        />
        <meshStandardMaterial
          attach="material-5"
          map={kiswah}
          roughness={0.9}
        />
      </mesh>
    </>
  );
}
