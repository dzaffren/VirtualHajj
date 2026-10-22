import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import {
  Bone,
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SphereGeometry,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useScenePalette } from "./palette";

type Tone = "ihram" | "skin" | "hair";
type Shape = () => BufferGeometry;
type Piece = [shape: Shape, tone: Tone];
type Part = [name: string, parent: string | null, at: number[], ...Piece[]];

const capsule =
  (r: number, length: number, y: number): Shape =>
  () =>
    new CapsuleGeometry(r, length, 4, 16).translate(0, y, 0);
const sphere =
  (r: number, x: number, y: number, z: number): Shape =>
  () =>
    new SphereGeometry(r, 16, 10).translate(x, y, z);
const foot: Shape = () =>
  new BoxGeometry(0.1, 0.06, 0.22).translate(0, -0.01, 0.05);
// The izar: a white cloth from the waist to below the knee.
const izar: Shape = () =>
  new CylinderGeometry(0.19, 0.26, 0.62, 20).translate(0, -0.27, 0);

function side(s: "L" | "R", x: number): Part[] {
  return [
    [
      `shoulder${s}`,
      "chest",
      [x * 0.2, 0.26, 0],
      [sphere(0.08, 0, 0, 0), "ihram"],
    ],
    [
      `upperArm${s}`,
      `shoulder${s}`,
      [x * 0.04, 0, 0],
      [capsule(0.06, 0.2, -0.14), "ihram"],
    ],
    [
      `forearm${s}`,
      `upperArm${s}`,
      [0, -0.29, 0],
      [capsule(0.045, 0.18, -0.13), "skin"],
    ],
    [
      `hand${s}`,
      `forearm${s}`,
      [0, -0.26, 0],
      [sphere(0.05, 0, -0.05, 0), "skin"],
    ],
    [
      `thigh${s}`,
      "hips",
      [x * 0.1, -0.04, 0],
      [capsule(0.075, 0.3, -0.21), "ihram"],
    ],
    [
      `shin${s}`,
      `thigh${s}`,
      [0, -0.43, 0],
      [capsule(0.06, 0.3, -0.21), "skin"],
    ],
    [`foot${s}`, `shin${s}`, [0, -0.44, 0], [foot, "hair"]],
  ];
}

// The same 20 bones as the /perf figure, so /perf measures this one. The rida covers both shoulders: no idtiba' (D37).
const parts: Part[] = [
  ["root", null, [0, 0, 0]],
  ["hips", "root", [0, 0.95, 0], [izar, "ihram"]],
  ["spine", "hips", [0, 0.12, 0], [capsule(0.16, 0.12, 0.1), "ihram"]],
  ["chest", "spine", [0, 0.2, 0], [capsule(0.2, 0.16, 0.14), "ihram"]],
  ["neck", "chest", [0, 0.32, 0], [capsule(0.05, 0.06, 0.05), "skin"]],
  [
    "head",
    "neck",
    [0, 0.1, 0],
    [sphere(0.12, 0, 0.1, 0), "skin"],
    [sphere(0.125, 0, 0.13, -0.02), "hair"],
  ],
  ...side("L", 1),
  ...side("R", -1),
];

function buildPilgrim(tones: Record<Tone, string>) {
  const bones = new Map<string, Bone>();
  const world = new Map<string, Vector3>();
  const pieces: BufferGeometry[] = [];
  parts.forEach(([name, parent, at, ...shapes], index) => {
    const bone = new Bone();
    bone.name = name;
    bone.position.fromArray(at);
    const origin = bone.position.clone();
    if (parent) {
      bones.get(parent)!.add(bone);
      origin.add(world.get(parent)!);
    }
    bones.set(name, bone);
    world.set(name, origin);
    for (const [shape, tone] of shapes) {
      const g = shape().translate(origin.x, origin.y, origin.z);
      const n = g.getAttribute("position").count;
      const c = new Color(tones[tone]);
      g.setAttribute(
        "color",
        new Float32BufferAttribute(
          new Float32Array(n * 3).map((_, i) => [c.r, c.g, c.b][i % 3]),
          3,
        ),
      );
      g.setAttribute(
        "skinIndex",
        new Uint16BufferAttribute(
          new Uint16Array(n * 4).map((_, i) => (i % 4 === 0 ? index : 0)),
          4,
        ),
      );
      g.setAttribute(
        "skinWeight",
        new Float32BufferAttribute(
          new Float32Array(n * 4).map((_, i) => (i % 4 === 0 ? 1 : 0)),
          4,
        ),
      );
      pieces.push(g);
    }
  });
  const mesh = new SkinnedMesh(
    mergeGeometries(pieces),
    new MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }),
  );
  mesh.add(bones.get("root")!);
  mesh.bind(new Skeleton([...bones.values()]));
  mesh.frustumCulled = false;
  return { mesh, bones };
}

export interface PilgrimPose {
  x: number;
  z: number;
  facing: number;
  stride: number;
}

// A man in ihram, stylised with no face (D31, D37), with a ground shadow so white ihram reads on white marble.
// The pose comes from a ref each frame, so walking never re-renders React.
export function Pilgrim({ pose }: { pose: RefObject<PilgrimPose> }) {
  const p = useScenePalette();
  const group = useRef<Group>(null);
  const { mesh, bones } = useMemo(
    () => buildPilgrim({ ihram: p.ihram, skin: p.skin, hair: p.hair }),
    [p.ihram, p.skin, p.hair],
  );
  useFrame(() => {
    const { x, z, facing, stride } = pose.current;
    group.current!.position.set(x, 0, z);
    group.current!.rotation.y = facing;
    bones.get("thighL")!.rotation.x = stride;
    bones.get("thighR")!.rotation.x = -stride;
    bones.get("shinL")!.rotation.x = Math.max(0, stride) * 0.8;
    bones.get("shinR")!.rotation.x = Math.max(0, -stride) * 0.8;
    bones.get("upperArmL")!.rotation.x = -stride * 0.8;
    bones.get("upperArmR")!.rotation.x = stride * 0.8;
  });
  return (
    <group ref={group}>
      <primitive object={mesh} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial
          color={p.shadow}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
