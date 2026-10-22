import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { BaseScene } from "./BaseScene";
import { hajarAswad, hijr, lineLength } from "./mataf";
import { useScenePalette } from "./palette";
import { Pilgrim } from "./Pilgrim";
import { useToken } from "./useToken";

export interface PilgrimPose {
  x: number;
  z: number;
  facing: number;
  stride: number;
}

interface TawafSceneProps {
  hints: boolean;
  pilgrim: PilgrimPose;
  tap: { x: number; z: number } | null;
  mistake: boolean;
}

const out = Math.hypot(hajarAswad.x, hajarAswad.z);
const outward = Math.atan2(hajarAswad.x / out, hajarAswad.z / out);

function HijrWall() {
  const p = useScenePalette();
  const geometry = useMemo(() => {
    const { faceZ, radius, halfSpan, thickness, height } = hijr;
    const shape = new Shape();
    const steps = 32;
    // Shape y is world -z, because the mesh turns the shape flat onto the floor.
    const at = (r: number, i: number) => {
      const a = -halfSpan + (2 * halfSpan * i) / steps;
      return [r * Math.sin(a), -faceZ + r * Math.cos(a)] as const;
    };
    shape.moveTo(...at(radius + thickness / 2, 0));
    for (let i = 1; i <= steps; i++)
      shape.lineTo(...at(radius + thickness / 2, i));
    for (let i = steps; i >= 0; i--)
      shape.lineTo(...at(radius - thickness / 2, i));
    return new ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
  }, []);
  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2}>
      <meshStandardMaterial color={p.hijrWall} roughness={0.6} />
    </mesh>
  );
}

// The line from the Hajar Aswad corner across the mataf. With hints on it glows in the accent; with hints off it is a plain marking.
function HajarAswadLine({ hints }: { hints: boolean }) {
  const p = useScenePalette();
  const accent = useToken("--vh-accent");
  const accentInk = useToken("--vh-accent-ink");
  const band = (width: number, color: string, opacity: number, y: number) => (
    <mesh rotation-x={-Math.PI / 2} position={[0, y, lineLength / 2]}>
      <planeGeometry args={[width, lineLength]} />
      <meshBasicMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
  return (
    <group position={[hajarAswad.x, 0, hajarAswad.z]} rotation-y={outward}>
      {hints ? (
        <>
          {band(1.4, accent, 0.55, 0.012)}
          {band(0.25, accentInk, 1, 0.014)}
        </>
      ) : (
        band(0.3, p.lineMark, 1, 0.012)
      )}
      <mesh position={[0, 1.5, 0.05]}>
        <torusGeometry args={[0.28, 0.07, 12, 32]} />
        <meshStandardMaterial
          color={p.stoneFrame}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function FloorRing({
  x,
  z,
  inner,
  outer,
  color,
  dot,
}: {
  x: number;
  z: number;
  inner: number;
  outer: number;
  color: string;
  dot: boolean;
}) {
  return (
    <group position={[x, 0.016, z]} rotation-x={-Math.PI / 2}>
      <mesh>
        <ringGeometry args={[inner, outer, 48]} />
        <meshBasicMaterial color={color} depthWrite={false} />
      </mesh>
      {dot && (
        <mesh>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={color} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// Third person: behind and above the figure, turned towards the Kaabah so it stays in frame.
// A portrait phone sees about 24° across, so it turns further and stands further back.
// Walking the wrong way, the turn goes right, and the learner sees the Kaabah on that side.
function ThirdPersonCamera({ x, z, facing }: PilgrimPose) {
  const camera = useThree((s) => s.camera);
  const portrait = useThree((s) => s.size.width < s.size.height);
  useLayoutEffect(() => {
    const kaabahOnLeft = Math.cos(facing) * -x + -Math.sin(facing) * -z > 0;
    const angle = ((portrait ? 62 : 35) * Math.PI) / 180;
    const back = portrait ? 14 : 10;
    const turn = facing + (kaabahOnLeft ? angle : -angle);
    const dx = Math.sin(turn);
    const dz = Math.cos(turn);
    camera.position.set(x - dx * back, 8, z - dz * back);
    camera.lookAt(x + dx * 4, 1, z + dz * 4);
  }, [camera, portrait, x, z, facing]);
  return null;
}

// The mataf for tawaf: the base scene, the Hijr Ismail wall, the Hajar Aswad line and frame, and the pilgrim.
export function TawafScene({ hints, pilgrim, tap, mistake }: TawafSceneProps) {
  const ink = useToken("--vh-ink");
  const mistakeColor = useToken("--vh-mistake");
  return (
    <>
      <BaseScene />
      <HijrWall />
      <HajarAswadLine hints={hints} />
      <Pilgrim {...pilgrim} />
      {tap && <FloorRing {...tap} inner={0.42} outer={0.52} color={ink} dot />}
      {mistake && (
        <FloorRing
          x={pilgrim.x}
          z={pilgrim.z}
          inner={0.8}
          outer={0.92}
          color={mistakeColor}
          dot={false}
        />
      )}
      <ThirdPersonCamera {...pilgrim} />
    </>
  );
}
