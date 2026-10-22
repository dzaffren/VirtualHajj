import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { ExtrudeGeometry, Group, Shape, Vector3 } from "three";
import { BaseScene } from "./BaseScene";
import { hajarAswad, hijr, lineLength } from "./mataf";
import { useScenePalette } from "./palette";
import { Pilgrim, type PilgrimPose } from "./Pilgrim";
import { useMediaQuery } from "./useMediaQuery";
import { useToken } from "./useToken";
import type { Point } from "./walk";

interface TawafSceneProps {
  hints: boolean;
  pose: RefObject<PilgrimPose>;
  target: RefObject<Point | null>;
  mistake: boolean;
  onTap?: (x: number, z: number) => void;
}

const out = Math.hypot(hajarAswad.x, hajarAswad.z);
const outward = Math.atan2(hajarAswad.x / out, hajarAswad.z / out);

export function HijrWall() {
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
export function HajarAswadLine({ hints }: { hints: boolean }) {
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

// A floor ring that follows a spot each frame, and hides while there is none.
function FloorRing({
  at,
  inner,
  outer,
  color,
  dot,
}: {
  at: RefObject<Point | null>;
  inner: number;
  outer: number;
  color: string;
  dot: boolean;
}) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const g = group.current!;
    g.visible = at.current !== null;
    if (at.current) g.position.set(at.current.x, 0.016, at.current.z);
  });
  return (
    <group ref={group} rotation-x={-Math.PI / 2}>
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
// The camera eases after the figure, and cuts with reduced motion.
function ThirdPersonCamera({ pose }: { pose: RefObject<PilgrimPose> }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const look = useRef<Vector3 | null>(null);
  const want = useMemo(() => ({ at: new Vector3(), look: new Vector3() }), []);
  useFrame(({ camera, size }, delta) => {
    const { x, z, facing } = pose.current;
    const portrait = size.width < size.height;
    const kaabahOnLeft = Math.cos(facing) * -x + -Math.sin(facing) * -z > 0;
    const angle = ((portrait ? 62 : 35) * Math.PI) / 180;
    const back = portrait ? 14 : 10;
    const turn = facing + (kaabahOnLeft ? angle : -angle);
    const dx = Math.sin(turn);
    const dz = Math.cos(turn);
    want.at.set(x - dx * back, 8, z - dz * back);
    want.look.set(x + dx * 4, 1, z + dz * 4);
    if (!look.current || reduced) {
      camera.position.copy(want.at);
      look.current = want.look.clone();
    } else {
      const k = 1 - Math.exp(-delta * 4);
      camera.position.lerp(want.at, k);
      look.current.lerp(want.look, k);
    }
    camera.lookAt(look.current);
  });
  return null;
}

// The mataf for tawaf: the base scene, the Hijr Ismail wall, the Hajar Aswad line and frame, and the pilgrim.
// A tap or click on the floor, the Kaabah or the wall gives the spot to walk to.
export function TawafScene({
  hints,
  pose,
  target,
  mistake,
  onTap,
}: TawafSceneProps) {
  const ink = useToken("--vh-ink");
  const mistakeColor = useToken("--vh-mistake");
  const tap = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onTap?.(e.point.x, e.point.z);
  };
  return (
    <>
      <group onPointerDown={onTap && tap}>
        <BaseScene />
        <HijrWall />
      </group>
      <HajarAswadLine hints={hints} />
      <Pilgrim pose={pose} />
      <FloorRing at={target} inner={0.42} outer={0.52} color={ink} dot />
      {mistake && (
        <FloorRing
          at={pose}
          inner={0.8}
          outer={0.92}
          color={mistakeColor}
          dot={false}
        />
      )}
      <ThirdPersonCamera pose={pose} />
    </>
  );
}
