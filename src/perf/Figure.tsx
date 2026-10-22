import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import {
  Bone,
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SphereGeometry,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useScenePalette } from "../scene/palette";

type Shape = () => BufferGeometry;
type Part = [name: string, parent: string | null, at: number[], shape?: Shape];

const capsule =
  (r: number, length: number, y: number): Shape =>
  () =>
    new CapsuleGeometry(r, length, 4, 16).translate(0, y, 0);
const sphere =
  (r: number, y: number): Shape =>
  () =>
    new SphereGeometry(r, 16, 10).translate(0, y, 0);
const foot: Shape = () =>
  new BoxGeometry(0.1, 0.06, 0.22).translate(0, -0.01, 0.05);

function side(s: "L" | "R", x: number): Part[] {
  return [
    [`shoulder${s}`, "chest", [x * 0.2, 0.26, 0], sphere(0.07, 0)],
    [
      `upperArm${s}`,
      `shoulder${s}`,
      [x * 0.04, 0, 0],
      capsule(0.05, 0.2, -0.14),
    ],
    [`forearm${s}`, `upperArm${s}`, [0, -0.29, 0], capsule(0.045, 0.18, -0.13)],
    [`hand${s}`, `forearm${s}`, [0, -0.26, 0], sphere(0.05, -0.05)],
    [`thigh${s}`, "hips", [x * 0.1, -0.04, 0], capsule(0.075, 0.3, -0.21)],
    [`shin${s}`, `thigh${s}`, [0, -0.43, 0], capsule(0.06, 0.3, -0.21)],
    [`foot${s}`, `shin${s}`, [0, -0.44, 0], foot],
  ];
}

// 20 bones: a root, hips, spine, chest, neck, head, and seven a side.
const parts: Part[] = [
  ["root", null, [0, 0, 0]],
  ["hips", "root", [0, 0.95, 0], capsule(0.15, 0.1, 0)],
  ["spine", "hips", [0, 0.12, 0], capsule(0.14, 0.12, 0.1)],
  ["chest", "spine", [0, 0.2, 0], capsule(0.18, 0.16, 0.14)],
  ["neck", "chest", [0, 0.32, 0], capsule(0.05, 0.06, 0.05)],
  ["head", "neck", [0, 0.1, 0], sphere(0.12, 0.1)],
  ...side("L", 1),
  ...side("R", -1),
];

// Each part's vertices are weighted fully to its own bone.
function buildFigure(color: string) {
  const bones = new Map<string, Bone>();
  const world = new Map<string, Vector3>();
  const pieces: BufferGeometry[] = [];
  parts.forEach(([name, parent, at, shape], index) => {
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
    if (!shape) return;
    const g = shape().translate(origin.x, origin.y, origin.z);
    const n = g.getAttribute("position").count;
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
  });
  const mesh = new SkinnedMesh(
    mergeGeometries(pieces),
    new MeshStandardMaterial({ color, roughness: 0.95 }),
  );
  mesh.add(bones.get("root")!);
  mesh.bind(new Skeleton([...bones.values()]));
  mesh.frustumCulled = false;
  return { mesh, bones };
}

// Walks anticlockwise round the Kaabah, so the Kaabah stays on the figure's left, as in tawaf.
export function Figure() {
  const { ihram } = useScenePalette();
  const { mesh, bones } = useMemo(() => buildFigure(ihram), [ihram]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const a = -t * 0.12;
    mesh.position.set(Math.cos(a) * 10, 0, Math.sin(a) * 10);
    mesh.rotation.y = Math.atan2(Math.sin(a), -Math.cos(a));
    const swing = Math.sin(t * 5) * 0.5;
    bones.get("thighL")!.rotation.x = swing;
    bones.get("thighR")!.rotation.x = -swing;
    bones.get("shinL")!.rotation.x = Math.max(0, swing) * 0.8;
    bones.get("shinR")!.rotation.x = Math.max(0, -swing) * 0.8;
    bones.get("upperArmL")!.rotation.x = -swing * 0.8;
    bones.get("upperArmR")!.rotation.x = swing * 0.8;
  });
  return <primitive object={mesh} />;
}
